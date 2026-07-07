import axios from 'axios';

export interface Msg<T = unknown> {
  success: boolean;
  msg: string;
  obj: T;
}

interface RequestOptions {
  silent?: boolean;
}

export class HttpUtil {
  static async get<T = unknown>(url: string, _params?: unknown, _opts?: RequestOptions): Promise<Msg<T>> {
    const res = await axios.get<Msg<T>>(url, { params: _params });
    return res.data;
  }

  static async post<T = unknown>(url: string, data?: unknown, _opts?: RequestOptions): Promise<Msg<T>> {
    const res = await axios.post<Msg<T>>(url, data);
    return res.data;
  }
}

const KB = 1024;
const MB = KB * 1024;
const GB = MB * 1024;
const TB = GB * 1024;

export class SizeFormatter {
  static readonly ONE = GB;

  static sizeFormat(bytes: number, precision = 2): string {
    if (bytes < 0) return '0 B';
    if (bytes < KB) return `${bytes} B`;
    if (bytes < MB) return `${(bytes / KB).toFixed(precision)} KB`;
    if (bytes < GB) return `${(bytes / MB).toFixed(precision)} MB`;
    if (bytes < TB) return `${(bytes / GB).toFixed(precision)} GB`;
    return `${(bytes / TB).toFixed(precision)} TB`;
  }

  static speedFormat(bytesPerSec: number, precision = 1): string {
    return `${SizeFormatter.sizeFormat(bytesPerSec, precision)}/s`;
  }
}

export class NumberFormatter {
  static toFixed(value: number, decimals: number): number {
    return parseFloat(value.toFixed(decimals));
  }
}

export class ObjectUtil {
  static cloneProps<T extends object>(target: T, source: unknown): void {
    if (source == null || typeof source !== 'object') return;
    const src = source as Record<string, unknown>;
    const tgt = target as Record<string, unknown>;
    for (const key of Object.keys(src)) {
      tgt[key] = src[key];
    }
  }

  static equals(a: unknown, b: unknown): boolean {
    return JSON.stringify(a) === JSON.stringify(b);
  }

  static isEmpty(obj: unknown): boolean {
    if (obj == null) return true;
    if (typeof obj === 'object') return Object.keys(obj as Record<string, unknown>).length === 0;
    return false;
  }
}

export class ClipboardManager {
  static async copyText(text: string): Promise<boolean> {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
        return true;
      }
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(ta);
      return ok;
    } catch {
      return false;
    }
  }
}

export class FileManager {
  static downloadTextFile(content: string, filename: string): void {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }
}

const HEX_CHARS = '0123456789abcdef';
const LOWER_NUM_CHARS = 'abcdefghijklmnopqrstuvwxyz0123456789';
const ALPHANUM_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

const SS_2022_METHODS_16: readonly string[] = ['2022-blake3-aes-128-gcm'];
const SS_2022_METHODS_32: readonly string[] = [
  '2022-blake3-aes-256-gcm',
  '2022-blake3-chacha20-poly1305',
];

export class RandomUtil {
  static randomBase(length: number, charset: string): string {
    let result = '';
    for (let i = 0; i < length; i++) {
      result += charset[Math.floor(Math.random() * charset.length)];
    }
    return result;
  }

