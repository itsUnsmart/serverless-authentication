import OAuth from '../../../packages/oauth2/src'
import User from '../../../shared/models/user'
import Products from '../../../shared/products'

import { responseJson, toHandler } from '../../../shared/utils'
import { createAuthTokens } from '../../../packages/authorization/src'

// https://discord.com/api/oauth2/authorize?client_id=771100200860123166&redirect_uri=http%3A%2F%2Flocalhost%3A3000&response_type=code&scope=identify%20email

const client = OAuth({
    client_id: '771100200860123166',
    client_secret: 'OSUX6D-jms7cW__3WVY97Yo8Czsr7FRc',
    redirect_uri: 'http://localhost:3000',
    scope: 'identify email'
}, {
    token: 'https://discord.com/api/oauth2/token',
    user: 'https://discord.com/api/v6/users/@me'
})

export const handler = toHandler(async (event, context) => {
    const headers = { 'X-AWS-ID': context.awsRequestId }

    const user_data = await client.getUser(event.parsedBody.code)

    const user = User({
        id: `discord_${user_data.id}`,
        email: {
            value: user_data.email,
            verified: user_data.verified
        },
        name: {
            tag: user_data.username,
            display: user_data.username
        }
    })

    // TODO: Create user in DB if not exists

    return responseJson(createAuthTokens({ user, product: Products.chat }), headers)
})
