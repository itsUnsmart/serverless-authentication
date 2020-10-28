import OAuth from '../../../packages/oauth2/src'
import User from '../../../shared/models/user'
import Products from '../../../shared/products'

import { APIGatewayProxyHandlerV2 } from 'aws-lambda'
import { responseJson, safeParse } from '../../../shared/utils'
import { createAuthTokens } from '../../../packages/authorization/src'

// https://www.facebook.com/v8.0/dialog/oauth?client_id=496635341316870&redirect_uri=http://localhost:3000/&scope=email&response_type=code&state=

const client = OAuth({
    client_id: '496635341316870',
    client_secret: 'd5ba988a8726f015985b59b879cc63c3',
    redirect_uri: 'http://localhost:3000/',
    scope: 'email'
}, {
    token: 'https://graph.facebook.com/v8.0/oauth/access_token',
    user: 'https://graph.facebook.com/v7.0/me?fields=id,name,email,short_name'
})

export const handler: APIGatewayProxyHandlerV2 = async (event, context) => {
    const headers = { 'X-AWS-ID': context.awsRequestId }
    context.callbackWaitsForEmptyEventLoop = false
    const body = safeParse(event.body)

    if (!body.code || typeof body.code !== 'string') {
        return responseJson({ error: 'No code' }, headers)
    }

    const user_data = await client.getUser(body.code)

    const user = User({
        id: `facebook_${user_data.id}`,
        email: {
            value: user_data.email
        },
        name: {
            tag: user_data.short_name,
            display: user_data.name
        }
    })

    // TODO: Create user in DB if not exists

    return responseJson(createAuthTokens({ user, product: Products.chat }), headers)
}
