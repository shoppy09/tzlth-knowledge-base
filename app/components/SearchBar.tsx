'use client';

import { useState, useMemo } from 'react';

interface SearchFile {
  slug: string;
  name: string;
  categoryKey: string;
  categoryLabel: string;
  categoryIcon: string;
}

interface Props {
  files: SearchFile[];
}

export default function SearchBar({ files }: Props) {
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q || q.length < 2) return [];
    const terms = q.split(/\s+/);
    return files.filter((f) => {
      const haystack = `${f.name} ${f.slug} ${f.categoryLabel}`.toLowerCase();
      return terms.every((t) => haystack.includes(t));
    }).slice(0, 20);
  }, [query, files]);

  // Group results by category
  const grouped = useMemo(() => {
    const map = new Map<string, SearchFile[]>();
    for (const r of results) {
      const existing = map.get(r.categoryKey) || [];
      existing.push(r);
      map.set(r.categoryKey, existing);
    }
    return map;
  }, [results]);

  const showResults = query.trim().length >= 2;

  return (
    <div style={{ marginBottom: '2rem', position: 'relative' }}>
      <div style={{ position: 'relative' }}>
        <span style={{
          position: 'absolute',
          left: '0.875rem',
          top: '50%',
          transform: 'translateY(-50%)',
          fontSize: '1rem',
          color: 'var(--muted)',
          pointerEvents: 'none',
        }}>
          🔍
        </span>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="搜尋文件名稱（輸入 2 字以上開始搜尋）"
          style={{
            width: '100%',
            padding: '0.625rem 0.875rem 0.625rem 2.5rem',
            fontSize: '0.9375rem',
            border: '1px solid var(--border)',
            borderRadius: 8,
            background: 'var(--white)',
            color: 'var(--charcoal)',
            outline: 'none',
            transition: 'border-color 0.15s',
            boxSizing: 'border-box',
          }}
          onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--accent)'; }}
          onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; }}
        />
      </div>

      {showResults && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          marginTop: '0.375rem',
          background: 'var(--white)',
          border: '1px solid var(--border)',
          borderRadius: 8,
          boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
          maxHeight: 400,
          overflowY: 'auto',
          zIndex: 100,
        }}>
          {results.length === 0 ? (
            <div style={{
              padding: '1rem 1.25rem',
              color: 'var(--muted)',
              fontSize: '0.875rem',
              textAlign: 'center',
            }}>
              找不到符合的文件
            </div>
          ) : (
            Array.from(grouped.entries()).map(([catKey, catFiles]) => (
              <div key={catKey}>
                <div style={{
                  padding: '0.5rem 1rem',
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  color: 'var(--muted)',
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  borderBottom: '1px solid var(--border)',
                  background: 'var(--cream)',
                }}>
                  {catFiles[0].categoryIcon} {catFiles[0].categoryLabel}
                </div>
                {catFiles.map((f) => (
                  <a
                    key={`${f.categoryKey}/${f.slug}`}
                    href={`/${f.categoryKey}/${f.slug}`}
                    style={{
                      display: 'block',
                      padding: '0.5rem 1rem 0.5rem 1.75rem',
                      fontSize: '0.875rem',
                      color: 'var(--charcoal)',
                      textDecoration: 'none',
                      borderBottom: '1px solid var(--border)',
                      transition: 'background 0.1s',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--cream)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                  >
                    {f.name}
                  </a>
                ))}
              </div>
            ))
          )}
          <div style={{
            padding: '0.375rem 1rem',
            fontSize: '0.75rem',
            color: 'var(--muted)',
            textAlign: 'right',
            borderTop: results.length > 0 ? 'none' : undefined,
          }}>
            {results.length} 筆結果
          </div>
        </div>
      )}
    </div>
  );
}
