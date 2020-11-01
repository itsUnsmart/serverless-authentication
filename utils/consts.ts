import Config from './config'
import OAuthClient from './oauth'

import ExternalUser from '../models/user/external'
import Product from '../models/product'

import { BadRequestError } from './errors'


const discordClient = {
    client_id: process.env.DISCORD_CLIENT_ID as string,
    client_secret: process.env.DISCORD_CLIENT_SECRET as string,
    redirect_uri: 'http://localhost:3000',
    scope: 'identify email'
}
const discordApi = {
    token: 'https://discord.com/api/oauth2/token',
    user: 'https://discord.com/api/v6/users/@me',
    authorize: 'https://discord.com/api/oauth2/authorize'
}
const discordToUser = (data: any) => ExternalUser({
    id: data.id,
    platform: 'discord',
    email: {
        value: data.email,
        verified: data.verified
    },
    name: {
        tag: data.username,
        display: data.username
    }
})

const facebookClient = {
    client_id: process.env.FACEBOOK_CLIENT_ID as string,
    client_secret: process.env.FACEBOOK_CLIENT_SECRET as string,
    redirect_uri: 'http://localhost:3000/',
    scope: 'email'
}
const facebookApi = {
    token: 'https://graph.facebook.com/v8.0/oauth/access_token',
    user: 'https://graph.facebook.com/v7.0/me?fields=id,name,email,short_name',
    authorize: 'https://www.facebook.com/v8.0/dialog/oauth'
}
const facebookToUser = (data: any) => ExternalUser({
    id: data.id,
    platform: 'facebook',
    email: {
        value: data.email
    },
    name: {
        tag: data.short_name,
        display: data.name
    }
})

const googleClient = {
    client_id: process.env.GOOGLE_CLIENT_ID as string,
    client_secret: process.env.GOOGLE_CLIENT_SECRET as string,
    redirect_uri: 'http://localhost:3000',
    scope: 'https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email'
}
const googleApi = {
    token: 'https://oauth2.googleapis.com/token',
    user: 'https://www.googleapis.com/oauth2/v3/userinfo',
    authorize: 'https://accounts.google.com/o/oauth2/v2/auth'
}
const googleToUser = (data: any) => ExternalUser({
    id: data.sub,
    platform: 'google',
    email: {
        value: data.email,
        verified: data.email_verified
    },
    name: {
        tag: data.given_name,
        display: data.name
    }
})

const twitchClient = {
    client_id: process.env.TWITCH_CLIENT_ID as string,
    client_secret: process.env.TWITCH_CLIENT_SECRET as string,
    redirect_uri: 'http://localhost:3000',
    scope: 'user:read:email'
}
const twitchApi = {
    token: 'https://id.twitch.tv/oauth2/token',
    user: 'https://api.twitch.tv/helix/users',
    authorize: 'https://id.twitch.tv/oauth2/authorize'
}
const twitchToUser = ({ data: [data] }: any) => ExternalUser({
    id: data.id,
    platform: 'twitch',
    email: {
        value: data.email
    },
    name: {
        tag: data.login,
        display: data.display_name
    }
})

export const getOAuthClients = () => {
    return {
        discord: OAuthClient(discordClient, discordApi, discordToUser),
        facebook: OAuthClient(facebookClient, facebookApi, facebookToUser),
        google: OAuthClient(googleClient, googleApi, googleToUser),
        twitch: OAuthClient(twitchClient, twitchApi, twitchToUser)
    }
}

export const getOAuthClient = (name: string): ReturnType<typeof OAuthClient> => {
    const clients = getOAuthClients() as { [key: string]: any }

    if (!clients[name]) throw new BadRequestError(`No Authorization Provider ${name || 'NULL'}`)

    return clients[name]
}

export const getProduct = (clientid: string) => {
    if (!Config.products.list.includes(clientid)) throw new BadRequestError(`No Product ${name || 'NULL'}`)

    return Product(`${clientid}.${Config.products.extension}`)
}
