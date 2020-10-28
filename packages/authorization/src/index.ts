import Config from '../../../shared/config'

import Nano from '../../nanoid/src'
import JWT from '../../jwt/src'
import KeyManager from '../../key-manager/src'

import Authorization from '../../../shared/models/authorization'
import User from '../../../shared/models/user'
import Product from '../../../shared/models/product'

export const getAuthorization = (token?: string) => {
    try {
        if (token === undefined || token === '') return Authorization({}, false, false)

        if (token.includes('.')) {
            const { payload } = JWT.verify({ token, keys: KeyManager.privateKeys })

            return Authorization(payload)
        } else {
            return Authorization(JSON.parse(Buffer.from(token, 'base64').toString('utf8')), true)
        }
    } catch (error) {
        return Authorization({})
    }

}

export const createAuthTokens = ({ product, user }: { product: ReturnType<typeof Product>; user: ReturnType<typeof User> }) => {
    if (!product || !product.isValid) throw new Error('Authorization product is not valid.')
    else if (!user || !user.isValid) throw new Error('Authorization user is not valid.')

    const defaults = {
        clientid: product.url as string,
        currentKey: KeyManager.currentKey,
        userid: user.id as string
    }

    const { jwt: accessToken, payload: { exp } } = JWT.create({ ...defaults, data: { tag: user.name.tag, name: user.name.display, email: user.email.value, role: user.role } })

    const refreshData = {
        iss: Config.issuer,
        sub: user.id,
        aud: product.url,
        exp: Math.floor((Date.now() + Config.refreshExpires) / 1000),
        jti: Nano.generate()
    }

    const refreshToken = Buffer.from(JSON.stringify(refreshData)).toString('base64')

    return {
        accessToken,
        refreshToken,
        jti: refreshData.jti,
        expiresAt: new Date(exp * 1000)
    }
}
