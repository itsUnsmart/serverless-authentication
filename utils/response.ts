import { Context } from 'aws-lambda'
import { ApplicationError } from './errors'

const success = (body: { [key: string]: any }, context: Context) => {
    return {
        headers: { 'X-AWS-ID': context.awsRequestId },
        body: JSON.stringify(body),
        statusCode: 200
    }
}

const error = (e: ApplicationError, context: Context) => {
    const body = {
        error: e.errorText,
        message: e.message,
        requestId: context.awsRequestId
    }

    return {
        headers: { 'X-AWS-ID': context.awsRequestId },
        body: JSON.stringify(body),
        statusCode: e.statusCode
    }
}

export default { success, error }
