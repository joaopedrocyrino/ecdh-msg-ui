import styles from '../styles/CreateAccount.module.css'
import { useECDHcontext, useAuthenticationContext } from '../providers'
import React, { useContext } from 'react'
import { Input } from '../components'
import { gql, useMutation } from '@apollo/client'

const CREATE = gql`
mutation Create($pubKey: String!, $login: String!, $password: String!) {
    createUser(input: {
        pubKey: $pubKey,
        login: $login,
        password: $password
    })
}`

const CreateAccount: React.FC<{ context: React.Context<{ [k: string]: any }> }> = ({ context }) => {
    const {
        username,
        setUsername,
        validate,
        setValidate,
        setCreateAccount
    } = useContext(context)
    const { setToken } = useAuthenticationContext()
    const { generateKeys } = useECDHcontext()
    const [apiCall, { error }] = useMutation(CREATE);

    const submit = async () => {
        try {
            setValidate(true)

            if (username) {
                setValidate(false)

                const { priv, pub } = await generateKeys()

                const { data: { createUser } } = await apiCall({
                    variables: {
                        login: username,
                        pubKey: pub,
                        password: priv
                    },
                })

                console.log(`Save this password on a safe place it wont appear again: ${priv}`)

                setToken(createUser)
                setCreateAccount()
            }
        } catch (e) { console.log(error) }
    }

    return (
        <div className={styles.createAccContainer}>
            <Input
                placeHolder='Username'
                value={username}
                setValue={setUsername}
                err={validate && !username}
            />
            <button
                className={styles.button}
                onClick={submit}
            >
                CREATE
            </button>
        </div>
    )
}

export default CreateAccount
