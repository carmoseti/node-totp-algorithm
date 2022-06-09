import {authenticator} from 'otplib'
import {base32Encode} from "./util"
import {Algorithms, DigitsCount, Period} from "./config/types"
import QRCode from 'qrcode'

const generate = (secret: string, period: Period) => {
    const toDate: Date = new Date()
    const timeSeconds: number = toDate.getUTCSeconds()
    const timeElapsed: number = timeSeconds % Number(period)
    const timeRemaining: number = Number(period) - timeElapsed

    console.log(`${authenticator.generate(secret)} => ${toDate.toUTCString()}`)

    setTimeout(() => {
        generate(secret, period)
    }, timeRemaining * 1000)
}

const program = () => {
    // otpauth://{type}/{app}:{accountName}?secret={secret}{query}
    const type: string = 'totp'
    const app: string = encodeURI('Node Test')
    const accountName: string = 'carmosdevelopers@gmail.com'
    const secret: string = base32Encode('RANDOM_SECRET@1234567890', 'RFC4648', {padding: false})
    const algorithm: Algorithms = 'SHA1'
    const digitsCount: DigitsCount = '6'
    const period: Period = '30'
    const query: string = `secret=${secret}&issuer=${app}&algorithm=${algorithm}&digits=${digitsCount}&period=${period}`

    const keyUri: string = `otpauth://${type}/${app}:${accountName}?${query}`

    // Generate QR code of keyUri and display
    QRCode.toString(keyUri, {type: "terminal"}, (error: Error, url: string) => {
        if (error)
            throw error
        console.log(url)
    })

    generate(secret, period)
}

program()