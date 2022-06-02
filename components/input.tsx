import React, { useState } from 'react'
import styles from '../styles/Input.module.css'

const Input: React.FC<{
    placeHolder: string,
    type?: 'number' | 'password',
    value: any,
    setValue: (v: any) => void,
    err?: boolean
}> = ({ placeHolder, type, value, setValue, err }) => {
    const [isFocus, setIsFocus] = useState<boolean>(false);

    return (
        <div
            className={styles.inputWrapper}
        >
            <p className={`${styles.placeHolder} ${isFocus || value ? `${styles.placeHolderFocus}` : ''}`} >{placeHolder}</p>
            <input
                className={`${styles.input} ${err ? `${styles.errInput}`: ''}`}
                onFocus={() => setIsFocus(true)}
                onBlur={() => setIsFocus(false)}
                type={type}
                value={value ?? ''}
                onChange={({ target }) => setValue(target.value)}
            />
            <p className={`${styles.errMsg} ${err ? `${styles.errShow}` : ''}`}>Invalid value for this field!</p>
        </div>
    )
}

export default Input