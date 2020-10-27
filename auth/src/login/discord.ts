import { Handler, APIGatewayEvent, Context, Callback } from 'aws-lambda'
import { toResponse, safeParse } from '../../../shared/utils'

const handler: Handler = (event: APIGatewayEvent, context: Context, callback: Callback) => {
    context.callbackWaitsForEmptyEventLoop = false
    const body = safeParse(event.body)

    const response = toResponse({
        discord: true
    })

    console.log({
        body,
        ip: event.headers['X-Real-IP'],
        requestId: event.headers['X-Request-ID'],
        awsRequestId: context.awsRequestId,
    })

    callback(undefined, response)
}

export { handler }
