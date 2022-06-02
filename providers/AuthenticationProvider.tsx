import React, { createContext, useContext, useEffect, useState } from 'react'

const AuthenticationContext = createContext({})

export const AuthenticationProvider: React.FC<{ children: any }> = ({ children }) => {
    const [login, setLogin] = useState<string>('')
    const [token, setToken] = useState<string>('')

    const setPersistantLogin = (key: string) => {
        if (key) {
            localStorage.setItem('login', key)
        } else { localStorage.removeItem('login') }
        setLogin(key)
    }

    const setPersistantToken = (key: string) => {
        if (key) {
            localStorage.setItem('token', key)
        } else { localStorage.removeItem('token') }
        setToken(key)
    }

    useEffect(() => {
        setLogin(localStorage.getItem('login') ?? '')
        setToken(localStorage.getItem('token') ?? '')
    }, [])

    return (
        <AuthenticationContext.Provider
            value={{
                login,
                token,
                setLogin: setPersistantLogin,
                setToken: setPersistantToken
            }}
        >
            {children}
        </AuthenticationContext.Provider>
    )
}

export const useAuthenticationContext = (): {
    login: string,
    token: string,
    setLogin: (l: string) => void,
    setToken: (l: string) => void
} => {
    const context = useContext<{ [k: string]: any }>(AuthenticationContext)
    return {
        login: context.login,
        token: context.token,
        setLogin: context.setLogin,
        setToken: context.setToken
    }
}