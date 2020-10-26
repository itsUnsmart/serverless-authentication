interface IJWTPayload {
    iss: string
    aud: string
    sub: string
    exp: number
    [key: string]: any
}

interface IParsedJWT {
    header: { [key: string]: any }
    payload: IJWTPayload
}

interface IVerifyInput {
    token: string | null
    keys: { [key: string]: string }
}
