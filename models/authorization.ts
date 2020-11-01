import Config from '../utils/config'

import Product from './product'
import User from './user/internal'

interface IAuthPayload {
    iss?: string
    sub?: string
    aud?: string
    exp?: number
    [key: string]: any
}

const Issuer = (url?: string) => {
    return {
        url,
        isValid: url === Config.issuer
    }
}

const Expiration = (time: number) => {
    return {
        expires: new Date(time * 1000),
        isExpired: (Date.now() / 1000) > time
    }
}


export default (payload: IAuthPayload, provided = true) => {
    const issuer = Issuer(payload.iss)
    const product = Product(payload.aud)
    const user = User({ id: payload.sub, role: payload.role, name: { tag: payload.tag, display: payload.name }, email: { value: payload.email } })
    const expiration = Expiration(payload.exp ?? 0)

    return {
        issuer,
        product,
        user,
        expiration,
        provided,
        isValid: issuer.isValid && product.isValid && !expiration.isExpired
    }
}
