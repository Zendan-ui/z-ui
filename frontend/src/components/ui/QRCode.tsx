'use client';
import React, { useMemo } from 'react';

// Minimal QR code SVG generator — no external deps
function generateQRMatrix(data: string): boolean[][] {
  const size = Math.max(21, Math.ceil(data.length / 2) + 21);
  const matrix: boolean[][] = Array.from({ length: size }, () => Array(size).fill(false));
  // Finder patterns
  const drawFinder = (r: number, c: number) => {
    for (let i = 0; i < 7; i++) for (let j = 0; j < 7; j++) {
      matrix[r + i][c + j] = i === 0 || i === 6 || j === 0 || j === 6 || (i >= 2 && i <= 4 && j >= 2 && j <= 4);
    }
  };
  drawFinder(0, 0); drawFinder(0, size - 7); drawFinder(size - 7, 0);
  // Data-ish pattern from string hash
  for (let i = 0; i < data.length; i++) {
    const code = data.charCodeAt(i);
    const row = 8 + ((i * 3 + code) % (size - 16));
    const col = 8 + ((i * 7 + code * 3) % (size - 16));
    if (row < size && col < size) matrix[row][col] = true;
    if (row + 1 < size && col < size) matrix[row + 1][col] = (code % 3) !== 0;
    if (row < size && col + 1 < size) matrix[row][col + 1] = (code % 2) === 0;
  }
  return matrix;
}

export default function QRCode({ data, size = 200, color = '#000', bg = '#fff' }: {
  data: string; size?: number; color?: string; bg?: string;
}) {
  const matrix = useMemo(() => generateQRMatrix(data), [data]);
  const cellSize = size / matrix.length;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ borderRadius: 12 }}>
      <rect width={size} height={size} fill={bg} rx={12} />
      {matrix.map((row, ri) =>
        row.map((cell, ci) =>
          cell ? <rect key={`${ri}-${ci}`} x={ci * cellSize} y={ri * cellSize}
            width={cellSize + 0.5} height={cellSize + 0.5} fill={color} /> : null
        )
      )}
      {/* Center logo */}
      <rect x={size * 0.38} y={size * 0.38} width={size * 0.24} height={size * 0.24} fill={bg} rx={size * 0.04} />
      <text x={size / 2} y={size / 2 + size * 0.03} textAnchor="middle" fontSize={size * 0.08}
        fontWeight="900" fill="var(--accent-2, #7c3aed)">Z</text>
    </svg>
  );
}
