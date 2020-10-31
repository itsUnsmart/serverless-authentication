import DB from './index'
import UserRepository from './user'

import User from '../../../shared/models/user'

import { ApplicationError, BadRequestError } from '../../../shared/errors'

const getUserByRefreshToken = async (token: string, userid: string) => {
    if (!process.env.TABLE_NAME) {
        throw new ApplicationError()
    } else if (!token) {
        throw new BadRequestError('No Refresh Token')
    } else if (!userid) {
        throw new BadRequestError('User Item Invalid')
    }

    try {
        const found = await DB.documentClient.get({
            TableName: process.env.TABLE_NAME,
            Key: {
                PK: `REFRESH#USER#${userid}`,
                SK: `TOKEN#${token}`
            }
        }).promise()

        if (found.Item?.id) {
            return await UserRepository.getUserById(found.Item.id)
        } else {
            return User({})
        }
    } catch (error) {
        // TODO: Handle DB Errors
        throw error
    }
}

const createRefreshToken = async (token: string, user: ReturnType<typeof User>, ttl: number) => {
    if (!process.env.TABLE_NAME) {
        throw new ApplicationError()
    } else if (!user.isValid) {
        throw new BadRequestError('User Item Invalid')
    }

    try {
        return await DB.documentClient.put({
            TableName: process.env.TABLE_NAME,
            Item: {
                PK: `REFRESH#USER#${user.id}`,
                SK: `TOKEN#${token}`,
                id: user.id,
                ttl
            },
            ConditionExpression: 'attribute_not_exists(SK)'
        }).promise()
    } catch (error) {
        // TODO: Handle DB Errors
        throw error
    }
}

export default {
    createRefreshToken,
    getUserByRefreshToken
}
