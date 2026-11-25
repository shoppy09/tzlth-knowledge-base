import { NextRequest, NextResponse } from 'next/server';
import { SESSION_COOKIE, credsFromEnv, verifySession, basicAuthMatch } from './lib/session';

/**
 * 全站登入閘（2026-06-27 起 Basic Auth，SYS-08 存取控制決策 b3；2026-11-25 改成登入頁＋30 天通行證，比照儀表板 HQ RCF-343）
 *
 * WHY 有閘：HQ repo 私有，但本站把 product（課程 IP＋操作模板）＋cases（去識別化客戶案例）等內部知識放在網址上，
 *   只靠 noindex＝security by obscurity。
 * WHY 改：手機瀏覽器的帳密視窗難用、關掉常要重打；儀表板 /systems 連過來還要再跳一次（HQ tasks L74）。
 * 檔名：Next.js 16 起 middleware.ts 已棄用、改名 proxy.ts，預設跑 Node.js（可用 node:crypto 驗簽）。
 *
 * 放行順序：公開路徑 → 沒設帳密就一律 503（fail-closed）→ 有效通行證 → 舊的 Basic 帳密標頭
 *   （⛔ 不可拿掉：LINE Bot 問答用 Basic 呼叫 /api/ask）→ API 回 401；頁面轉到 /login?next=原路徑。
 * 設定：Vercel 環境變數 BASIC_AUTH_USER＋BASIC_AUTH_PASSWORD（必設）、SESSION_SECRET（選設，設了改用它簽章）。
 * 可逆：git revert 本次提交即回到 Basic Auth 版。
 */

export const config = {
  // 保護所有路由，排除 Next 靜態資源與站圖示（這些不含知識內容）
  matcher: ['/((?!_next/static|_next/image|favicon.ico|icon.svg).*)'],
};

// 放行一律「完全相符」，不用 startsWith。/api/version：部署自報（2026-09-28）；/api/version/x 等延伸路徑仍受保護。
const PUBLIC_PATHS = new Set([
  '/api/version',
  '/login',
  '/api/auth/login',
  '/api/auth/logout',
]);

export function proxy(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  if (PUBLIC_PATHS.has(pathname)) return NextResponse.next();

  const creds = credsFromEnv();
  if (!creds) {
    return new NextResponse('存取控制尚未設定（BASIC_AUTH_USER / BASIC_AUTH_PASSWORD）', { status: 503 });
  }

  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (verifySession(token, creds)) return NextResponse.next();
  if (basicAuthMatch(req.headers.get('authorization'), creds)) return NextResponse.next();

  if (pathname.startsWith('/api/')) {
    const res = NextResponse.json({ error: '需要登入' }, { status: 401 });
    if (token) res.cookies.delete(SESSION_COOKIE);
    return res;
  }
  const url = new URL('/login', req.url);
  url.searchParams.set('next', pathname + search);
  const res = NextResponse.redirect(url, 303);
  if (token) res.cookies.delete(SESSION_COOKIE);
  return res;
}
