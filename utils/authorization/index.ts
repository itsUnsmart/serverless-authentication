import Config from '../config'
import Nano from '../nanoid'
import JWT from './jwt'
import KeyManager from '../keyManager'

import InternalUser from '../../models/user/internal'
import Authorization from '../../models/authorization'
import Product from '../../models/product'

import { AuthorizationError } from '../errors'

const createTokens = async ({ product, user }: { product: ReturnType<typeof Product>; user: ReturnType<typeof InternalUser> }) => {
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
        jti: Nano.generate() as string
    }

    const refreshToken = Buffer.from(JSON.stringify(refreshData)).toString('base64')
    // await TokensRepository.createRefreshToken(refreshData.jti, user, refreshData.exp)

    return {
        accessToken,
        refreshToken,
        expiresAt: new Date(exp * 1000)
    }
}

const get = (token?: string) => {
    try {
        if (token === undefined || token === '' || !token.includes('.') || token.split(' ').length !== 2) return Authorization({}, false)
        token = token.split(' ')[1]

        const { payload } = JWT.verify({ token, keys: KeyManager.privateKeys })
        return Authorization(payload)
    } catch (error) {
        return Authorization({})
    }
}

const getRequired = (token?: string) => {
    try {
        if (token === undefined || token === '' || !token.includes('.') || token.split(' ').length !== 2) throw new Error('')
        token = token.split(' ')[1]

        const { payload } = JWT.verify({ token, keys: KeyManager.privateKeys })
        return Authorization(payload)
    } catch (error) {
        throw new AuthorizationError(Authorization({}))
    }
}

export default { get, getRequired, createTokens }
