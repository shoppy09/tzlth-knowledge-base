# CLAUDE.md 最近修改記錄——完整敘事封存（2026-10）

> RCF-175 雙層制：主檔只留摘要列（≤300 字元），全文在此，newest-first。

| 日期 | 修改內容 | 狀態 |
|------|---------|------|
| 2026-10-14 | 【DEV】**本機 build 閘＋推送後部署結果查詢（總部 L820，RCF-244）**：`.git/hooks/pre-push` 由總部安裝，沒有 build 記號就自動 build、失敗擋下；推完用總部 `deploy_status.py` 查部署結果。本 repo 程式碼未動。說明見部署段 🔒 行 | ✅ |
| 2026-10-10 | 【KM/DEV】**D6 分類名稱改「AI 工具動態與應用」＋`.gitattributes` 順序修正（總部 tasks 批次:B40 兩件同一次部署，Tim「按照你的建議，執行」，查照 4 版）**：① `lib/knowledge.ts` L201 `buildDisplayName` 的 D6 資料夾名稱（只在「知識領域掃描」分類頁的 D6 檔名顯示，`NESTED` 含 domains）與 L58 domains 分類說明（首頁分類卡＋分類頁頁首）——總部 RCF-233 已於 10-09 更名，本站漏改；② `* text=auto` 從第 35 行移到二進位規則之前（git 屬性後寫蓋前寫，原順序會把 pdf 等改回 text=auto）；`git check-attr`：pdf＝unset、ts／md／ps1＝set；repo 22 檔中被判定為二進位的 0 檔（`git ls-files --eol`），不會重新正規化。`npm run build` 通過。總部 `scripts/tasks_snapshot.py --touch 知識庫網站 knowledge-base` 實測列出這兩件（RCF-236 首例）。驗證檔 `tzlth-hq/dev/deploy-verify/SYS-08-2026-10-10-d6-label.md` | ✅ |
