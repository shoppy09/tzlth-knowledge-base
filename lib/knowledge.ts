const OWNER = 'shoppy09';
const REPO = 'tzlth-hq';
const TOKEN = process.env.GITHUB_TOKEN;

const BASE = `https://api.github.com/repos/${OWNER}/${REPO}/contents`;

const headers = {
  Authorization: `Bearer ${TOKEN}`,
  Accept: 'application/vnd.github.v3+json',
};

export interface KnowledgeFile {
  slug: string;       // filename without .md
  name: string;       // display name
  path: string;       // full path in repo
}

export interface KnowledgeCategory {
  key: string;
  label: string;
  icon: string;
  description: string;
  files: KnowledgeFile[];
}

export const CATEGORY_DEFS: Record<string, { label: string; icon: string; description: string }> = {
  methodology: {
    label: '方法論',
    icon: '🧠',
    description: '六大諮詢框架、P-type 分類、履歷診斷邏輯、講座產品設計規範',
  },
  operations: {
    label: '操作 SOP',
    icon: '⚙️',
    description: '知識流入管理、LINE 廣播、部署流程、諮詢 SOP 等操作手冊',
  },
  decisions: {
    label: '決策記錄',
    icon: '📋',
    description: '重要架構決策與技術選型理由（RCF 治理文件已過濾）',
  },
  references: {
    label: '參考文件',
    icon: '📖',
    description: '從 LINE 群組每週同步的知識庫 — AI 工具、社群行銷、職涯顧問方法論等',
  },
  analyses: {
    label: '學習分析',
    icon: '🔍',
    description: '八維深度分析筆記 — Threads、YouTube、部落格等外部學習資源萃取',
  },
  syntheses: {
    label: '知識編譯',
    icon: '🧩',
    description: '深度跨分析合成 — 從學習分析選取群集全文跨篇整合，萃取單篇看不到的新洞察（知識編譯 SKILL 產出）',
  },
  cases: {
    label: '客戶案例',
    icon: '👤',
    description: '去識別化諮詢案例 — P-type 標注、策略摘要、知識萃取',
  },
  product: {
    label: '產品知識庫',
    icon: '📦',
    description: '工作坊 W1-W5、社大課程 C1-C5、診斷包 D1 的課程設計與教材',
  },
  automations: {
    label: '自動化工具',
    icon: '🤖',
    description: 'A-01~A-21 全站自動化工具登錄冊 — GitHub Actions、Vercel Cron、GAS、Claude Code Hooks、Northflank Cron',
  },
};

async function fetchDir(path: string): Promise<{ name: string; path: string; type: string }[]> {
  const res = await fetch(`${BASE}/${path}`, {
    headers,
    next: { revalidate: 300 },
  } as RequestInit);
  if (!res.ok) return [];
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

// Recursively fetch all .md files within a directory (for product/ subdirectories)
async function fetchDirRecursive(path: string): Promise<{ name: string; path: string; type: string }[]> {
  const items = await fetchDir(path);
  const results: { name: string; path: string; type: string }[] = [];
  const subdirPromises: Promise<{ name: string; path: string; type: string }[]>[] = [];

  for (const item of items) {
    if (item.type === 'file') {
      results.push(item);
    } else if (item.type === 'dir') {
      subdirPromises.push(fetchDirRecursive(item.path));
    }
  }

  const subdirResults = await Promise.all(subdirPromises);
  for (const subFiles of subdirResults) {
    results.push(...subFiles);
  }

  return results;
}

async function fetchRaw(path: string): Promise<string> {
  const res = await fetch(`${BASE}/${path}`, {
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      Accept: 'application/vnd.github.v3.raw',
    },
    next: { revalidate: 300 },
  } as RequestInit);
  if (!res.ok) throw new Error(`Failed to fetch ${path}: ${res.status}`);
  return res.text();
}

// Build a display-friendly slug from the full repo path
// e.g. "knowledge/product/c5-interview-mastery/teaching-materials/worksheet-a.md"
//   → "c5-interview-mastery/teaching-materials/worksheet-a"
function buildSlug(filePath: string, category: string): string {
  const prefix = `knowledge/${category}/`;
  const relative = filePath.startsWith(prefix) ? filePath.slice(prefix.length) : filePath;
  return relative.replace(/\.md$/, '');
}

