'use client';
import React, { useMemo } from 'react';

// ═══════ REAL QR Code Generator (ISO 18004) ═══════
// Version 1-4, Error correction L, Byte mode
// No external dependencies

const EC_L = [7, 10, 15, 20]; // EC codewords per version 1-4
const SIZES = [21, 25, 29, 33]; // Module count per version 1-4
const CAPS = [17, 32, 53, 78]; // Byte capacity per version 1-4 (EC level L)

function pickVersion(len: number): number {
  for (let v = 0; v < 4; v++) if (len <= CAPS[v]) return v;
  return 3;
}

// GF(256) arithmetic for Reed-Solomon
const GF_EXP = new Uint8Array(512);
const GF_LOG = new Uint8Array(256);
(function initGF() {
  let x = 1;
  for (let i = 0; i < 255; i++) {
    GF_EXP[i] = x;
    GF_LOG[x] = i;
    x = (x << 1) ^ (x >= 128 ? 0x11d : 0);
  }
  for (let i = 255; i < 512; i++) GF_EXP[i] = GF_EXP[i - 255];
})();

function gfMul(a: number, b: number): number {
  return a === 0 || b === 0 ? 0 : GF_EXP[GF_LOG[a] + GF_LOG[b]];
}

function rsEncode(data: number[], ecLen: number): number[] {
  const gen: number[] = new Array(ecLen + 1).fill(0);
  gen[0] = 1;
  for (let i = 0; i < ecLen; i++) {
    for (let j = i + 1; j >= 1; j--) {
      gen[j] = gen[j - 1] ^ gfMul(gen[j], GF_EXP[i]);
    }
    gen[0] = gfMul(gen[0], GF_EXP[i]);
  }
  const msg = [...data, ...new Array(ecLen).fill(0)];
  for (let i = 0; i < data.length; i++) {
    const coef = msg[i];
    if (coef !== 0) {
      for (let j = 0; j <= ecLen; j++) {
        msg[i + j] ^= gfMul(gen[j], coef);
      }
    }
  }
  return msg.slice(data.length);
}

function encodeData(text: string, ver: number): number[] {
  const totalBytes = SIZES[ver] * SIZES[ver]; // not exact but enough
  const ecCount = EC_L[ver];
  const bytes = new TextEncoder().encode(text);
  
  // Mode indicator (0100 = byte) + character count
  const bits: number[] = [];
  // Byte mode indicator
  bits.push(0, 1, 0, 0);
  // Character count (8 bits for v1-9)
  const len = bytes.length;
  for (let i = 7; i >= 0; i--) bits.push((len >> i) & 1);
  // Data
  for (const b of bytes) {
    for (let i = 7; i >= 0; i--) bits.push((b >> i) & 1);
  }
  // Terminator
  for (let i = 0; i < 4 && bits.length < (CAPS[ver] + ecCount) * 8; i++) bits.push(0);
  // Pad to byte
  while (bits.length % 8 !== 0) bits.push(0);
  
  // Convert to bytes
  const dataBytes: number[] = [];
  for (let i = 0; i < bits.length; i += 8) {
    let b = 0;
    for (let j = 0; j < 8; j++) b = (b << 1) | (bits[i + j] || 0);
    dataBytes.push(b);
  }
  // Pad bytes
  const dataCapacity = CAPS[ver];
  let pad = 0xEC;
  while (dataBytes.length < dataCapacity) {
    dataBytes.push(pad);
    pad = pad === 0xEC ? 0x11 : 0xEC;
  }
  dataBytes.length = dataCapacity;
  
  // Reed-Solomon
  const ec = rsEncode(dataBytes, ecCount);
  return [...dataBytes, ...ec];
}

