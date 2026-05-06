import { DocumentNode } from '@apollo/client'
import { getClient } from '@/lib/apollo-client'

export async function fetchQuery<T = Record<string, unknown>>(
  query: DocumentNode,
  variables?: Record<string, unknown>
): Promise<T | null> {
  try {
    const { data } = await getClient().query({ query, variables, errorPolicy: 'all' })
    return (data as T) ?? null
  } catch {
    return null
  }
}
