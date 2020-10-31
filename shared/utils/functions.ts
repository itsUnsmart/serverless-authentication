import { safeParse } from '.'
import { ApplicationError } from '../errors'
import { APIGatewayProxyHandlerV2 } from './types'

const responseJson = (body: { [key: string]: any }, headers: { [key: string]: any } = {}, statusCode = 200) => ({
    headers,
    statusCode,
    body: JSON.stringify(body)
})

const redirectTo = (Location: string, statusCode = 302) => ({
    headers: {
        Location
    },
    statusCode
})

const toHandler = (handler: APIGatewayProxyHandlerV2): APIGatewayProxyHandlerV2 => {
    return async (event, context) => {
        const headers = { 'X-AWS-ID': context.awsRequestId }

        event.parsedBody = safeParse(event.body)

        try {
            const result = await handler(event, context)

            return result
        } catch (e) {
            const error = e instanceof ApplicationError ? e : new ApplicationError()

            if (e instanceof ApplicationError === false) {
                console.error('Unhandled Error:', e)
            }

            return responseJson({
                error: error.errorText,
                message: error.message,
                requestId: context.awsRequestId
            }, headers, error.statusCode)
        }
    }
}

export default {
    toHandler,
    respond: {
        json: responseJson,
        redirect: redirectTo
    }
}
