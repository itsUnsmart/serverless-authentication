import Response from './response'

import { APIGatewayProxyEventV2, Context, APIGatewayProxyResult } from 'aws-lambda'
import { ApplicationError } from './errors'

type RequestHandler = (e: APIGatewayProxyEventV2, c: Context, opts?: { [key: string]: any }) => Promise<APIGatewayProxyResult>

export default (handler: RequestHandler, opts?: { [key: string]: any }) => {
    return async (event: APIGatewayProxyEventV2, context: Context) => {
        try {
            const result = await handler(event, context, opts)
            return result
        } catch (e) {
            const error = e instanceof ApplicationError ? e : new ApplicationError()

            if (e instanceof ApplicationError === false) {
                console.error('[Controller] Unhandled Error:', e)
            }

            return Response.error(error, context)
        }
    }
}
