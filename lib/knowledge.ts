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
    description: '職涯顧問方法論、諮詢框架、履歷診斷邏輯',
  },
  operations: {
    label: '操作 SOP',
    icon: '⚙️',
    description: '系統操作流程、週例行工作、部門跨工作流',
  },
  decisions: {
    label: '決策記錄',
    icon: '📋',
    description: '重要架構決策、技術選型理由',
  },
  references: {
    label: '參考文件',
    icon: '📖',
    description: '從 LINE 群組同步的知識，涵蓋 AI 工具、社群行銷、職涯顧問等',
  },
  analyses: {
    label: '學習分析',
    icon: '🔍',
    description: '從外部內容（Threads / YouTube / 文章）萃取的八維學習分析筆記',
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

export async function getAllCategories(): Promise<KnowledgeCategory[]> {
  const keys = ['methodology', 'operations', 'decisions', 'references', 'analyses'];
  return Promise.all(
    keys.map(async (key) => {
      const def = CATEGORY_DEFS[key];
      const items = await fetchDir(`knowledge/${key}`).catch(() => []);
      const files: KnowledgeFile[] = items
        .filter((i) => i.type === 'file' && i.name.endsWith('.md') && i.name !== 'README.md')
        .map((i) => ({
          slug: i.name.replace(/\.md$/, ''),
          name: i.name.replace(/\.md$/, '').replace(/-/g, ' '),
          path: i.path,
        }));
      return { key, ...def, files };
    })
  );
}

export async function getCategoryFiles(category: string): Promise<KnowledgeFile[]> {
  const items = await fetchDir(`knowledge/${category}`).catch(() => []);
  return items
    .filter((i) => i.type === 'file' && i.name.endsWith('.md') && i.name !== 'README.md')
    .map((i) => ({
      slug: i.name.replace(/\.md$/, ''),
      name: i.name.replace(/\.md$/, ''),
      path: i.path,
    }));
}

export async function getFileContent(category: string, slug: string): Promise<string> {
  return fetchRaw(`knowledge/${category}/${slug}.md`);
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
    const title = rawTitle.replace(/^⏰\s*/, '');
    const urlM = trimmed.match(/🔗 (https?:\/\/\S+)/);
    const url = urlM ? urlM[1].trim() : '';
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