// Build a display name from the slug
// e.g. "c5-interview-mastery/teaching-materials/worksheet-a" → "C5 面試通關 › worksheet-a"
function buildDisplayName(slug: string): string {
  const parts = slug.split('/');
  if (parts.length <= 1) return slug;

  // Friendly top-folder names for known product codes
  const folderLabels: Record<string, string> = {
    'w1-resume-workshop': 'W1 履歷工作坊',
    'w2-career-exploration': 'W2 職涯探索',
    'w3-enterprise-workshop': 'W3 企業版',
    'w4-manager-workshop': 'W4 主管引導版',
    'w5-military-transition': 'W5 軍職換跑道',
    'w6-resume-interview-workshop': 'W6 履歷×面試',
    'c1-second-career': 'C1 第二人生',
    'c2-resume-workshop': 'C2 履歷撰寫',
    'c3-career-checkup': 'C3 職涯健檢',
    'c4-slash-career': 'C4 斜槓起步',
    'c5-interview-mastery': 'C5 面試通關',
  };

  const topFolder = folderLabels[parts[0]] || parts[0];
  const fileName = parts[parts.length - 1];
  return `${topFolder} › ${fileName}`;
}

export async function getAllCategories(): Promise<KnowledgeCategory[]> {
  const keys = ['methodology', 'operations', 'automations', 'decisions', 'references', 'analyses', 'syntheses', 'cases', 'product'];
  return Promise.all(
    keys.map(async (key) => {
      const def = CATEGORY_DEFS[key];
      // product/ uses recursive fetch to capture subdirectory files
      const items = key === 'product'
        ? await fetchDirRecursive(`knowledge/${key}`).catch(() => [])
        : await fetchDir(`knowledge/${key}`).catch(() => []);
      const files: KnowledgeFile[] = items
        .filter((i) => {
          if (!i.type || i.type !== 'file') return false;
          if (!i.name.endsWith('.md')) return false;
          if (i.name === 'README.md') return false;
          // decisions: 過濾 RCF 治理文件（RCF-XXX.md），只顯示真實決策記錄
          if (key === 'decisions' && i.name.startsWith('RCF-')) return false;
          return true;
        })
        .map((i) => {
          const slug = buildSlug(i.path, key);
          return {
            slug,
            name: key === 'product' ? buildDisplayName(slug) : i.name.replace(/\.md$/, ''),
            path: i.path,
          };
        });
      return { key, ...def, files };
    })
  );
}

export async function getCategoryFiles(category: string): Promise<KnowledgeFile[]> {
  // product/ uses recursive fetch to capture subdirectory files
  const items = category === 'product'
    ? await fetchDirRecursive(`knowledge/${category}`).catch(() => [])
    : await fetchDir(`knowledge/${category}`).catch(() => []);
  return items
    .filter((i) => {
      if (!i.type || i.type !== 'file') return false;
      if (!i.name.endsWith('.md')) return false;
      if (i.name === 'README.md') return false;
      // decisions: 過濾 RCF 治理文件（RCF-XXX.md），只顯示真實決策記錄
      if (category === 'decisions' && i.name.startsWith('RCF-')) return false;
      return true;
    })
    .map((i) => {
      const slug = buildSlug(i.path, category);
      return {
        slug,
        name: category === 'product' ? buildDisplayName(slug) : i.name.replace(/\.md$/, ''),
        path: i.path,
      };
    });
}

export async function getFileContent(category: string, slug: string): Promise<string> {
  // slug may contain slashes for nested paths (e.g. "c5-interview-mastery/teaching-materials/worksheet-a")
  return fetchRaw(`knowledge/${category}/${slug}.md`);
}

// Fetch the last modified date for a file via GitHub Commits API
export async function getFileLastModified(category: string, slug: string): Promise<string | null> {
  try {
    const filePath = `knowledge/${category}/${slug}.md`;
    const res = await fetch(
      `https://api.github.com/repos/${OWNER}/${REPO}/commits?path=${encodeURIComponent(filePath)}&per_page=1`,
      {
        headers,
        next: { revalidate: 3600 }, // Cache for 1 hour (less frequent updates)
      } as RequestInit,
    );
    if (!res.ok) return null;
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) {
      const dateStr = data[0].commit?.committer?.date || data[0].commit?.author?.date;
      if (dateStr) {
        return new Date(dateStr).toLocaleDateString('zh-TW', {
          year: 'numeric', month: '2-digit', day: '2-digit',
        });
      }
    }
    return null;
  } catch {
    return null;
  }
}

