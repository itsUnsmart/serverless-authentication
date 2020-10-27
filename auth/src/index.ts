import User from '../../shared/models/user'
import Products from '../../shared/products'

import { getAuthorization, createAuthTokens } from '../../packages/authorization/src'

const user = User({
    id: '123',
    name: {
        tag: 'unsmart',
        display: 'Unsmart'
    },
    email: {
        value: 'me@unsmart.co'
    },
    role: 'ADMIN'
})

const authTokens = createAuthTokens({ user, product: Products.chat })

console.log('Access Token:', getAuthorization(authTokens.accessToken))
console.log('Refresh Token:', getAuthorization(authTokens.refreshToken))
