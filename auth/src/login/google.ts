import OAuth from '../../../packages/oauth2/src'
import User from '../../../shared/models/user'

import { APIGatewayProxyHandlerV2 } from 'aws-lambda'
import { responseJson, safeParse } from '../../../shared/utils'

// https://accounts.google.com/o/oauth2/v2/auth?response_type=code&access_type=offline&client_id=164424209671-js2k7pghm8mt8lol96160k0qaupvgn44.apps.googleusercontent.com&redirect_uri=http://localhost:3000&scope=https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email

const client = OAuth({
    client_id: '164424209671-js2k7pghm8mt8lol96160k0qaupvgn44.apps.googleusercontent.com',
    client_secret: 'og3JPzNveTCHFR9xupgnLK8S',
    redirect_uri: 'http://localhost:3000',
    scope: 'https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email'
}, {
    token: 'https://oauth2.googleapis.com/token',
    user: 'https://www.googleapis.com/oauth2/v3/userinfo'
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
        id: `google_${user_data.sub}`,
        email: {
            value: user_data.email,
            verified: user_data.email_verified
        },
        name: {
            tag: user_data.given_name,
            display: user_data.name
        }
    })

    // TODO: Create user in DB if not exists

    // TODO: Create auth JWT and respond with that info
    return responseJson({ user }, headers)
}
