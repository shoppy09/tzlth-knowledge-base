import { notFound } from 'next/navigation';
import { marked } from 'marked';
import {
  getCategoryFiles,
  getFileContent,
  CATEGORY_DEFS,
  extractTitle,
  parseReferenceEntries,
  type ReferenceEntry,
} from '@/lib/knowledge';

export const revalidate = 300;

marked.setOptions({ gfm: true, breaks: false });

// ── Reference entry card ──────────────────────────────────────────────────────

function Section({ label, content }: { label: string; content: string }) {
  if (!content) return null;
  return (
    <div style={{ marginTop: '0.875rem' }}>
      <div style={{
        fontSize: '0.6875rem',
        fontWeight: 700,
        color: 'var(--muted)',
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        marginBottom: '0.3rem',
      }}>
        {label}
      </div>
      <div style={{
        fontSize: '0.875rem',
        color: 'var(--charcoal-soft)',
        lineHeight: 1.65,
        whiteSpace: 'pre-wrap',
      }}>
        {content}
      </div>
    </div>
  );
}

function ReferenceCard({ entry }: { entry: ReferenceEntry }) {
  const hasRich = entry.analysis || entry.usage || entry.contentAngle;

  return (
    <div style={{
      background: 'var(--white)',
      border: `1px solid ${entry.isStale ? '#f5c842' : 'var(--border)'}`,
      borderRadius: 10,
      padding: '1.25rem 1.5rem',
      marginBottom: '1.25rem',
      opacity: entry.isStale ? 0.82 : 1,
    }}>
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span style={{
              fontSize: '1rem',
              fontWeight: 600,
              color: 'var(--charcoal)',
            }}>
              {entry.isStale && <span title="可能過時" style={{ marginRight: '0.25rem' }}>⏰</span>}
              {entry.title}
            </span>
            <span style={{
              fontSize: '0.75rem',
              color: 'var(--muted)',
              flexShrink: 0,
            }}>
              {entry.date}
            </span>
          </div>

          {/* URL */}
          {entry.url && (
            <div style={{ marginTop: '0.3rem' }}>
              <a
                href={entry.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontSize: '0.775rem',
                  color: 'var(--accent)',
                  textDecoration: 'none',
                  wordBreak: 'break-all',
                }}
              >
                🔗 {entry.url}
              </a>
            </div>
          )}
        </div>

        {/* Purpose badge */}
        {entry.purpose && (
          <span style={{
            fontSize: '0.7rem',
            background: 'var(--accent)',
            color: '#fff',
            borderRadius: 20,
            padding: '0.2rem 0.65rem',
            fontWeight: 600,
            whiteSpace: 'nowrap',
            flexShrink: 0,
          }}>
            {entry.purpose}
          </span>
        )}
      </div>

      {/* Rich sections */}
      {hasRich ? (
        <>
          <Section label="深度分析" content={entry.analysis} />
          <Section label="應用場景" content={entry.usage} />
          <Section label="素材轉化角度" content={entry.contentAngle} />
          {entry.imageNotes && entry.imageNotes !== '純文字內容' && (
            <Section label="圖片重點" content={entry.imageNotes} />
          )}
          {entry.sourceCred && (
            <div style={{ marginTop: '0.875rem', fontSize: '0.775rem', color: 'var(--muted)' }}>
              來源可信度：{entry.sourceCred}
            </div>
          )}
        </>
      ) : (
        /* Fallback: raw summary or bare text */
        entry.rawSummary && (
          <div style={{
            marginTop: '0.75rem',
            fontSize: '0.875rem',
            color: 'var(--charcoal-soft)',
            lineHeight: 1.65,
          }}>
            {entry.rawSummary}
          </div>
        )
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ category: string; slug: string }>;
}) {
  const { category, slug } = await params;
  const def = CATEGORY_DEFS[category];
  if (!def) notFound();

  let content: string;
  try {
    content = await getFileContent(category, slug);
  } catch {
    notFound();
  }

  const title = extractTitle(content, slug);
  const siblings = await getCategoryFiles(category).catch(() => []);
  const isReferences = category === 'references';

  let html = '';
  let entries: ReferenceEntry[] = [];

  if (isReferences) {
    entries = parseReferenceEntries(content);
  } else {
    html = await marked(content);
  }

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '2.5rem 1.5rem' }}>

      {/* Breadcrumb */}
      <div style={{ marginBottom: '1.5rem', fontSize: '0.8125rem', color: 'var(--muted)' }}>
        <a href="/" style={{ color: 'var(--accent)', textDecoration: 'none' }}>知識庫</a>
        <span style={{ margin: '0 0.5rem' }}>/</span>
        <a href={`/${category}`} style={{ color: 'var(--accent)', textDecoration: 'none' }}>{def.label}</a>
        <span style={{ margin: '0 0.5rem' }}>/</span>
        <span style={{ color: 'var(--charcoal-soft)' }}>{title}</span>
      </div>

      <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>

        {/* Main content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {isReferences ? (
            <>
              {/* Stats bar */}
              <div style={{
                marginBottom: '1.25rem',
                padding: '0.625rem 1rem',
                background: 'var(--white)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                fontSize: '0.8125rem',
                color: 'var(--muted)',
                display: 'flex',
                gap: '1.25rem',
              }}>
                <span>共 <strong style={{ color: 'var(--charcoal)' }}>{entries.length}</strong> 條</span>
                <span>豐富化 <strong style={{ color: 'var(--accent)' }}>
                  {entries.filter(e => e.analysis || e.usage).length}
                </strong> 條</span>
                {entries.filter(e => e.isStale).length > 0 && (
                  <span>⏰ 待更新 {entries.filter(e => e.isStale).length} 條</span>
                )}
              </div>

              {entries.length > 0 ? (
                entries.map((entry, i) => (
                  <ReferenceCard key={i} entry={entry} />
                ))
              ) : (
                <div style={{
                  background: 'var(--white)',
                  border: '1px solid var(--border)',
                  borderRadius: 10,
                  padding: '3rem',
                  textAlign: 'center',
                  color: 'var(--muted)',
                }}>
                  尚無條目
                </div>
              )}
            </>
          ) : (
            <article style={{
              background: 'var(--white)',
              border: '1px solid var(--border)',
              borderRadius: 10,
              padding: '2rem 2.25rem',
            }}>
              <div
                className="prose"
                dangerouslySetInnerHTML={{ __html: html }}
              />
            </article>
          )}
        </div>

        {/* Sidebar */}
        {siblings.length > 1 && (
          <aside style={{
            width: 220,
            flexShrink: 0,
            position: 'sticky',
            top: 72,
          }}>
            <div style={{
              background: 'var(--white)',
              border: '1px solid var(--border)',
              borderRadius: 8,
              overflow: 'hidden',
            }}>
              <div style={{
                padding: '0.75rem 1rem',
                borderBottom: '1px solid var(--border)',
                fontSize: '0.75rem',
                fontWeight: 600,
                color: 'var(--muted)',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
              }}>
                {def.icon} {def.label}
              </div>
              {siblings.map((s) => (
                <a
                  key={s.slug}
                  href={`/${category}/${s.slug}`}
                  className={`sidebar-item${s.slug === slug ? ' active' : ''}`}
                >
                  {s.name}
                </a>
              ))}
            </div>
          </aside>
        )}
      </div>

      {/* Bottom nav */}
      <div style={{ marginTop: '1.5rem' }}>
        <a
          href={`/${category}`}
          style={{
            color: 'var(--muted)',
            textDecoration: 'none',
            fontSize: '0.8125rem',
          }}
        >
          ← 返回 {def.label}
        </a>
      </div>
    </div>
  );
}
