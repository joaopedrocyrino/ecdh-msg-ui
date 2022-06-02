import React, { createContext, useContext } from 'react'
import { io, Socket } from "socket.io-client";

const SocketContext = createContext({})

export const SocketProvider: React.FC<{ children: any }> = ({ children }) => {
    const socket = io('http://localhost:5050', {
        withCredentials: true,
        reconnectionDelayMax: 10000
    })

    return (
        <SocketContext.Provider
            value={{
                socket
            }}
        >
            {children}
        </SocketContext.Provider>
    )
}

export const useSocketContext = (): { socket: Socket } => {
    const context = useContext<{ [k: string]: any }>(SocketContext)
    return { socket: context.socket }
}