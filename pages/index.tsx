import type { NextPage } from 'next'
import styles from '../styles/Home.module.css'
import { useECDHcontext } from '../providers'
import { useEffect } from 'react'

const Home: NextPage = () => {
  const { generateKeys, privKey, pubKey } = useECDHcontext()

  return (
    <div className={styles.container}>
      {privKey && pubKey ? null : <button onClick={generateKeys}>gerar</button>}
    </div>
  )
}

export default Home
