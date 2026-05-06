import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client'
import { registerApolloClient } from '@apollo/experimental-nextjs-app-support'
import { WORDPRESS_URL } from './constants'

export const { getClient, query, PreloadQuery } = registerApolloClient(() => {
  return new ApolloClient({
    cache: new InMemoryCache(),
    link: new HttpLink({
      uri: `${WORDPRESS_URL}/graphql`,
    }),
  })
})
