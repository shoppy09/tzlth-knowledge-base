// 登出：刪通行證、回登入頁（只收 POST，避免被別的網頁用連結登出）（2026-11-25，比照儀表板）
import { NextRequest, NextResponse } from 'next/server';
import { SESSION_COOKIE } from '@/lib/session';

export const dynamic = 'force-dynamic';

export function POST(req: NextRequest) {
  const res = NextResponse.redirect(new URL('/login', req.url), 303);
  res.cookies.delete(SESSION_COOKIE);
  return res;
}
