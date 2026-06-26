import { NextRequest, NextResponse } from 'next/server';

/**
 * HTTP Basic Auth 存取控制（2026-06-27，SYS-08 存取控制決策 b3）
 *
 * WHY：HQ repo 為私有，但本站把 product（課程 IP+操作模板）+ cases（去識別化客戶案例）
 * 等內部知識公開 URL 放送、僅 noindex 無存取控制＝security by obscurity。
 * 此 middleware 把「repo 私有但網站公開」的不對稱補平。
 *
 * 設定：在 Vercel 專案 Environment Variables 設 BASIC_AUTH_USER + BASIC_AUTH_PASSWORD（Tim 自設密碼）。
 * Fail-closed：未設定 env var → 一律拒絕（503），強制完成設定後才開放，避免誤以為已保護。
 * 可逆：移除本檔即還原為公開站。
 */

export const config = {
  // 保護所有路由，排除 Next 靜態資源與站圖示（這些不含知識內容）
  matcher: ['/((?!_next/static|_next/image|favicon.ico|icon.svg).*)'],
};

export function middleware(req: NextRequest) {
  const expectedUser = process.env.BASIC_AUTH_USER;
  const expectedPass = process.env.BASIC_AUTH_PASSWORD;

  // Fail-closed：尚未設定帳密 env var → 拒絕（避免「以為有保護其實沒設」的假象）
  if (!expectedUser || !expectedPass) {
    return new NextResponse('存取控制尚未設定（BASIC_AUTH_USER / BASIC_AUTH_PASSWORD）', {
      status: 503,
    });
  }

  const authHeader = req.headers.get('authorization');
  if (authHeader) {
    const [scheme, encoded] = authHeader.split(' ');
    if (scheme === 'Basic' && encoded) {
      const decoded = atob(encoded);
      const sep = decoded.indexOf(':');
      const user = decoded.slice(0, sep);
      const pass = decoded.slice(sep + 1);
      if (user === expectedUser && pass === expectedPass) {
        return NextResponse.next();
      }
    }
  }

  return new NextResponse('需要登入', {
    status: 401,
    headers: { 'WWW-Authenticate': 'Basic realm="職涯停看聽知識庫", charset="UTF-8"' },
  });
}
