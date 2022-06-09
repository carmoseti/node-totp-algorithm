import {Base32EncodeOptions, Base32Variant} from "../config/types"

const RFC4648: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
const RFC4648_HEX: string = '0123456789ABCDEFGHIJKLMNOPQRSTUV'
const CROCKFORD: string = '0123456789ABCDEFGHJKMNPQRSTVWXYZ'

export const base32Encode = (data: string, variant: Base32Variant, options ?: Base32EncodeOptions): string => {
    options = options || {}
    let alphabet: string
    let defaultPadding: boolean

    switch (variant) {
        case 'RFC3548':
        case 'RFC4648':
            alphabet = RFC4648
            defaultPadding = true
            break
        case 'RFC4648-HEX':
            alphabet = RFC4648_HEX
            defaultPadding = true
            break
        case 'Crockford':
            alphabet = CROCKFORD
            defaultPadding = false
            break
        default:
            throw new Error('Unknown base32 variant: ' + variant)
    }

    const padding: boolean = (options.padding !== undefined ? options.padding : defaultPadding)
    const buffer: Buffer = Buffer.from(data)

    let bits: number = 0
    let value: number = 0
    let output: string = ''

    for (let i = 0; i < buffer.byteLength; i++) {
        // tslint:disable-next-line:no-bitwise
        value = (value << 8) | buffer[i]
        bits += 8

        while (bits >= 5) {
            // tslint:disable-next-line:no-bitwise
            output += alphabet[(value >>> (bits - 5)) & 31]
            bits -= 5
        }
    }

    if (bits > 0) {
        // tslint:disable-next-line:no-bitwise
        output += alphabet[(value << (5 - bits)) & 31]
    }

    if (padding) {
        while ((output.length % 8) !== 0) {
            output += '='
        }
    }

    return output
}

const readCharacter = (alphabet: string, character: string): number => {
    const idx: number = alphabet.indexOf(character)

    if (idx === -1) {
        throw new Error('Invalid character found: ' + character)
    }

    return idx
}

export const base32Decode = (input: string, variant: Base32Variant): ArrayBuffer => {
    let alphabet: string

    switch (variant) {
        case 'RFC3548':
        case 'RFC4648':
            alphabet = RFC4648
            input = input.replace(/=+$/, '')
            break
        case 'RFC4648-HEX':
            alphabet = RFC4648_HEX
            input = input.replace(/=+$/, '')
            break
        case 'Crockford':
            alphabet = CROCKFORD
            input = input.toUpperCase().replace(/O/g, '0').replace(/[IL]/g, '1')
            break
        default:
            throw new Error('Unknown base32 variant: ' + variant)
    }

    const length: number = input.length

    let bits: number = 0
    let value: number = 0

    let index: number = 0
    // tslint:disable-next-line:no-bitwise
    const output: Uint8Array = new Uint8Array((length * 5 / 8) | 0)

    for (let i: number = 0; i < length; i++) {
        // tslint:disable-next-line:no-bitwise
        value = (value << 5) | readCharacter(alphabet, input[i])
        bits += 5

        if (bits >= 8) {
            // tslint:disable-next-line:no-bitwise
            output[index++] = (value >>> (bits - 8)) & 255
            bits -= 8
        }
    }

    return output.buffer
}

export const stringToHex = (value :string) :string => {
    return Buffer.from(value,'utf8').toString('hex')
}