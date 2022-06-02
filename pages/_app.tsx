import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { ECDHprovider, AuthenticationProvider, SocketProvider } from '../providers'
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider
} from "@apollo/client";

const client = new ApolloClient({
  uri: 'http://localhost:4000',
  cache: new InMemoryCache()
});

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ApolloProvider client={client}>
      <SocketProvider>
        <ECDHprovider>
          <AuthenticationProvider>
            <Component {...pageProps} />
          </AuthenticationProvider>
        </ECDHprovider>
      </SocketProvider>
    </ApolloProvider>
  )
}

export default MyApp
