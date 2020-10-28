import OAuth from '../../../packages/oauth2/src'
import User from '../../../shared/models/user'

import { APIGatewayProxyHandlerV2 } from 'aws-lambda'
import { responseJson, safeParse } from '../../../shared/utils'

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

export const handler: APIGatewayProxyHandlerV2 = async (event, context) => {
    const headers = { 'X-AWS-ID': context.awsRequestId }
    context.callbackWaitsForEmptyEventLoop = false
    const body = safeParse(event.body)

    if (!body.code || typeof body.code !== 'string') {
        return responseJson({ error: 'No code' }, headers)
    }

    const user_data = await client.getUser(body.code)

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

    // TODO: Create auth JWT and respond with that info
    return responseJson({ user }, headers)
}
