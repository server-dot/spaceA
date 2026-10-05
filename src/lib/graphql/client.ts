import { DocumentNode } from '@apollo/client'
import { getClient } from '@/lib/apollo-client'
import { WORDPRESS_URL } from '@/lib/constants'

const RETRY_DELAYS_MS = [1000, 3000]

/**
 * 查 WPGraphQL；WP 連不上或回錯誤時「丟例外」，不回 null。
 * 頁面都是 ISR：重新產生時丟例外，Next 會繼續給上一版快取、下次再試；
 * 以前回 null，文章頁會當成「這篇不存在」呼叫 notFound()，404 被存進快取、
 * 不清快取就一直 404（sitemap 也會被存成空的）。
 * 查詢成功但東西真的不在（例如 post 是 null）照常回資料，由呼叫端判斷 404。
 * WP 偶爾一兩秒的 5xx 或回傳被截斷的 JSON 很常見（build 時大量併發更容易），重試兩次再放棄。
 */
export async function fetchQuery<T = Record<string, unknown>>(
  query: DocumentNode,
  variables?: Record<string, unknown>
): Promise<T> {
  let lastError: unknown
  for (let attempt = 0; attempt < RETRY_DELAYS_MS.length + 1; attempt++) {
    try {
      const { data, error } = await getClient().query({
        query,
        variables,
        errorPolicy: 'all',
        // 重試要真的再打一次 WP：Apollo 的記憶體快取用 network-only 跳過；
        // Next 的 fetch 快取以網址為 key，壞掉的回應（例如被截斷的 JSON）也會被存住，
        // 換一個網址參數才拿得到新的。不用 cache: 'no-store'，那會讓 ISR 頁面變成動態渲染
        fetchPolicy: attempt === 0 ? 'cache-first' : 'network-only',
        context: attempt === 0 ? undefined : { uri: `${WORDPRESS_URL}/graphql?retry=${Date.now()}` },
      })
      if (data) return data as T
      lastError = error ?? new Error('WPGraphQL 沒有回傳資料')
    } catch (err) {
      lastError = err
    }
    const delay = RETRY_DELAYS_MS[attempt]
    if (delay) await new Promise((r) => setTimeout(r, delay))
  }
  console.error('[fetchQuery] failed', JSON.stringify(variables), lastError)
  throw lastError instanceof Error ? lastError : new Error(String(lastError))
}

/**
 * 不進快取的即時請求（站內搜尋、分類頁「載入更多」）用：WP 出錯時回 null 讓畫面顯示空結果，
 * 不要整頁變錯誤頁。ISR 頁面不要用這支，理由見 fetchQuery。
 */
export async function fetchQueryOrNull<T = Record<string, unknown>>(
  query: DocumentNode,
  variables?: Record<string, unknown>
): Promise<T | null> {
  try {
    return await fetchQuery<T>(query, variables)
  } catch {
    return null
  }
}