// Extract first H1 or first meaningful line as title
export function extractTitle(content: string, fallback: string): string {
  const h1 = content.match(/^#\s+(.+)$/m);
  if (h1) return h1[1].trim();
  const firstLine = content.split('\n').find((l) => l.trim() && !l.startsWith('>') && !l.startsWith('#'));
  return firstLine?.slice(0, 60) || fallback;
}

// Extract snippet — prefers 深度分析 > 摘要 > first meaningful line
export function extractSnippet(content: string, maxLen = 120): string {
  const analysisM = content.match(/\*\*深度分析\*\*\s*\n+(.+)/);
  if (analysisM) {
    const t = analysisM[1].trim();
    return t.length > maxLen ? t.slice(0, maxLen) + '…' : t;
  }
  const summaryM = content.match(/\*\*摘要\*\*[：:]\s*(.+)/);
  if (summaryM) {
    const t = summaryM[1].trim();
    return t.length > maxLen ? t.slice(0, maxLen) + '…' : t;
  }
  const lines = content.split('\n');
  for (const line of lines) {
    const t = line.trim();
    if (t && !t.startsWith('#') && !t.startsWith('>') && !t.startsWith('---') && !t.startsWith('**') && t.length > 10) {
      return t.length > maxLen ? t.slice(0, maxLen) + '…' : t;
    }
  }
  return '';
}

// Count ## sections = entry count for references files
export function countEntries(content: string): number {
  return (content.match(/^##\s/gm) || []).length;
}

// Count entries that have deep analysis (豐富化率)
export function countEnrichedEntries(content: string): number {
  return (content.match(/\*\*深度分析\*\*/g) || []).length
    + (content.match(/\*\*摘要\*\*[：:]/g) || []).length;
}

// ── References entry structured parsing ──────────────────────────────────────

export interface ReferenceEntry {
  title: string;
  date: string;
  url: string;
  purpose: string;
  analysis: string;
  usage: string;
  contentAngle: string;
  imageNotes: string;
  sourceCred: string;
  rawSummary: string;  // fallback for old-format entries
  isStale: boolean;
}

function _extractSection(block: string, label: string): string {
  const re = new RegExp(`\\*\\*${label}\\*\\*\\s*\\n+([\\s\\S]+?)(?=\\n\\*\\*|\\n---\\s*$|$)`);
  const m = block.match(re);
  return m ? m[1].trim() : '';
}

export function parseReferenceEntries(content: string): ReferenceEntry[] {
  const blocks = content.split(/\n---\n/);
  const entries: ReferenceEntry[] = [];
  for (const block of blocks) {
    const trimmed = block.trim();
    const titleM = trimmed.match(/^## (.+?) \((.+?)\)/m);
    if (!titleM) continue;
    const rawTitle = titleM[1].trim();
    const date = titleM[2].trim();
    const isStale = rawTitle.startsWith('⏰');
    const baseTitle = rawTitle.replace(/^⏰\s*/, '');
    const urlM = trimmed.match(/🔗 (https?:\/\/\S+)/);
    const url = urlM ? urlM[1].trim() : '';
    let title = baseTitle;
    if (baseTitle === '未標記' && url) {
      try { title = new URL(url).hostname.replace('www.', ''); } catch { /* keep '未標記' */ }
    }
    const purposeM = trimmed.match(/\*\*用途標籤\*\*[：:]\s*(.+)/);
    const sourceCredM = trimmed.match(/\*\*來源可信度\*\*[：:]\s*(.+)/);
    const summaryM = trimmed.match(/\*\*摘要\*\*[：:]\s*(.+)/);
    entries.push({
      title,
      date,
      url,
      purpose:      purposeM ? purposeM[1].trim() : '',
      analysis:     _extractSection(trimmed, '深度分析'),
      usage:        _extractSection(trimmed, '應用場景'),
      contentAngle: _extractSection(trimmed, '素材轉化角度'),
      imageNotes:   _extractSection(trimmed, '圖片重點'),
      sourceCred:   sourceCredM ? sourceCredM[1].trim() : '',
      rawSummary:   summaryM ? summaryM[1].trim() : '',
      isStale,
    });
  }
  return entries;
}
