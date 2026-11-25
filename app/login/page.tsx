// 登入頁（2026-11-25，比照儀表板 HQ RCF-343）：純表單、不靠前端程式；autocomplete 讓手機鑰匙圈／密碼管理員能存與帶入
// 本站沒有路由群組，登入頁會帶站頂列（只有首頁與儀表板連結，沒有知識內容）——刻意保留，不搬全部頁面。
import { safeNext } from '@/lib/session';

export const metadata = { title: '登入 | 知識庫 | 職涯停看聽', robots: { index: false, follow: false } };
export const dynamic = 'force-dynamic';

const field = {
  width: '100%', height: 48, padding: '0 14px', fontSize: 16, borderRadius: 10,
  border: '1px solid var(--border)', backgroundColor: 'var(--white)', color: 'var(--charcoal)',
} as const;

export default async function LoginPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const next = safeNext(typeof sp.next === 'string' ? sp.next : '/');
  const failed = sp.e === '1';
  return (
    <div style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 20px' }}>
      <form method="post" action="/api/auth/login"
        style={{ width: '100%', maxWidth: 384, borderRadius: 16, padding: 24, display: 'flex', flexDirection: 'column', gap: 16,
          backgroundColor: 'var(--white)', border: '1px solid var(--border)' }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.18em', color: 'var(--accent)' }}>KNOWLEDGE</div>
          <h1 style={{ fontSize: 18, fontWeight: 700, marginTop: 4, color: 'var(--charcoal)' }}>職涯停看聽 知識庫</h1>
          <p style={{ fontSize: 14, marginTop: 4, color: 'var(--muted)' }}>登入一次，這台裝置 30 天內不用再登入</p>
        </div>
        {failed && (
          <div style={{ fontSize: 14, borderRadius: 8, padding: '8px 12px', color: '#b91c1c', backgroundColor: '#ef444415', border: '1px solid #ef444455' }}>
            帳號或密碼不對，請再試一次
          </div>
        )}
        <input type="hidden" name="next" value={next} />
        <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 14, color: 'var(--charcoal-soft)' }}>
          帳號
          <input name="user" autoComplete="username" autoCapitalize="none" autoCorrect="off" spellCheck={false} required style={field} />
        </label>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 14, color: 'var(--charcoal-soft)' }}>
          密碼
          <input name="pass" type="password" autoComplete="current-password" required style={field} />
        </label>
        <button type="submit" style={{ height: 48, borderRadius: 10, fontSize: 16, fontWeight: 700, backgroundColor: 'var(--accent)', color: '#fff', border: 0, cursor: 'pointer' }}>
          登入
        </button>
      </form>
    </div>
  );
}
