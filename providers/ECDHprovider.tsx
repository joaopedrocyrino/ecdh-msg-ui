import React, { createContext, useContext, useEffect, useState } from 'react'

const ECDHcontext = createContext({})

const buf2Hex = (buf: any) => {
    return Array.from(new Uint8Array(buf))
        .map(x => ('00' + x.toString(16)).slice(-2))
        .join('')
}

const hex2Arr = (str: string) => {
    if (!str) {
        return new Uint8Array()
    }
    const arr = []
    for (let i = 0, len = str.length; i < len; i += 2) {
        arr.push(parseInt(str.substr(i, 2), 16))
    }
    return new Uint8Array(arr)
}

export const ECDHprovider: React.FC<{ children: any }> = ({ children }) => {
    const [privKey, setPrivKey] = useState<string>('')
    const [pubKey, setPubKey] = useState<string>('')
    const [secret, setSecret] = useState<string>('')

    const setPersistantPrivKey = (key: string) => {
        if (key) {
            localStorage.setItem('privKey', key)
        } else { localStorage.removeItem('privKey') }
        setPrivKey(key)
    }

    const setPersistantPubKey = (key: string) => {
        if (key) {
            localStorage.setItem('pubKey', key)
        } else { localStorage.removeItem('pubKey') }
        setPubKey(key)
    }

    const generateKeys = async () => {
        const keys = await window.crypto.subtle.generateKey(
            { name: 'ECDH', namedCurve: 'P-256' },
            true,
            ['deriveKey', 'deriveBits']
        )

        const exPubKey = await window.crypto.subtle.exportKey('raw', keys.publicKey)
        const exPrivKey = await window.crypto.subtle.exportKey('pkcs8', keys.privateKey)      

        setPersistantPrivKey(buf2Hex(exPrivKey))
        setPersistantPubKey(buf2Hex(exPubKey))
    }

    const generateSecret = async (bobPubKey: string) => {
        const importedPrivKey = await window.crypto.subtle.importKey(
            'pkcs8',
            hex2Arr(privKey),
            { name: 'ECDH', namedCurve: 'P-256' },
            true,
            []
        )

        const importedPubKey = await window.crypto.subtle.importKey(
            'raw',
            hex2Arr(bobPubKey),
            { name: 'ECDH', namedCurve: 'P-256' },
            true,
            []
        )

        const sharedSecret = await window.crypto.subtle.deriveBits(
            { name: 'ECDH', public: importedPubKey },
            importedPrivKey,
            256
        )

        setSecret(buf2Hex(sharedSecret))
    }

    useEffect(() => {
        setPrivKey(localStorage.getItem('privKey') ?? '')
        setPubKey(localStorage.getItem('pubKey') ?? '')
    }, [])

    return (
        <ECDHcontext.Provider
            value={{
                secret,
                pubKey,
                privKey,
                generateSecret,
                generateKeys
            }}
        >
            {children}
        </ECDHcontext.Provider>
    )
}

export const useECDHcontext = (): {
    secret: string,
    pubKey: string,
    privKey: string,
    generateSecret: (k: string) => Promise<void>,
    generateKeys: () => Promise<void>
} => {
    const context = useContext<{ [k: string]: any }>(ECDHcontext)
    return {
        secret: context.secret,
        pubKey: context.pubKey,
        privKey: context.privKey,
        generateSecret: context.generateSecret,
        generateKeys: context.generateKeys
    }
}