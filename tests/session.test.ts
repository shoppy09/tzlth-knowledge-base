// 登入通行證回測（2026-11-25，HQ tasks L74；照儀表板 tests/stage2.test.ts 前 6 項，另加跨站隔離）。執行：npm test
// ⚠️ 帳密全是虛構值，不得放真的帳號密碼。
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash, createHmac } from 'node:crypto';
import { signSession, verifySession, credentialsMatch, basicAuthMatch, safeNext, credsFromEnv, SESSION_MAX_AGE_S } from '../lib/session.ts';

const C = { user: 'fake-user', pass: 'fake:pass 密碼' };
const NOW = Date.UTC(2026, 10, 25, 3, 0, 0);
const DAY = 86400000;

test('通行證：剛簽的有效、29 天後仍有效、31 天後失效', () => {
  const t = signSession(C, NOW);
  assert.equal(verifySession(t, C, NOW), true);
  assert.equal(verifySession(t, C, NOW + 29 * DAY), true);
  assert.equal(verifySession(t, C, NOW + 31 * DAY), false);
  assert.equal(SESSION_MAX_AGE_S, 30 * 24 * 3600);
});

test('通行證：竄改、改密碼、格式錯都失效', () => {
  const t = signSession(C, NOW);
  const [v, exp, sig] = t.split('.');
  assert.equal(verifySession(`${v}.${Number(exp) + DAY * 300}.${sig}`, C, NOW), false, '自己把到期日往後改');
  assert.equal(verifySession(`${v}.${exp}.${sig.slice(0, -2)}AA`, C, NOW), false, '改簽章');
  assert.equal(verifySession(t, { ...C, pass: 'changed' }, NOW), false, '改密碼後舊通行證失效');
  assert.equal(verifySession(t, { ...C, secret: 'set-later' }, NOW), false, '設了 SESSION_SECRET 後舊通行證失效');
  for (const bad of ['', 'x', 'v1.abc.def', 'v2.' + exp + '.' + sig, null, undefined]) {
    assert.equal(verifySession(bad as string, C, NOW), false, String(bad));
  }
});

test('通行證：拒收比 30 天更遠的到期日（即使簽章算得出來）', () => {
  const far = signSession(C, NOW + 60 * DAY);
  assert.equal(verifySession(far, C, NOW), false);
});

test('跨站隔離：同一組帳密下，儀表板算法簽的通行證本站不收', () => {
  // 重現儀表板 lib/session.ts（2026-11-24）的簽法：金鑰字串 tzlth-hq-dashboard-session|帳號|密碼
  const exp = NOW + 30 * DAY;
  const key = createHash('sha256').update(`tzlth-hq-dashboard-session|${C.user}|${C.pass}`).digest();
  const dashToken = `v1.${exp}.${createHmac('sha256', key).update(`v1.${exp}`).digest('base64url')}`;
  assert.equal(verifySession(dashToken, C, NOW), false);
  // 設了 SESSION_SECRET 也一樣：兩站就算設成同一個值也不互通
  const keyS = createHash('sha256').update('same-secret').digest();
  const dashTokenS = `v1.${exp}.${createHmac('sha256', keyS).update(`v1.${exp}`).digest('base64url')}`;
  assert.equal(verifySession(dashTokenS, { ...C, secret: 'same-secret' }, NOW), false);
});

test('帳密比對：帳號、密碼都要對；Basic 標頭可含中文與冒號（LINE Bot 問答靠這條）', () => {
  assert.equal(credentialsMatch('fake-user', 'fake:pass 密碼', C), true);
  assert.equal(credentialsMatch('fake-user', 'wrong', C), false);
  assert.equal(credentialsMatch('other', 'fake:pass 密碼', C), false);
  const enc = (s: string) => 'Basic ' + Buffer.from(s, 'utf8').toString('base64');
  assert.equal(basicAuthMatch(enc('fake-user:fake:pass 密碼'), C), true);
  assert.equal(basicAuthMatch(enc('fake-user:nope'), C), false);
  assert.equal(basicAuthMatch('Bearer abc', C), false);
  assert.equal(basicAuthMatch('Basic !!!', C), false);
  assert.equal(basicAuthMatch(null, C), false);
});

test('環境變數：帳密缺一就回 null（登入閘據此一律 503）', () => {
  assert.equal(credsFromEnv({ BASIC_AUTH_USER: 'a' }), null);
  assert.equal(credsFromEnv({ BASIC_AUTH_PASSWORD: 'b' }), null);
  assert.deepEqual(credsFromEnv({ BASIC_AUTH_USER: 'a', BASIC_AUTH_PASSWORD: 'b' }), { user: 'a', pass: 'b', secret: undefined });
});

test('回原頁網址：只收站內路徑', () => {
  assert.equal(safeNext('/methodology'), '/methodology');
  assert.equal(safeNext('/operations/x?y=1'), '/operations/x?y=1');
  for (const bad of ['https://evil.com', '//evil.com', '/' + String.fromCharCode(92) + 'evil.com', 'x', '/login', '/login?next=/', '/api/auth/login', '/a\nb', 42, null, '/' + 'a'.repeat(600)]) {
    assert.equal(safeNext(bad), '/', String(bad));
  }
});
