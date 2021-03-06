interface IUserPayload {
    id?: string
    email?: {
        value?: string
        verified?: boolean
    }
    name?: {
        tag?: string
        display?: string
    }
    role?: string
}

const isNumber = (value?: string) => {
    return typeof value === 'string' && value !== '' && /^\d+$/.test(value)
}

const ROLES = ['USER', 'MOD', 'ADMIN']

export default (user: IUserPayload) => {
    return {
        id: user?.id,
        email: {
            value: user?.email?.value,
            verified: user?.email?.verified
        },
        name: {
            tag: user?.name?.tag,
            display: user?.name?.display
        },
        role: user && user.role && ROLES.includes(user.role.toUpperCase()) ? user.role.toUpperCase() : 'USER',
        isValid: isNumber(user?.id)
    }
}
