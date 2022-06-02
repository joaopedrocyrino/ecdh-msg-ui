/* eslint-disable react-hooks/exhaustive-deps */
import styles from '../styles/ChatList.module.css'
import { useAuthenticationContext } from '../providers'
import { Input } from '../components'
import React, { useContext, useEffect, useState } from 'react'
import { gql, useLazyQuery, useMutation } from '@apollo/client'

const GET = gql`
query get($token: String!) {
    getOneUser(input: {
        token: $token
    }) {
        chats {
            id
            users {
                id
                login
            }
        }
    }
}`

const CREATE = gql`
mutation create($token: String!, $bob: ID!) {
    createChat(input: {
        token: $token
        bob: $bob
    })
}`

const ChatsList: React.FC<{ context: React.Context<{ [k: string]: any }> }> = ({ context }) => {
    const [chats, setChats] = useState<Array<{ id: string, name: string }>>([])
    const [newChat, setNewChat] = useState<string>('')
    const [loading, setLoading] = useState<boolean>(false)
    const [createChat, setcreateChat] = useState<boolean>(false)
    const { username, setChatId } = useContext(context)
    const { token, userId } = useAuthenticationContext()
    const [apiCall] = useLazyQuery(GET);
    const [createC, { error: muErr }] = useMutation(CREATE);

    const onCreate = async () => {
        try {
            setLoading(true)
            await createC({
                variables: {
                    token,
                    bob: newChat,
                },
            })

            if (muErr) {
                console.error('failed to create chat', muErr)
                return
            }

            onMount()
            setNewChat('')
            setcreateChat(false)
        } catch (e) { console.error(e) } finally { setLoading(false) }
    }

    const onMount = async () => {
        try {
            setLoading(true)
            const { data: { getOneUser }, error } = await apiCall({
                variables: { token },
            })

            if (error) {
                console.error('failed to fetch chats')
                return
            }

            const userChats = getOneUser.chats.map((c: any) => ({
                id: c.id,
                name: c.users[0].id === userId ? c.users[1].login : c.users[0].login
            }))

            setChats(userChats)
        } catch (e) { console.error(e) } finally { setLoading(false) }
    }

    useEffect(() => {
        onMount()
    }, [])

    return (
        <div className={styles.container}>
            <h2>{username} - {userId}</h2>
            {createChat ?
                <>
                    <Input placeHolder='User Id' value={newChat} setValue={setNewChat} />
                    <button onClick={onCreate}>CREATE</button>
                </>
                :
                <>
                    <button onClick={() => setcreateChat(true)}>CREATE</button>
                    <div className={styles.chatsContainer}>
                        {chats.map((chat, i) => (
                            <div key={i} className={styles.chat}>
                                <p>{chat.name}</p>
                                <button onClick={() => setChatId(chat.id)}>CHAT</button>
                            </div>
                        ))}
                    </div>
                </>
            }
        </div>
    )
}

export default ChatsList
