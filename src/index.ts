import * as crypto from "crypto";

const hmac = (algorithm: string, key: string, text: string): Buffer => {
    return crypto.createHmac(algorithm, Buffer.from(key, 'hex')).update(Buffer.from(text, 'hex')).digest()
}

const digitsPower: number[] = [
    1, 10, 100, 1000, 10000, 100000, 1000000, 10000000, 100000000
]

const generateTOTP = (hexKey: string, time: string, returnDigits: number): string => {
    return generateOTP(hexKey, time, returnDigits, 'sha1')
}

const generateTOTP256 = (hexKey: string, time: string, returnDigits: number): string => {
    return generateOTP(hexKey, time, returnDigits, 'sha256')
}

const generateTOTP512 = (hexKey: string, time: string, returnDigits: number): string => {
    return generateOTP(hexKey, time, returnDigits, 'sha512')
}

const generateOTP = (hexKey: string, hexTime: string, returnDigits: number, algorithm: string): string => {
    let result: string = null

    while (hexTime.length < 16) {
        hexTime = "0" + hexTime
    }

    const hashBuffer: Buffer = hmac(algorithm, hexKey, hexTime)
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
    const seedSHA1: string = "3132333435363738393031323334353637383930"
    const seedSHA256: string = "3132333435363738393031323334353637383930" + "313233343536373839303132"
    const seedSHA512: string = "3132333435363738393031323334353637383930" + "3132333435363738393031323334353637383930" + "3132333435363738393031323334353637383930" + "31323334"

    const T0: number = 0
    const X: number = 30 // Timestep (seconds)
    const testTimes: number[] = [59, 1111111109, 1111111111, 1234567890, 2000000000, 20000000000]

    let steps: string = "0"

    console.log(`Time (sec)\t\tUTC Time\t\tValue of T (hex)\t\t\tTOTP\t\tMode`)
    // tslint:disable-next-line:prefer-for-of
    for (let i = 0; i < testTimes.length; i++) {
        const time: number = testTimes[i]
        const T: number = Math.floor((time - T0) / X)
        steps = T.toString(16).toUpperCase()

        while (steps.length < 16)
            steps = "0" + steps

        const utcTime: string = new Date(testTimes[i] * 1000).toUTCString()
            .replace("GMT", "").trim()

        console.log(
            `${time}\t\t${utcTime}\t\t${steps}\t\t\t${
                generateTOTP(seedSHA1, steps, 8)
            }\t\tSHA1`
        )

        console.log(
            `${time}\t\t${utcTime}\t\t${steps}\t\t\t${
                generateTOTP256(seedSHA256, steps, 8)
            }\t\tSHA256`
        )

        console.log(
            `${time}\t\t${utcTime}\t\t${steps}\t\t\t${
                generateTOTP512(seedSHA512, steps, 8)
            }\t\tSHA512\n`
        )
    }
}

program()