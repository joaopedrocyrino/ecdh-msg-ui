import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { ECDHprovider, AuthenticationProvider } from '../providers'

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ECDHprovider>
      <AuthenticationProvider>
        <Component {...pageProps} />
      </AuthenticationProvider>
    </ECDHprovider>
  )
}

export default MyApp
