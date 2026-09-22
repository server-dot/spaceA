import { SITE_URL } from '@/lib/constants'

/**
 * IndexNow：網址有新增／更新時主動通知 Bing（ChatGPT 搜尋、Copilot 走 Bing 索引）、Naver、Yandex 等，
 * 不用等它們自己來爬。Google 不收 IndexNow，Google 那邊靠 sitemap。
 * 金鑰放 INDEXNOW_KEY，驗證檔由 /indexnow-key.txt 動態吐出（keyLocation 指過去，不用把金鑰命名成檔名）。
 * 沒設金鑰就靜靜跳過，不影響 revalidate 本身。
 */
export const INDEXNOW_KEY_PATH = '/indexnow-key.txt'

export async function submitToIndexNow(paths: string[]): Promise<{ submitted: boolean; status?: number; error?: string }> {
  const key = process.env.INDEXNOW_KEY
  if (!key) return { submitted: false, error: 'INDEXNOW_KEY not set' }

  const urlList = Array.from(new Set(paths.map((p) => `${SITE_URL}${p}`)))
  try {
    const res = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({
        host: new URL(SITE_URL).host,
        key,
        keyLocation: `${SITE_URL}${INDEXNOW_KEY_PATH}`,
        urlList,
      }),
      signal: AbortSignal.timeout(8000),
    })
    // 200 已收、202 收下待驗證金鑰；其他都算失敗
    return { submitted: res.status === 200 || res.status === 202, status: res.status }
  } catch (err) {
    return { submitted: false, error: err instanceof Error ? err.message : String(err) }
  }
}
