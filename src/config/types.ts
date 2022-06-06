export type Algorithms = 'SHA1' | 'SHA256' | 'SHA512'
export type DigitsCount = '6' | '8'
export type Period = '30'

export type Base32Variant = 'RFC3548' | 'RFC4648' | 'RFC4648-HEX' | 'Crockford'
export type Base32EncodeOptions = {
    padding?: boolean
}