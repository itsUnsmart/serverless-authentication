import axios from 'axios'
import querystring from 'querystring'

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

export default (client: IOAuthOptions, urls: { token: string, user: string }) => {
    return {
        getUser: async (code: string) => {
            const { data: token_data } = await axios.post(urls.token, querystring.stringify({
                ...client,
                code: decodeURIComponent(code),
                grant_type: 'authorization_code',
            }), {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            })

            const token = `${correctedTokenType(token_data.token_type)} ${token_data.access_token}`

            console.log({token})

            const { data: user_data } = await axios.get(urls.user, {
                headers: {
                    Authorization: token,
                    'Client-Id': client.client_id
                }
            })

            return user_data
        }
    }
}