function createMatrix(text: string): boolean[][] {
  const ver = pickVersion(new TextEncoder().encode(text).length);
  const size = SIZES[ver];
  const m: boolean[][] = Array.from({ length: size }, () => Array(size).fill(false));
  const reserved: boolean[][] = Array.from({ length: size }, () => Array(size).fill(false));

  // ─── Finder patterns ───
  function drawFinder(r: number, c: number) {
    for (let dr = -1; dr <= 7; dr++) for (let dc = -1; dc <= 7; dc++) {
      const rr = r + dr, cc = c + dc;
      if (rr < 0 || cc < 0 || rr >= size || cc >= size) continue;
      const inOuter = dr >= 0 && dr <= 6 && dc >= 0 && dc <= 6;
      const inInner = dr >= 2 && dr <= 4 && dc >= 2 && dc <= 4;
      const onBorder = dr === 0 || dr === 6 || dc === 0 || dc === 6;
      m[rr][cc] = inOuter && (onBorder || inInner);
      reserved[rr][cc] = true;
    }
  }
  drawFinder(0, 0);
  drawFinder(0, size - 7);
  drawFinder(size - 7, 0);

  // ─── Timing patterns ───
  for (let i = 8; i < size - 8; i++) {
    m[6][i] = m[i][6] = i % 2 === 0;
    reserved[6][i] = reserved[i][6] = true;
  }

  // ─── Alignment pattern (version 2+) ───
  if (ver >= 1) {
    const pos = size - 7;
    for (let dr = -2; dr <= 2; dr++) for (let dc = -2; dc <= 2; dc++) {
      const rr = pos + dr, cc = pos + dc;
      if (reserved[rr]?.[cc]) continue;
      m[rr][cc] = Math.abs(dr) === 2 || Math.abs(dc) === 2 || (dr === 0 && dc === 0);
      reserved[rr][cc] = true;
    }
  }

  // ─── Dark module ───
  m[size - 8][8] = true;
  reserved[size - 8][8] = true;

  // ─── Reserve format info areas ───
  for (let i = 0; i < 9; i++) {
    if (i < size) { reserved[8][i] = true; reserved[i][8] = true; }
  }
  for (let i = 0; i < 8; i++) {
    reserved[8][size - 8 + i] = true;
    reserved[size - 8 + i][8] = true;
  }

  // ─── Place data ───
  const codewords = encodeData(text, ver);
  const allBits: number[] = [];
  for (const b of codewords) {
    for (let i = 7; i >= 0; i--) allBits.push((b >> i) & 1);
  }

  let bitIdx = 0;
  let upward = true;
  for (let col = size - 1; col >= 0; col -= 2) {
    if (col === 6) col = 5; // Skip timing column
    const rows = upward ? Array.from({ length: size }, (_, i) => size - 1 - i) : Array.from({ length: size }, (_, i) => i);
    for (const row of rows) {
      for (const dc of [0, -1]) {
        const c = col + dc;
        if (c < 0 || reserved[row][c]) continue;
        if (bitIdx < allBits.length) {
          m[row][c] = allBits[bitIdx] === 1;
          bitIdx++;
        }
      }
    }
    upward = !upward;
  }

  // ─── Apply mask (pattern 0: (row + col) % 2 === 0) ───
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (!reserved[r][c] && (r + c) % 2 === 0) {
        m[r][c] = !m[r][c];
      }
    }
  }

  // ─── Format info (EC level L, mask 0) ───
  const fmtBits = 0x77c4; // Pre-computed for L, mask 0
  for (let i = 0; i < 15; i++) {
    const bit = ((fmtBits >> (14 - i)) & 1) === 1;
    // Around top-left finder
    if (i < 6) m[8][i] = bit;
    else if (i === 6) m[8][7] = bit;
    else if (i === 7) m[8][8] = bit;
    else if (i === 8) m[7][8] = bit;
    else m[14 - i][8] = bit;
    // Second copy
    if (i < 8) m[size - 1 - i][8] = bit;
    else m[8][size - 15 + i] = bit;
  }

  return m;
}

// ═══════ SVG Renderer ═══════

interface QRProps {
  data: string;
  size?: number;
  logo?: boolean;
}

export default function QRCode({ data, size = 200, logo = true }: QRProps) {
  const matrix = useMemo(() => {
    try { return createMatrix(data || 'https://github.com/Zendan-ui/z-ui'); }
    catch { return createMatrix('z-ui'); }
  }, [data]);

  const n = matrix.length;
  const cs = size / (n + 2); // +2 for quiet zone
  const offset = cs; // quiet zone

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ borderRadius: 12 }}>
      <defs>
        <linearGradient id="qrg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--accent-1, #00b4ff)" />
          <stop offset="100%" stopColor="var(--accent-2, #7c3aed)" />
        </linearGradient>
      </defs>

      {/* White background */}
      <rect width={size} height={size} fill="white" rx={12} />

      {/* QR modules as rounded squares */}
      {matrix.map((row, ri) =>
        row.map((cell, ci) => {
          if (!cell) return null;
          const x = offset + ci * cs;
          const y = offset + ri * cs;
          const r = cs * 0.15; // corner radius
          return (
            <rect key={`${ri}-${ci}`} x={x} y={y} width={cs - 0.5} height={cs - 0.5} rx={r} fill="#1a1a2e" />
          );
        })
      )}

      {/* Center logo */}
      {logo && (
        <g>
          <rect x={size * 0.38} y={size * 0.38} width={size * 0.24} height={size * 0.24} rx={size * 0.04} fill="white" />
          <rect x={size * 0.39} y={size * 0.39} width={size * 0.22} height={size * 0.22} rx={size * 0.035} fill="url(#qrg)" />
          <text x={size / 2} y={size / 2 + size * 0.035} textAnchor="middle" fontSize={size * 0.1} fontWeight="900" fill="white" fontFamily="system-ui">Z</text>
        </g>
      )}
    </svg>
  );
}
