interface IUserPayload {
    id: string
    platform: string
    email?: {
        value?: string
        verified?: boolean
    }
    name?: {
        tag?: string
        display?: string
    }
}

const platforms = ['discord', 'facebook', 'google', 'twitch']
const isPlatformId = (value?: string) => {
    return typeof value === 'string' && platforms.some(platform => value.startsWith(`${platform}_`))
}

export default (user: IUserPayload) => {
    return {
        id: user?.id,
        platform: user?.platform,
        email: {
            value: user?.email?.value,
            verified: user?.email?.verified
        },
        name: {
            tag: user?.name?.tag,
            display: user?.name?.display
        },
        isValid: isPlatformId(`${user?.platform}_${user?.id}`) && user?.id
    }
}
