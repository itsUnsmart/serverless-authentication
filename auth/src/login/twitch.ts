import OAuth from '../../../packages/oauth2/src'
import User from '../../../shared/models/user'
import Products from '../../../shared/products'

import { APIGatewayProxyHandlerV2 } from 'aws-lambda'
import { responseJson, safeParse } from '../../../shared/utils'
import { createAuthTokens } from '../../../packages/authorization/src'

// https://id.twitch.tv/oauth2/authorize?response_type=code&client_id=33r8ldcmq7a8kfy5zhvkifmd4cu0gj&redirect_uri=http://localhost:3000&scope=user:read:email

const client = OAuth({
    client_id: '33r8ldcmq7a8kfy5zhvkifmd4cu0gj',
    client_secret: '9pw9v8y9xwg5wkwrpv5mv8bfhbhoce',
    redirect_uri: 'http://localhost:3000',
    scope: 'user:read:email'
}, {
    token: 'https://id.twitch.tv/oauth2/token',
    user: 'https://api.twitch.tv/helix/users'
})

export const handler: APIGatewayProxyHandlerV2 = async (event, context) => {
    const headers = { 'X-AWS-ID': context.awsRequestId }
    context.callbackWaitsForEmptyEventLoop = false
    const body = safeParse(event.body)

    if (!body.code || typeof body.code !== 'string') {
        return responseJson({ error: 'No code' }, headers)
    }

    const user_res = await client.getUser(body.code)
    const user_data = user_res.data[0]

    const user = User({
        id: `twitch_${user_data.id}`,
        email: {
            value: user_data.email
        },
        name: {
            tag: user_data.login,
            display: user_data.display_name
        }
    })

    // TODO: Create user in DB if not exists

    return responseJson(createAuthTokens({ user, product: Products.chat }), headers)
}
