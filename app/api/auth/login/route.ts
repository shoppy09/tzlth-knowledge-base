// 登入：表單送帳號、密碼 → 對 → 發 30 天通行證、回原頁；錯 → 等 1 秒、回登入頁帶錯誤（2026-11-25，比照儀表板）
// 等 1 秒只拖慢逐次嘗試，擋不住平行請求（serverless 沒有共享狀態），不是暴力破解防護——同儀表板、財務系統的已知限制。
import { NextRequest, NextResponse } from 'next/server';
import { SESSION_COOKIE, SESSION_MAX_AGE_S, credsFromEnv, credentialsMatch, signSession, safeNext } from '@/lib/session';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const creds = credsFromEnv();
  if (!creds) return new NextResponse('存取控制尚未設定', { status: 503 });

  let user = '', pass = '', next = '/';
  try {
    const f = await req.formData();
    user = String(f.get('user') ?? '');
    pass = String(f.get('pass') ?? '');
    next = safeNext(f.get('next'));
  } catch { /* 格式不對＝當作帳密錯 */ }

  if (!credentialsMatch(user, pass, creds)) {
    await new Promise(r => setTimeout(r, 1000));
    const back = new URL('/login', req.url);
    back.searchParams.set('e', '1');
    if (next !== '/') back.searchParams.set('next', next);
    return NextResponse.redirect(back, 303);
  }

  const res = NextResponse.redirect(new URL(next, req.url), 303);
  res.cookies.set(SESSION_COOKIE, signSession(creds), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_MAX_AGE_S,
    path: '/',
  });
  return res;
}
