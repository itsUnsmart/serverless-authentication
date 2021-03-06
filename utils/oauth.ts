import ExternalUser from '../models/user/external'

import axios, { AxiosError } from 'axios'
import { stringify } from 'querystring'
import { ApplicationError, BadRequestError } from './errors'

interface IOAuthOptions {
    client_id: string
    client_secret: string
    redirect_uri: string
    scope: string
}

const correctedTokenType = (type: string) => {
    switch (type.toLowerCase()) {
        case 'bearer':
            return 'Bearer'
        default:
            return type;
    }
}

export default (client: IOAuthOptions, urls: { token: string, user: string, authorize: string }, toUser: (data: any) => ReturnType<typeof ExternalUser>) => {
    const authorizeUrl = encodeURI(`${urls.authorize}?response_type=code&access_type=offline&client_id=${client.client_id}&redirect_uri=${client.redirect_uri}&scope=${client.scope}`)
    return {
        authorizeUrl,
        getUser: async (code: string) => {
            try {
                if (!code || typeof code !== 'string') {
                    throw new BadRequestError('No Authorization Code.')
                }

                const { data: token_data } = await axios.post(urls.token, stringify({
                    ...client,
                    code: decodeURIComponent(code),
                    grant_type: 'authorization_code',
                }), {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                })

                const token = `${correctedTokenType(token_data.token_type)} ${token_data.access_token}`

                const { data: user_data } = await axios.get(urls.user, {
                    headers: {
                        Authorization: token,
                        'Client-Id': client.client_id
                    }
                })

                return toUser(user_data)
            } catch (e) {
                if ((e as AxiosError).isAxiosError) {
                    const error = e as AxiosError

                    console.error('[OAuth] Request Error:', { response: error.response?.data, message: error.message })

                    if ([400, 401, 403].includes(error.response?.status as number)) {
                        throw new BadRequestError('Authorization code is invalid.')
                    } else {
                        throw new ApplicationError('OAuth server error. Please try again later.')
                    }
                }

                if (e instanceof ApplicationError === false) {
                    console.error('[OAuth] Unhandled error:', e)
                }

                throw e
            }
        }
    }
}
