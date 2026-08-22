# 知識庫網站（SYS-08 - knowledge-base）

## 角色定義
職涯停看聽知識庫的對外網站。將 tzlth-hq GitHub repo 中 `/knowledge/` 資料夾的 Markdown 文件渲染成可瀏覽的知識庫網站，供 Tim 隨時查閱。

## 系統資訊
- **URL**：https://knowledge.careerssl.com
- **GitHub repo**：shoppy09/tzlth-knowledge-base
- **本地路徑**：C:\Users\USER\Desktop\CLAUDE寫工具\knowledge-base
- **部署平台**：Vercel｜🔴 **2026-08-23 dashboard 實查更正：auto-deploy 是「開啟」的**（Deployments 證每 commit 皆有 git-source 部署，含純 docs commit `28581b7`／`5ee63cd`）⇒ **push 即上線**，`npx vercel --prod` 為加速/備援。原記「無自動部署」與實際不符（總部規則零的全域「永久停用」為誤通則，見 RCF-153）
- **狀態**：上線中（live，驗證於 2026-05-23）

## 技術架構
- **框架**：Next.js 16（App Router，Turbopack）
- **樣式**：CSS-in-JS（inline styles）+ 米色（#FAF7F2）設計風格
- **Markdown 渲染**：`marked` 套件
- **資料來源**：tzlth-hq GitHub repo（shoppy09/tzlth-hq）透過 GitHub API 讀取
- **環境變數**：`GITHUB_TOKEN`（讀取 tzlth-hq private repo，已設定於 Vercel）

