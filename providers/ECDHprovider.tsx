import React, { createContext, useContext, useState } from 'react'

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

const str2Buff = (str: string) => {
    var buf = new ArrayBuffer(str.length * 2);
    var bufView = new Uint8Array(buf);
    for (var i = 0, strLen = str.length; i < strLen; i++) {
        bufView[i] = str.charCodeAt(i);
    }
    return buf;
}

function buff2Str(buff: number[]) {
    // @ts-ignore
    return String.fromCharCode.apply(null, new Uint8Array(buff));
}

export const ECDHprovider: React.FC<{ children: any }> = ({ children }) => {
    const [privKey, setPrivKey] = useState<string>('')
    const [secret, setSecret] = useState<string>('')


    const generateKeys = async () => {
        const keys = await window.crypto.subtle.generateKey(
            { name: 'ECDH', namedCurve: 'P-256' },
            true,
            ['deriveKey', 'deriveBits']
        )

        const exPubKey = await window.crypto.subtle.exportKey('raw', keys.publicKey)
        const exPrivKey = await window.crypto.subtle.exportKey('pkcs8', keys.privateKey)

        setPrivKey(buf2Hex(exPrivKey))

        return {
            priv: buf2Hex(exPrivKey),
            pub: buf2Hex(exPubKey)
        }
    }

    const generateSecret = async (bobPubKey: string) => {
        const importedPrivKey = await window.crypto.subtle.importKey(
            'pkcs8',
            hex2Arr(privKey),
            { name: 'ECDH', namedCurve: 'P-256' },
            true,
            ["deriveBits"]
        )

        const importedPubKey = await window.crypto.subtle.importKey(
            'raw',
            hex2Arr(bobPubKey),
            { name: 'ECDH', namedCurve: 'P-256' },
            true,
            ["deriveBits"]
        )

        const sharedSecret = await window.crypto.subtle.deriveBits(
            { name: 'ECDH', public: importedPubKey },
            importedPrivKey,
            256
        )

        setSecret(buf2Hex(sharedSecret))
    }

    const encrypt = async (msg: string): Promise<string> => {
        const sha = await crypto.subtle.digest({ name: 'SHA-256' }, new TextEncoder().encode(secret))
        const aesKey = await window.crypto.subtle.importKey(
            "raw",
            sha,
            "AES-CBC",
            true,
            ["encrypt", "decrypt"]
        );

        const encrypted = await window.crypto.subtle.encrypt(
            {
                name: "AES-CBC",
                iv: new Uint8Array(16),
            },
            aesKey,
            str2Buff(msg)
        )
        return buf2Hex(encrypted)
    }

    const decrypt = async (msg: string) => {
        const sha = await crypto.subtle.digest({ name: 'SHA-256' }, new TextEncoder().encode(secret))
        const aesKey = await window.crypto.subtle.importKey(
            "raw",
            sha,
            "AES-CBC",
            true,
            ["encrypt", "decrypt"]
        );
        const decrypted = await window.crypto.subtle.decrypt(
            {
                name: "AES-CBC",
                iv: new Uint8Array(16)
            },
            aesKey,
            str2Buff(msg)
        )
        return buff2Str(decrypted)
    }

    return (
        <ECDHcontext.Provider
            value={{
                secret,
                privKey,
                setPrivKey,
                generateSecret,
                generateKeys,
                encrypt,
                decrypt
            }}
        >
            {children}
        </ECDHcontext.Provider>
    )
}

export const useECDHcontext = (): {
    secret: string,
    privKey: string,
    generateSecret: (k: string) => Promise<void>,
    generateKeys: () => Promise<{ pub: string, priv: string }>,
    setPrivKey: (k?: string) => Promise<void>,
    encrypt: (msg: string) => Promise<string>
    decrypt: (msg: string) => Promise<string>
} => {
    const context = useContext<{ [k: string]: any }>(ECDHcontext)
    return {
        secret: context.secret,
        privKey: context.privKey,
        generateSecret: context.generateSecret,
        generateKeys: context.generateKeys,
        setPrivKey: context.setPrivKey,
        encrypt: context.encrypt,
        decrypt: context.decrypt
    }
}