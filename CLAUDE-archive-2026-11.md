# 修改記錄封存（2026-11）

| 日期 | 修改內容 | 狀態 |
|------|---------|------|
| 2026-11-25 | 【DEV/SEC】登入頁＋30 天通行證＋Next 16.4.3→16.4.6（HQ 2026-11-25 tasks L74，Tim「第 73 行+第 75 行要做」→ 查照 4 版「按照你的建議，執行」，RCF-343 補記）：commit 13fd551。middleware.ts 改名改寫為 proxy.ts（公開路徑 /api/version、/login、/api/auth/login、/api/auth/logout → 沒設帳密 503 → 通行證 kb_session → 舊 Basic 標頭 → API 401／頁面 303 /login?next=）；lib/session.ts 照儀表板，簽章字串改 tzlth-knowledge-session（兩站同名帳密，照抄會互通）；app/login 純表單（noindex、保留站頂列）；登入失敗等 1 秒；登出只收 POST；AskBox 401 改帶去登入頁；tests/session.test.ts 7 項（含跨站隔離）＋package.json test；tsconfig 排除 tests；Next 16.4.6 清 Dependabot 14 則（npm audit --omit=dev 0）。本機假帳密 17 項全過；線上未登入行為、已登入瀏覽、LINE Bot search 路徑皆驗。⚠️ 網站問答 answer 模式呼叫 gemini-flash-latest 逾時 60 秒（504×2，本次未動該段），HQ tasks P2 待 Tim 選修法；Tim 手機登入未驗 ⇒ deployed_unverified。⚠️ 本 repo 無 eslint 設定檔（既有，HQ tasks P3）。 | ⚠️ deployed_unverified |
