/* eslint-disable react-hooks/exhaustive-deps */
import styles from '../styles/Chat.module.css'
import { useECDHcontext, useAuthenticationContext, useSocketContext } from '../providers'
import React, { useContext, useEffect, useState } from 'react'
import { Input } from '../components'
import { gql, useLazyQuery, useMutation } from '@apollo/client'

const GET = gql`
query get($token: String!, $id: ID!) {
    getOneChat(input: {
        token: $token
        id: $id
    }) {
        msgs {
            id
            sender
            body
            createdAt
        }
        users {
            id
            login
            pubKey
        }
    }
}`

const CREATE = gql`
mutation create($token: String!, $chatId: ID!, $body: String!) {
    createMsg(input: {
        token: $token
        chatId: $chatId
        body: $body
    })
}`

const Chat: React.FC<{ context: React.Context<{ [k: string]: any }> }> = ({ context }) => {
    const [decryptedMsgs, setDecryptedMsgs] = useState<Array<{ id: string, sender: string, body: string, createdAt: string }>>([])
    const [encryptedMsgs, setEncryptedMsgs] = useState<Array<{ id: string, sender: string, body: string, createdAt: string }>>([])
    const [chatName, setChatName] = useState<string>('')
    const [message, setMessage] = useState<string>('')
    const [loading, setLoading] = useState<boolean>(false)
    const { chatId } = useContext(context)
    const { token, userId } = useAuthenticationContext()
    const { generateSecret, secret, encrypt, decrypt } = useECDHcontext()
    const [apiCall] = useLazyQuery(GET);
    const [sendMsg, { error: muErr }] = useMutation(CREATE);
    const { socket } = useSocketContext()

    const send = async () => {
        try {
            setLoading(true)

            await sendMsg({
                variables: {
                    token,
                    chatId,
                    body: await encrypt(message)
                },
            })

            if (muErr) {
                console.error('failed to send msg')
                return
            }

            setMessage('')
        } catch (e) { console.error(e) } finally { setLoading(false) }
    }

    const onMount = async () => {
        try {
            setLoading(true)
            const { data, error } = await apiCall({
                variables: {
                    token,
                    id: chatId,
                },
            })

            if (error) {
                console.error('failed to fetch hat', error)
                return
            }

            const { msgs, users } = data.getOneChat

            setEncryptedMsgs(msgs)

            const [user1, user2] = users

            const bob = user1.id === userId ? user2 : user1

            setChatName(`${bob.login} - ${bob.id}`)

            await generateSecret(bob.pubKey)
        } catch (e) { console.error(e) } finally { setLoading(false) }
    }

    const decryptMsgs = async () => {
        const dms = await Promise.all(encryptedMsgs.map(async (record) => {
            const { body, ...msg } = record
            const item = {
                ...msg,
                body: await decrypt(body)
            }

            return item
        }))

        setDecryptedMsgs(dms)
    }

    socket.on(chatId, (data: any) => {
        const newMsg = [...encryptedMsgs, data]
        console.log('neww: ', newMsg);
        setEncryptedMsgs([...newMsg])
    })

    useEffect(() => {
        if (secret) {
            console.log('secret: ', secret);
            console.log('encryptedMsgs: ', encryptedMsgs);
            
            decryptMsgs()
         }
    }, [secret, encryptedMsgs])

    useEffect(() => {
        onMount()
        return () => { socket.removeAllListeners(chatId) }
    }, [])

    return (
        <div className={styles.container}>
            <h2>{chatName}</h2>
            <div className={styles.msgsContainer}>
                {decryptedMsgs.map((msg, i) => (
                    <div key={i} className={`${styles.msgWrapper} ${msg.sender === userId ? styles.yours : ''}`}>
                        <p>{msg.sender === userId ? 'you:' : chatName}</p>
                        <p>{msg.body}</p>
                    </div>
                ))}
            </div>
            <Input placeHolder='Message' value={message} setValue={setMessage} />
            <button disabled={loading} onClick={send}>SEND</button>
        </div>
    )
}

export default Chat
