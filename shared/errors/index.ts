import Authorization from '../models/authorization'

export class ApplicationError extends Error {
    public errorText: string
    public statusCode: number

    constructor(message = 'An unknown error has occurred. Try again later.', statusCode = 500) {
        super(message)
        this.name = this.constructor.name
        this.statusCode = statusCode

        switch(statusCode) {
            case 400:
                this.errorText = 'Bad Request'
                break
            case 401:
                this.errorText = 'Unauthorized'
                break
            case 403:
                this.errorText = 'Forbidden'
                break
            default:
                this.errorText = 'Internal Server Error'
                break
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
