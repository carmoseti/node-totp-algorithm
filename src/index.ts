import * as crypto from "crypto"
import {Algorithms, DigitsCount, Period} from "./config/types"
import {base32Encode} from "./util"
import QRCode from 'qrcode'

const hmac = (algorithm: string, key: string, text: string): Buffer => {
    return crypto.createHmac(algorithm, Buffer.from(key)).update(Buffer.from(text, 'hex')).digest()
}

const digitsPower: number[] = [
    1, 10, 100, 1000, 10000, 100000, 1000000, 10000000, 100000000
]

const generateOTP = (key: string, hexTime: string, returnDigits: number, algorithm: string): string => {
    let result: string = null

    while (hexTime.length < 16) {
        hexTime = "0" + hexTime
    }

    const hashBuffer: Buffer = hmac(algorithm, key, hexTime)
    // tslint:disable-next-line:no-bitwise
    const offset: number = hashBuffer[hashBuffer.length - 1] & 0xf
    // tslint:disable-next-line:no-bitwise
    const binary: number = ((hashBuffer[offset] & 0x7f) << 24) | ((hashBuffer[offset + 1] & 0xff) << 16) | ((hashBuffer[offset + 2] & 0xff) << 8) | (hashBuffer[offset + 3] & 0xff)

    const otp: number = binary % digitsPower[returnDigits]
    result = String(otp)

    while (result.length < returnDigits) {
        result = "0" + result
    }

    return result
}

const program = () => {
    // otpauth://{type}/{app}:{accountName}?secret={secret}{query}
    const type: string = 'totp'
    const app: string = encodeURI('Node Test')
    const accountName: string = 'carmosdevelopers@gmail.com'
    const secret: string = base32Encode('SECRET@123', 'RFC3548', {padding: false})
    // TODO:
    const algorithm: Algorithms = 'SHA1'
    const digitsCount: DigitsCount = '6'
    const period: Period = '30'
    const query: string = `secret=${secret}&issuer=${app}&algorithm=${algorithm}&digits=${digitsCount}&period=${period}`

    const keyUri: string = `otpauth://${type}/${app}:${accountName}?${query}`

    /*// Generate QR code of keyUri and display
    QRCode.toString(keyUri, {type: "terminal"}, (error: Error, url: string) => {
        if (error)
            throw error

        console.log(url)
    })*/

    const toDate: Date = new Date()
    toDate.setHours(toDate.getUTCHours())
    const T0: number = 0
    const X: number = 30
    let steps: string = "0"
    const time: number = Math.floor(toDate.getTime() / 1000)
    const T: number = Math.floor((time - T0) / X)
    steps = T.toString(16).toUpperCase()

    console.log(steps)
    // TODO:
    console.log(generateOTP(secret, steps, Number(digitsCount), 'sha1'))
}

program()