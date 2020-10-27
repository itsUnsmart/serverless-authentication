import Config from '../config'

import Product from './product'
import User from './user'

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

const Refresh = (jti?: string) => {
    return {
        token: typeof jti === 'string' && jti,
        isRefresh: typeof jti === 'string'
    }
}

export default (payload: IAuthPayload, provided = true) => {
    const issuer = Issuer(payload.iss)
    const product = Product(payload.aud)
    const user = User({ id: payload.sub, role: payload.role, name: { tag: payload.tag, display: payload.name }, email: { value: payload.email } })
    const expiration = Expiration(payload.exp ?? 0)
    const refresh = Refresh(payload.jti)

    return {
        issuer,
        product,
        user,
        expiration,
        refresh,
        provided,
        isValid: issuer.isValid && product.isValid && !expiration.isExpired
    }
}
