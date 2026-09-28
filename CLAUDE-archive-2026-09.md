# CLAUDE.md 最近修改記錄——完整敘事封存（2026-09）

> RCF-175 雙層制：主檔只留摘要列（≤300 字元），全文在此，newest-first。

| 日期 | 修改內容 | 狀態 |
|------|---------|------|
| 2026-09-28 | 【DEV】**分類改單一清單＋共用過濾（HQ 組 15 說明書 SYS-08 升級時逐條反查撈出）**：🔴 09-03 `000f11b` 新增 assessments 只改 `CATEGORY_DEFS` 與 `getAllCategories` 的 README 例外，漏改首頁硬編 11 鍵陣列與 `getCategoryFiles` 的 README 例外 ⇒ 首頁無「評估與迭代」、首頁搜尋搜不到、分類頁與文章側欄無 README（跨家評估索引），直連網址才看得到；當日 HQ 記「Ready 實查」＝部署狀態非功能驗證，5 處記錄寫成「live 驗證／Tim 檢視入口」。修法＝結構修而非補 2 行：`CATEGORY_DEFS` 依首頁順序重排、首頁改 `Object.keys` 讀、兩函式共用 `listCategoryFiles()`（`NESTED`／`README_VISIBLE` 兩個 Set）。順修：`folderLabels` w2 目錄名 `w2-career-exploration`→實際 `w2-career-planning-workshop`（原標籤從未生效）、補 W7；產品描述 W1-W5→W2-W7；自動化描述 A-01~A-21／Northflank Cron→A-XX／預約 in-process 計時器（08-05 已證無平台 cron）；頁尾「每週一」→「每週一、週五」（sync-knowledge-base.yml 兩個 cron）。本檔：分類數 11→12、路由補 `/api/version`、env 補 Basic Auth 兩把與 Vercel 內建兩把、刪 08-23 已恢復的「憑證待 login」句。`npm run build` 通過 | ✅ |
| 2026-09-28 | 【DEV/SEC】新增公開端點 `/api/version`（回 commit 7 碼／node 大版本／region，noindex、no-store）；`middleware.ts` 在 env 檢查前**精確路徑**放行，其餘全站 Basic Auth 不變（HQ tasks「其餘部署面 repo 無法自報正在服務的是哪一次部署」） | ✅ |
| 2026-04-15 | 修復：URL 從 tzlth-knowledge.vercel.app → tzlth-knowledge-base.vercel.app | ✅ 已部署 |

| 2026-04-15 | 初始建立：Next.js 15 + App Router + GitHub API 讀取，首頁/分類頁/文章頁路由 | ✅ 上線 |