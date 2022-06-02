import React, { createContext, useContext, useEffect, useState } from 'react'
import jwt from 'jsonwebtoken'

const AuthenticationContext = createContext({})

export const AuthenticationProvider: React.FC<{ children: any }> = ({ children }) => {
    const [token, setToken] = useState<string>('')
    const [userId, setUserId] = useState<string>('')

    useEffect(() => {
        if (token) {
            const payload = jwt.decode(token) as { userId: string }
            setUserId(payload.userId)
        }
    }, [token])

    return (
        <AuthenticationContext.Provider
            value={{
                token,
                setToken,
                userId,
                setUserId
            }}
        >
            {children}
        </AuthenticationContext.Provider>
    )
}

export const useAuthenticationContext = (): {
    token: string,
    setToken: (l: string) => void
    userId: string,
    setUserId: (l: string) => void
} => {
    const context = useContext<{ [k: string]: any }>(AuthenticationContext)
    return {
        token: context.token,
        setToken: context.setToken,
        userId: context.userId,
        setUserId: context.setUserId
    }
}