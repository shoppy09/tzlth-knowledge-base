// 登入通行證（2026-11-25 知識庫比照儀表板，HQ tasks L74，Tim「第 73 行+第 75 行要做」）
// 本體照儀表板 lib/session.ts（2026-11-24 階段 2，RCF-343），只改一處：
//   簽章金鑰的導出字串改成本站專用（`tzlth-knowledge-session`）。兩站用同名帳密環境變數，
//   若字串相同、帳密又剛好相同，儀表板的通行證拿到本站也會成立 ⇒ 每站一個字串。
// 有效 30 天；改密碼＝所有舊通行證同時失效（金鑰跟著變）。
// ⚠️ 只 import node:crypto：proxy.ts（預設 Node.js 執行環境）與 tests/ 都直接用本檔。
import { createHash, createHmac, timingSafeEqual } from 'node:crypto';

export const SESSION_COOKIE = 'kb_session';
export const SESSION_DAYS = 30;
export const SESSION_MAX_AGE_S = SESSION_DAYS * 24 * 60 * 60;
const MAX_AGE_MS = SESSION_MAX_AGE_S * 1000;
const KEY_LABEL = 'tzlth-knowledge-session';

export interface Creds { user: string; pass: string; secret?: string }

export function credsFromEnv(env: Record<string, string | undefined> = process.env): Creds | null {
  const user = env.BASIC_AUTH_USER;
  const pass = env.BASIC_AUTH_PASSWORD;
  if (!user || !pass) return null;
  return { user, pass, secret: env.SESSION_SECRET || undefined };
}

function signingKey(c: Creds): Buffer {
  return createHash('sha256').update(c.secret ? `${KEY_LABEL}|${c.secret}` : `${KEY_LABEL}|${c.user}|${c.pass}`).digest();
}

function sig(c: Creds, exp: number): string {
  return createHmac('sha256', signingKey(c)).update(`v1.${exp}`).digest('base64url');
}

function sameBytes(a: string, b: string): boolean {
  // 先各自雜湊成等長再比，長度不同也不會提早回傳
  const ha = createHash('sha256').update(a).digest();
  const hb = createHash('sha256').update(b).digest();
  return timingSafeEqual(ha, hb) && a.length === b.length;
}

export function signSession(c: Creds, now: number = Date.now()): string {
  const exp = now + MAX_AGE_MS;
  return `v1.${exp}.${sig(c, exp)}`;
}

export function verifySession(token: string | undefined | null, c: Creds, now: number = Date.now()): boolean {
  if (!token) return false;
  const parts = token.split('.');
  if (parts.length !== 3 || parts[0] !== 'v1') return false;
  const exp = Number(parts[1]);
  if (!Number.isFinite(exp) || exp <= now) return false;
  if (exp > now + MAX_AGE_MS + 60_000) return false; // 不收比 30 天更遠的到期日
  return sameBytes(parts[2], sig(c, exp));
}

export function credentialsMatch(user: string, pass: string, c: Creds): boolean {
  // 兩個都算完再合併，避免帳號錯時提早回傳
  const u = sameBytes(user, c.user);
  const p = sameBytes(pass, c.pass);
  return u && p;
}

/** 舊的瀏覽器帳密視窗（Authorization: Basic）仍然放行：桌機已存的帳密、LINE Bot 問答呼叫 /api/ask 都靠它 */
export function basicAuthMatch(header: string | null | undefined, c: Creds): boolean {
  if (!header) return false;
  const [scheme, encoded] = header.split(' ');
  if (scheme !== 'Basic' || !encoded) return false;
  let decoded: string;
  try {
    decoded = new TextDecoder().decode(Uint8Array.from(atob(encoded), ch => ch.charCodeAt(0)));
  } catch {
    return false;
  }
  const i = decoded.indexOf(':'); // 帳號不含冒號、密碼可含 → 取第一個冒號
  if (i < 0) return false;
  return credentialsMatch(decoded.slice(0, i), decoded.slice(i + 1), c);
}

/** 登入後回原頁：只接受站內路徑，擋 //evil.com、/\evil.com、控制字元與登入頁自己 */
export function safeNext(next: unknown): string {
  if (typeof next !== 'string' || next.length > 512) return '/';
  if (!next.startsWith('/') || next.startsWith('//') || next.startsWith('/\\')) return '/';
  if (/[\r\n\t]/.test(next)) return '/';
  if (next === '/login' || next.startsWith('/login?') || next.startsWith('/api/auth/')) return '/';
  return next;
}
