import { NextResponse } from 'next/server';

// 公開端點：回報「目前服務的是哪一次部署」（2026-09-28 HQ tasks「其餘部署面 repo 無法自報正在服務的是哪一次部署」）
// WHY：Vercel build 失敗會靜默保留舊版；本站全站 Basic Auth，無帳密者無法機器驗證 push 是否上線。
// 揭露邊界比照儀表板／財務同名端點：commit 只回 7 碼（本 repo 為 public，commit 本就可查）、
//   node 只回大版本（不送 CVE 指紋）、region 由 X-Vercel-Id 本就可推。
// ⛔ 不得在此加入 env、依賴狀態或任何知識內容——本站其餘路徑全在 Basic Auth 後，這是唯一例外。
export const dynamic = 'force-dynamic';

export function GET() {
  return NextResponse.json(
    {
      commit: (process.env.VERCEL_GIT_COMMIT_SHA ?? '').slice(0, 7) || null,
      node: process.version.split('.')[0],
      region: process.env.VERCEL_REGION ?? null,
    },
    { headers: { 'X-Robots-Tag': 'noindex', 'Cache-Control': 'no-store' } },
  );
}