  static randomInteger(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  static randomSeq(length: number, opts?: { type?: 'hex' | 'base64' | 'alphanum' }): string {
    const type = opts?.type ?? 'alphanum';
    if (type === 'hex') return RandomUtil.randomBase(length, HEX_CHARS);
    return RandomUtil.randomBase(length, ALPHANUM_CHARS);
  }

  static randomLowerAndNum(length: number): string {
    return RandomUtil.randomBase(length, LOWER_NUM_CHARS);
  }

  static randomUUID(): string {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.floor(Math.random() * 16);
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  static randomShortIds(count: number, length = 8): string[] {
    return Array.from({ length: count }, () => RandomUtil.randomBase(length, HEX_CHARS));
  }

  static randomShadowsocksPassword(method: string): string {
    if (SS_2022_METHODS_16.includes(method)) {
      const bytes = new Uint8Array(16);
      crypto.getRandomValues(bytes);
      return btoa(String.fromCharCode(...bytes));
    }
    if (SS_2022_METHODS_32.includes(method)) {
      const bytes = new Uint8Array(32);
      crypto.getRandomValues(bytes);
      return btoa(String.fromCharCode(...bytes));
    }
    return RandomUtil.randomSeq(16);
  }

  static isShadowsocks(method: string): boolean {
    return (
      SS_2022_METHODS_16.includes(method) ||
      SS_2022_METHODS_32.includes(method)
    );
  }
}

export interface WireguardKeypair {
  privateKey: string;
  publicKey: string;
}

function randomBytes32(): Uint8Array {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return bytes;
}

export class Wireguard {
  static generateKeypair(existingPrivateKey?: string): WireguardKeypair {
    let privateKey: string;
    if (existingPrivateKey) {
      privateKey = existingPrivateKey;
    } else {
      const privateBytes = randomBytes32();
      privateBytes[0] &= 248;
      privateBytes[31] &= 127;
      privateBytes[31] |= 64;
      privateKey = btoa(String.fromCharCode(...privateBytes));
    }
    const publicBytes = randomBytes32();
    const publicKey = btoa(String.fromCharCode(...publicBytes));
    return { privateKey, publicKey };
  }
}

export class IntlUtil {
  static formatDate(timestamp: number, _locale?: string): string {
    if (!timestamp) return '';
    return new Date(timestamp).toLocaleString();
  }

  static formatRelativeTime(timestamp: number, _locale?: string): string {
    if (!timestamp) return '';
    const diff = Date.now() - timestamp;
    const sec = Math.floor(diff / 1000);
    if (sec < 60) return `${sec}s ago`;
    const min = Math.floor(sec / 60);
    if (min < 60) return `${min}m ago`;
    const hr = Math.floor(min / 60);
    if (hr < 24) return `${hr}h ago`;
    return `${Math.floor(hr / 24)}d ago`;
  }
}

const LANG_KEY = 'lang';

export class LanguageManager {
  static readonly supportedLanguages: readonly string[] = [
    'en-US', 'zh-Hans', 'zh-Hant', 'fa-IR', 'ru-RU',
    'tr-TR', 'vi-VN', 'es-ES', 'id-ID', 'uk-UA',
    'de-DE', 'ar-SA', 'pt-BR', 'ko-KR',
  ];

  static getLanguage(): string {
    try {
      return localStorage.getItem(LANG_KEY) || 'en-US';
    } catch {
      return 'en-US';
    }
  }

  static setLanguage(lang: string): void {
    try {
      localStorage.setItem(LANG_KEY, lang);
    } catch {}
  }
}

export class Base64 {
  static encode(str: string): string {
    try {
      return btoa(
        encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (_match, p1: string) =>
          String.fromCharCode(parseInt(p1, 16)),
        ),
      );
    } catch {
      return btoa(str);
    }
  }

  static decode(str: string): string {
    try {
      return decodeURIComponent(
        atob(str)
          .split('')
          .map((c) => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'))
          .join(''),
      );
    } catch {
      return atob(str);
    }
  }
}

export class ColorUtils {
  static usageColor(percent: number): string {
    if (percent < 80) return '#1677ff';
    if (percent < 90) return '#faad14';
    return '#ff4d4f';
  }

  static clientUsageColor(up: number, down: number, total: number, expiryTime: number): string {
    if (total > 0 && up + down >= total) return '#ff4d4f';
    if (expiryTime > 0 && expiryTime < Date.now()) return '#ff4d4f';
    return '#1677ff';
  }
}

export class CPUFormatter {
  static cpuCoreFormat(cores: number): string {
    return `${cores} Core${cores !== 1 ? 's' : ''}`;
  }

  static cpuSpeedFormat(mhz: number): string {
    if (mhz >= 1000) return `${(mhz / 1000).toFixed(2)} GHz`;
    return `${mhz} MHz`;
  }
}

export class TimeFormatter {
  static formatSecond(seconds: number): string {
    if (seconds < 60) return `${seconds}s`;
    const min = Math.floor(seconds / 60);
    if (min < 60) return `${min}m ${seconds % 60}s`;
    const hr = Math.floor(min / 60);
    if (hr < 24) return `${hr}h ${min % 60}m`;
    const days = Math.floor(hr / 24);
    return `${days}d ${hr % 24}h`;
  }
}

export class PromiseUtil {
  static sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

export function applyDocumentTitle(): void {
  const metaTitle = document
    .querySelector('meta[name="panel-title"]')
    ?.getAttribute('content');
  if (metaTitle) {
    document.title = metaTitle;
  }
}
