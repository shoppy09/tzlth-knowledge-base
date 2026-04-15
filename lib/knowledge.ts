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
  const keys = ['methodology', 'operations', 'decisions', 'references'];
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

// Extract snippet for preview
export function extractSnippet(content: string, maxLen = 120): string {
  const lines = content.split('\n');
  for (const line of lines) {
    const t = line.trim();
    if (t && !t.startsWith('#') && !t.startsWith('>') && !t.startsWith('---') && t.length > 10) {
      return t.length > maxLen ? t.slice(0, maxLen) + '…' : t;
    }
  }
  return '';
}

// Count ## sections = entry count for references files
export function countEntries(content: string): number {
  return (content.match(/^##\s/gm) || []).length;
}
