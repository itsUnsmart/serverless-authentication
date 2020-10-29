import { APIGatewayProxyHandlerV2 } from './types'
import { ApplicationError } from '../errors'

export const cleanObject = <T>(object: T): Partial<T> => {
    if (typeof object !== 'object') return object

    Object.keys(object as { [key: string]: any }).forEach((key: string) => {
        const value = (object as { [key: string]: any })[key]
        if (typeof value === 'object' && value.constructor === Object) {
            const cleaned = cleanObject(value)

            if (Object.keys(cleaned).length === 0) {
                delete (object as { [key: string]: any })[key]
            } else {
                (object as { [key: string]: any })[key] = cleaned
            }
        } else if ([null, undefined, ''].includes(value)) {
            delete (object as { [key: string]: any })[key]
        }
    })

    return object
}

export const safeParse = (body?: string | null) => {
    try {
        const parsed = JSON.parse(body ?? '{}')
        return parsed
    } catch (error) {
        return {}
    }
}

export const toHandler = (handler: APIGatewayProxyHandlerV2): APIGatewayProxyHandlerV2 => {
    return async (event, context) => {
        const headers = { 'X-AWS-ID': context.awsRequestId }

        event.parsedBody = safeParse(event.body)

        try {
            const result = await handler(event, context)

            return result
        } catch (e) {
            const error = e instanceof ApplicationError ? e : new ApplicationError()

            return responseJson({
                error: error.errorText,
                message: error.message,
                requestId: context.awsRequestId
            }, headers, error.statusCode)
        }
    }
}

export const responseJson = (body: { [key: string]: any }, headers?: { [key: string]: any }, statusCode = 200) => ({
    headers,
    statusCode,
    body: JSON.stringify(body)
})

export const redirectTo = (Location: string, statusCode = 302) => ({
    headers: {
        Location
    },
    statusCode
})