## 路由結構
```
/                    → 首頁（顯示所有分類 + 文件數量統計 + AI 問答框 AskBox）
/[category]          → 分類頁（顯示該分類下的文件清單）
/[category]/[file]   → 文章頁（渲染單份 Markdown 文件）
/api/ask             → 開放圖書館 AI-query 層（RCF-143 工程 3，4-A）
                       POST：拉 tzlth-hq data/search-index.json（raw media type）
                       → 記憶體計分（移植 knowledge-hook.py）→ gemini-flash-latest 帶引用生成
                       GET ?health=1：唯讀索引計量（smoke test / 監控）
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
| `cases` | `knowledge/cases/` | 諮詢案例洞察（去識別化，含 `cases/reports/` 全文層）|
| `product` | `knowledge/product/` | 產品架構、定價、話術 |
| `syntheses` | `knowledge/syntheses/` | 知識編譯（深度跨分析合成）|
| `overview` | `knowledge/`（根層 allowlist）| 核心參考（client-patterns / freshness / architecture 等精選根檔）|

> ⚠️ 分類實為 **11 類**（lib/knowledge.ts `getAllCategories` keys）：overview / methodology / operations / automations / decisions / domains / references / analyses / syntheses / cases / product（domains/product 遞迴子目錄）。
> **/api/ask 語料範圍 ≠ 本渲染分類**：AI-query 只檢索 **5 夾研究語料**（analyses / references / domains / syntheses / cases，RCF-143 C 館），刻意不含 methodology（→ NotebookLM A 館）/ product / operations / decisions。

## 核心規則

### 部署規則（HARD STOP）
1. **修改後必須 build 驗證**：`npm run build`
2. **build 通過後 push + 部署**：`git push`（**即觸發 auto-deploy 上線**，2026-08-23 實查）→ `npx vercel --prod` 僅在需要立即上線時執行。⛔ **`npm run build` 仍不可跳過**：build 失敗時 Vercel 靜默保留舊版
3. **部署後必須驗證**：打開 URL 確認首頁、分類頁、文章頁正常

### Server Component 規則
- **所有頁面均為 Server Component**（無 `"use client"` 指令）
- **禁止在 Server Component 使用 event handler**（onMouseEnter、onMouseLeave、onClick 等）
- hover 效果必須用 CSS class，不用 inline style + event handler

### 環境變數
- `GITHUB_TOKEN`：Personal Access Token（Fine-Grained，Contents:Read），讀 tzlth-hq `knowledge/` + `data/search-index.json`（raw media type 支援 >1MB）
- `GEMINI_API_KEY`：Google AI Studio 免費層 key（RCF-143 D2，/api/ask 生成層）。⚠️ **免費層會用輸入訓練 Google 模型**——送出語料為去識別化 5 夾研究語料（無 LEG-1 PII，Tim 接受 IP 訓練權衡，見 security-log 2026-07-30）
- 設定位置：Vercel 環境變數（Production + Preview + Development）

## revalidate 設定
- 首頁：`revalidate = 300`（5 分鐘）— knowledge base 更新後最多 5 分鐘生效
- 分類頁：`revalidate = 300`
- 文章頁：`revalidate = 300`

## 收尾七件事（每次對話結束前必做）
收尾完整規則詳見**總部 CLAUDE.md →「核心原則零：收尾七件事」**（7 步驟：git push / 最近修改記錄 / tasks.md / inventory.json / daily-log / reflection-log / 品質自查 HARD STOP / 未完成清單 HARD STOP，均對總部檔案執行；2026-07-12 規則盤點指針化，原 4 件事清單為 D6 漏網）。
> 部署特例：build → push（**push 即 auto-deploy 上線**，2026-08-23 實查更正）→ `npx vercel --prod` 為加速/備援。⚠️ 本機 Vercel 憑證已於 08-15～08-22 間消失，待 Tim `vercel login`；本 repo 因 auto-deploy 開啟不受影響。

## 最近修改記錄

| 日期 | 修改內容 | 狀態 |
|------|---------|------|
| 2026-07-30 | **RCF-143 工程 3：`/api/ask` 開放圖書館 AI-query 層（4-A 輕量 RAG）**：新增 `app/api/ask/route.ts`（POST 拉 tzlth-hq `data/search-index.json` raw media type + 記憶體計分〔移植 knowledge-hook.py 中文 2/3-gram + SYNONYMS + references 降權 0.35〕→ gemini-flash-latest 帶引用生成〔強制接地/不杜撰/A 館邊界揭露/prompt-injection 隔離〕；GET ?health 唯讀計量）+ `app/components/AskBox.tsx`（D4 首頁問答框，client component）+ page.tsx 插入。D1=B/D2 免費層/D3 Hobby+Fluid maxDuration=60/D4 首頁框。commit db3acf5 → vercel --prod ● Ready。**GET health 生產驗證 ✅**（>1MB raw 實抓 / 5 夾 160 檔 1215 塊 / Basic Auth）；順修 Next15→16 + 8→11 分類 stale。⏳ POST 生成待 Tim 設 GEMINI_API_KEY → 補驗改 live。deploy-verify SYS-08-2026-07-30（tzlth-hq）| ⚠️ deployed_unverified（POST 待 key）|
| 2026-04-15 | 初始建立：Next.js 15 + App Router + GitHub API 讀取，首頁/分類頁/文章頁路由 | ✅ 上線 |
| 2026-04-15 | 修復：移除 Server Component 中的 onMouseEnter/onMouseLeave event handler（改用 CSS）| ✅ 已部署 |
| 2026-04-15 | 修復：URL 從 tzlth-knowledge.vercel.app → tzlth-knowledge-base.vercel.app | ✅ 已部署 |
| 2026-04-27 | 新增「學習分析」第 5 個分類（analyses/ → /analyses 路由）；tzlth-hq 的 analyses/index.md 改名 README.md 自動排除；驗證通過 | ✅ 已部署 |
| 2026-05-29 | 更新 URL → knowledge.careerssl.com；補入 3 個分類（automations/cases/product）；驗證日期修正至 2026-05-23 | ✅ |
| 2026-05-29 | CSP 修復：style-src 補入 https://fonts.googleapis.com；新增 font-src https://fonts.gstatic.com（DM Sans 未渲染 bug 修復）| ✅ |
| 2026-06-27 | Basic Auth middleware 上線（noindex 公開站 → noindex + Basic Auth 內部站）：HTTP Basic Auth（fail-closed）+ UTF-8 解碼 + WWW-Authenticate realm ASCII | ✅ |
| 2026-06-27 | 顯示範圍擴充（lib/knowledge.ts，內部站連動）：① decisions 移除 RCF-XXX 全濾改僅排除 RCF-000-template（RCF 規格層變更紀錄可見，decisions 4→114 份）② 新增 domains 分類（D1-D6 findings，recursive fetch + README 破例顯示領域導覽/掃描紀錄 + buildDisplayName D1-D6 labels，35 份）③ brand-benchmarks 不渲染（6 分析已透過 analyses/ 1:1 副本可見，避重複）。Chrome MCP live 驗證 114+35 + 巢狀路由 + Basic Auth 完整。deploy-verify SYS-08-2026-06-27-display-scope.md（在 tzlth-hq）| ✅ |
| 2026-06-27 | 新增 overview「核心參考」分類（root 層精選 .md 渲染，全面盤點衍生 P3）：CATEGORY_DEFS 📌 + ROOT_ALLOWLIST（高值 3：client-patterns/course-info-freshness/pattern-methodology-map，中值 3 註解可加）+ repoPath() helper（getFileContent + getFileLastModified 共用根路徑特判，修前輪漏 getFileLastModified + DRY）+ buildSlug/buildDisplayName overview 特判（6 特判點）。commit 6a21f36；Chrome MCP live 驗證 overview 3 份 + root 檔文章路由 + allowlist 過濾未洩其他 root 檔 + Basic Auth。deploy-verify SYS-08-2026-06-27-overview.md（在 tzlth-hq）| ✅ |
