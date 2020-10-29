import OAuth from '../packages/oauth2/src'
import User from './models/user'

const clients: { [key: string]: ReturnType<typeof OAuth> } = {
    discord: OAuth({
        client_id: '771100200860123166',
        client_secret: 'OSUX6D-jms7cW__3WVY97Yo8Czsr7FRc',
        redirect_uri: 'http://localhost:3000',
        scope: 'identify email'
    }, {
        token: 'https://discord.com/api/oauth2/token',
        user: 'https://discord.com/api/v6/users/@me',
        authorize: 'https://discord.com/api/oauth2/authorize'
    }, data => User({
        platform: {
            id: data.id,
            name: 'discord'
        },
        email: {
            value: data.email,
            verified: data.verified
        },
        name: {
            tag: data.username,
            display: data.username
        }
    })),
    facebook: OAuth({
        client_id: '496635341316870',
        client_secret: 'd5ba988a8726f015985b59b879cc63c3',
        redirect_uri: 'http://localhost:3000/',
        scope: 'email'
    }, {
        token: 'https://graph.facebook.com/v8.0/oauth/access_token',
        user: 'https://graph.facebook.com/v7.0/me?fields=id,name,email,short_name',
        authorize: 'https://www.facebook.com/v8.0/dialog/oauth'
    }, data => User({
        platform: {
            id: data.id,
            name: 'facebook'
        },
        email: {
            value: data.email
        },
        name: {
            tag: data.short_name,
            display: data.name
        }
    })),
    google: OAuth({
        client_id: '164424209671-js2k7pghm8mt8lol96160k0qaupvgn44.apps.googleusercontent.com',
        client_secret: 'og3JPzNveTCHFR9xupgnLK8S',
        redirect_uri: 'http://localhost:3000',
        scope: 'https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email'
    }, {
        token: 'https://oauth2.googleapis.com/token',
        user: 'https://www.googleapis.com/oauth2/v3/userinfo',
        authorize: 'https://accounts.google.com/o/oauth2/v2/auth'
    }, data => User({
        platform: {
            id: data.sub,
            name: 'google'
        },
        email: {
            value: data.email,
            verified: data.email_verified
        },
        name: {
            tag: data.given_name,
            display: data.name
        }
    })),
    twitch: OAuth({
        client_id: '33r8ldcmq7a8kfy5zhvkifmd4cu0gj',
        client_secret: '9pw9v8y9xwg5wkwrpv5mv8bfhbhoce',
        redirect_uri: 'http://localhost:3000',
        scope: 'user:read:email'
    }, {
        token: 'https://id.twitch.tv/oauth2/token',
        user: 'https://api.twitch.tv/helix/users',
        authorize: 'https://id.twitch.tv/oauth2/authorize'
    }, ({ data: [data] }) => User({
        platform: {
            id: data.id,
            name: 'twitch'
        },
        email: {
            value: data.email
        },
        name: {
            tag: data.login,
            display: data.display_name
        }
    }))
}

export default clients
