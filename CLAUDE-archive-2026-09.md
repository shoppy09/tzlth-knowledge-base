# CLAUDE.md 最近修改記錄——完整敘事封存（2026-09）

> RCF-175 雙層制：主檔只留摘要列（≤300 字元），全文在此，newest-first。

| 日期 | 修改內容 | 狀態 |
|------|---------|------|
| 2026-09-28 | 【DEV/SEC】新增公開端點 `/api/version`（回 commit 7 碼／node 大版本／region，noindex、no-store）；`middleware.ts` 在 env 檢查前**精確路徑**放行，其餘全站 Basic Auth 不變（HQ tasks「其餘部署面 repo 無法自報正在服務的是哪一次部署」） | ✅ |
| 2026-04-15 | 修復：URL 從 tzlth-knowledge.vercel.app → tzlth-knowledge-base.vercel.app | ✅ 已部署 |
