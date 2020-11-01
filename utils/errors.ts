import Authorization from '../models/authorization'
import uuidv4 from './uuidv4'

export class ApplicationError extends Error {
    public errorText: string
    public statusCode: number

    constructor(message = 'An unknown error has occurred. Try again later.', statusCode = 500) {
        super(message)
        this.name = this.constructor.name
        this.statusCode = statusCode
        this.errorText = this.getErrorText()
    }

    private getErrorText() {
        switch(this.statusCode) {
            case 400:
                return 'Bad Request'
            case 401:
                return 'Unauthorized'
            case 403:
                return 'Forbidden'
            default:
                return 'Internal Server Error'
        }
    }
}

export class AuthorizationError extends ApplicationError {
    constructor(auth?: ReturnType<typeof Authorization>) {
        if (auth && auth.provided && auth.isValid) {
            super(`This action is not allowed with your current authorization.`, 403)
        } else {
            super(`This action requires authorization.`, 401)
        }
    }
}

export class BadRequestError extends ApplicationError {
    constructor(message: string) {
        super(message, 400)
    }
}

const isDynamoError = (error: any) => uuidv4.validate((error as any).requestId) && typeof (error as any).code === 'string'

export const getDynamoError = (e: any) => {
    const error = e instanceof Error ? e : new ApplicationError()

    if (isDynamoError(error)) throw new ApplicationError(`An internal error has occurred. ${e.code}.`)
    else throw error
}
