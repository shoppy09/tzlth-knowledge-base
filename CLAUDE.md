# 知識庫網站（SYS-08 - knowledge-base）

## 角色定義
職涯停看聽知識庫的對外網站。將 tzlth-hq GitHub repo 中 `/knowledge/` 資料夾的 Markdown 文件渲染成可瀏覽的知識庫網站，供 Tim 隨時查閱。

## 系統資訊
- **URL**：https://knowledge.careerssl.com
- **GitHub repo**：shoppy09/tzlth-knowledge-base
- **本地路徑**：C:\Users\USER\Desktop\CLAUDE寫工具\knowledge-base
- **部署平台**：Vercel（手動 `npx vercel --prod`，無自動部署）
- **狀態**：上線中（live，驗證於 2026-05-23）

## 技術架構
- **框架**：Next.js 15（App Router）
- **樣式**：CSS-in-JS（inline styles）+ 米色（#FAF7F2）設計風格
- **Markdown 渲染**：`marked` 套件
- **資料來源**：tzlth-hq GitHub repo（shoppy09/tzlth-hq）透過 GitHub API 讀取
- **環境變數**：`GITHUB_TOKEN`（讀取 tzlth-hq private repo，已設定於 Vercel）

## 路由結構
```
/                    → 首頁（顯示所有分類 + 文件數量統計）
/[category]          → 分類頁（顯示該分類下的文件清單）
/[category]/[file]   → 文章頁（渲染單份 Markdown 文件）
```

## 知識庫來源資料夾對應

| URL 分類 | tzlth-hq 資料夾 | 描述 |
|---------|----------------|------|
| `methodology` | `knowledge/methodology/` | 顧問方法論 |
| `operations` | `knowledge/operations/` | 操作 SOP |
| `automations` | `knowledge/automations/` | 自動化流程記錄 |
| `decisions` | `knowledge/decisions/` | 架構決策記錄（ADR + RCF）|
| `references` | `knowledge/references/` | LINE 群組同步參考文件 |
| `analyses` | `knowledge/analyses/` | 八維學習分析筆記（URL/YT 分析結果）|
| `cases` | `knowledge/cases/` | 諮詢案例洞察（去識別化）|
| `product` | `knowledge/product/` | 產品架構、定價、話術 |

## 核心規則

### 部署規則（HARD STOP）
1. **修改後必須 build 驗證**：`npm run build`
2. **build 通過後 push + 部署**：`git push` → `npx vercel --prod`
3. **部署後必須驗證**：打開 URL 確認首頁、分類頁、文章頁正常

### Server Component 規則
- **所有頁面均為 Server Component**（無 `"use client"` 指令）
- **禁止在 Server Component 使用 event handler**（onMouseEnter、onMouseLeave、onClick 等）
- hover 效果必須用 CSS class，不用 inline style + event handler

### 環境變數
- `GITHUB_TOKEN`：Personal Access Token，必須有 `repo:read` 權限
- 設定位置：Vercel 環境變數（Production + Preview + Development）

## revalidate 設定
- 首頁：`revalidate = 300`（5 分鐘）— knowledge base 更新後最多 5 分鐘生效
- 分類頁：`revalidate = 300`
- 文章頁：`revalidate = 300`

## 收尾規定
修改後必須：
1. 更新本文件「最近修改記錄」
2. 更新 `dev/tasks.md`（在 tzlth-hq）
3. 更新 `hr/inventory.json`（在 tzlth-hq）
4. 更新 `reports/daily-log.md`（在 tzlth-hq）

## 最近修改記錄

| 日期 | 修改內容 | 狀態 |
|------|---------|------|
| 2026-04-15 | 初始建立：Next.js 15 + App Router + GitHub API 讀取，首頁/分類頁/文章頁路由 | ✅ 上線 |
| 2026-04-15 | 修復：移除 Server Component 中的 onMouseEnter/onMouseLeave event handler（改用 CSS）| ✅ 已部署 |
| 2026-04-15 | 修復：URL 從 tzlth-knowledge.vercel.app → tzlth-knowledge-base.vercel.app | ✅ 已部署 |
| 2026-04-27 | 新增「學習分析」第 5 個分類（analyses/ → /analyses 路由）；tzlth-hq 的 analyses/index.md 改名 README.md 自動排除；驗證通過 | ✅ 已部署 |
| 2026-05-29 | 更新 URL → knowledge.careerssl.com；補入 3 個分類（automations/cases/product）；驗證日期修正至 2026-05-23 | ✅ |
| 2026-05-29 | CSP 修復：style-src 補入 https://fonts.googleapis.com；新增 font-src https://fonts.gstatic.com（DM Sans 未渲染 bug 修復）| ✅ |
| 2026-06-27 | Basic Auth middleware 上線（noindex 公開站 → noindex + Basic Auth 內部站）：HTTP Basic Auth（fail-closed）+ UTF-8 解碼 + WWW-Authenticate realm ASCII | ✅ |
| 2026-06-27 | 顯示範圍擴充（lib/knowledge.ts，內部站連動）：① decisions 移除 RCF-XXX 全濾改僅排除 RCF-000-template（RCF 規格層變更紀錄可見，decisions 4→114 份）② 新增 domains 分類（D1-D6 findings，recursive fetch + README 破例顯示領域導覽/掃描紀錄 + buildDisplayName D1-D6 labels，35 份）③ brand-benchmarks 不渲染（6 分析已透過 analyses/ 1:1 副本可見，避重複）。Chrome MCP live 驗證 114+35 + 巢狀路由 + Basic Auth 完整。deploy-verify SYS-08-2026-06-27-display-scope.md（在 tzlth-hq）| ✅ |
