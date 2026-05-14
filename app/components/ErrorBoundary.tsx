'use client';

import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div style={{
          padding: '2rem',
          textAlign: 'center',
          background: 'var(--white)',
          border: '1px solid var(--border)',
          borderRadius: 10,
          margin: '2rem auto',
          maxWidth: 600,
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>⚠️</div>
          <div style={{
            fontSize: '1rem',
            fontWeight: 600,
            color: 'var(--charcoal)',
            marginBottom: '0.5rem',
          }}>
            載入內容時發生錯誤
          </div>
          <div style={{
            fontSize: '0.8125rem',
            color: 'var(--muted)',
            marginBottom: '1rem',
          }}>
            {this.state.error?.message || '請稍後再試'}
          </div>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            style={{
              padding: '0.5rem 1.25rem',
              background: 'var(--accent)',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              fontSize: '0.8125rem',
              cursor: 'pointer',
            }}
          >
            重新載入
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
