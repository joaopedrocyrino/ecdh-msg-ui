import styles from '../styles/Login.module.css'
import { useECDHcontext, useAuthenticationContext } from '../providers'
import React, { useContext, useEffect, useState } from 'react'
import { Input } from '../components'
import { gql, useLazyQuery } from '@apollo/client'

const LOGIN = gql`
query login($login: String!, $password: String!) {
    login(input: {
        login: $login,
        password: $password
    })
}`

const Login: React.FC<{ context: React.Context<{ [k: string]: any }> }> = ({ context }) => {
    const [password, setPassword] = useState<string>('')
    const {
        validate,
        setValidate,
        username,
        setUsername,
        setCreateAccount
    } = useContext(context)
    const { setToken } = useAuthenticationContext()
    const { setPrivKey } = useECDHcontext()
    const [onLogIn] = useLazyQuery(LOGIN);

    const submitLogIn = async () => {
        try {
            setValidate(true)

            if (username && password) {
                setValidate(false)

                const { data, error } = await onLogIn({
                    variables: {
                        login: username,
                        password
                    },
                })

                if (error) { console.error('error log in') }

                setPrivKey(password)
                setToken(data.login)
            }
        } catch (e) { console.error('error log in', e) }
    }

    return (
        <div className={styles.loginContainer}>
            <Input
                placeHolder='Username'
                value={username}
                setValue={setUsername}
                err={validate && !username}
            />
            <Input
                placeHolder='Password'
                type='password'
                value={password}
                setValue={setPassword}
                err={validate && !password}
            />
            <button
                className={styles.button}
                onClick={() => submitLogIn()}
            >
                LOGIN
            </button>
            <button
                className={`${styles.button} ${styles.secondary}`}
                onClick={setCreateAccount}
            >
                CREATE ACCOUNT
            </button>
        </div>
    )
}

export default Login
