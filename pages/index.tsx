import type { NextPage } from 'next'
import styles from '../styles/Home.module.css'
import { useECDHcontext, useAuthenticationContext } from '../providers'
import React, { createContext, useContext, useState } from 'react'
import { Login, CreateAccount, Chat, ChatList } from '../ui'

const AppContext = createContext({})

const Home: React.FC = () => {
  const { privKey } = useECDHcontext()
  const { token } = useAuthenticationContext()
  const { createAccount, chatId } = useContext<{ [k: string]: any }>(AppContext)

  if (createAccount) {
    return <CreateAccount context={AppContext} />
  }

  if (!token) {
    return <Login context={AppContext} />
  }

  if (chatId) {
    return <Chat context={AppContext} />
  }

  return <ChatList context={AppContext} />
}

const App: NextPage = () => {
  const [username, setUsername] = useState<string>('')
  const [validate, setValidate] = useState<boolean>(false)
  const [createAccount, setCreateAccount] = useState<boolean>(false)
  const [chatId, setChatId] = useState<string>('')

  return (
    <AppContext.Provider
      value={{
        username,
        setUsername,
        validate,
        setValidate,
        createAccount,
        setCreateAccount: () => setCreateAccount(!createAccount),
        chatId,
        setChatId
      }}
    >
      <Home />
    </AppContext.Provider>
  )
}

export default App
