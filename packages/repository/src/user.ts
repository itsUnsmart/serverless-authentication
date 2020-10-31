import DB from './index'
import NanoID from '../../nanoid/src'

import User from '../../../shared/models/user'

import { cleanObject } from '../../../shared/utils'
import { ApplicationError, BadRequestError } from '../../../shared/errors'

const getUserById = async (id: string) => {
    if (!process.env.TABLE_NAME) {
        throw new ApplicationError()
    }

    try {
        const found = await DB.documentClient.get({
            TableName: process.env.TABLE_NAME,
            Key: {
                PK: `USER#SA#${id}`,
                SK: `USER#SA#${id}`
            }
        }).promise()

        return User(found.Item ?? {})
    } catch (error) {
        // TODO: Handle DB Errors
        throw error
    }
}

const getUserByPlatform = async (user: ReturnType<typeof User>) => {
    if (!process.env.TABLE_NAME) {
        throw new ApplicationError()
    } else if (!user.platform || typeof user.platform.name !== 'string' || !user.platform.id) {
        throw new BadRequestError('Invalid User Item')
    }

    try {
        const found = await DB.documentClient.get({
            TableName: process.env.TABLE_NAME,
            Key: {
                PK: `USER#${user.platform.name.toUpperCase()}#${user.platform.id}`,
                SK: `USER#${user.platform.name.toUpperCase()}#${user.platform.id}`
            }
        }).promise()

        if (found.Item?.id) {
            return await getUserById(found.Item.id)
        } else {
            return User({})
        }
    } catch (error) {
        // TODO: Handle DB Errors
        throw error
    }
}

const createUserByPlatform = async (user: ReturnType<typeof User>) => {
    if (!process.env.TABLE_NAME) {
        throw new ApplicationError()
    } else if (!user.platform || typeof user.platform.name !== 'string' || !user.platform.id) {
        throw new BadRequestError('Invalid User Item')
    }

    try {
        const id = `${NanoID.generate(15, true)}`;

        const updatedUser = User({
            ...cleanObject(user),
            id
        })

        await DB.documentClient.transactWrite({
            TransactItems: [
                {
                    Put: {
                        TableName: process.env.TABLE_NAME,
                        Item: {
                            ...cleanObject(updatedUser),
                            PK: `USER#SA#${id}`,
                            SK: `USER#SA#${id}`
                        },
                        ConditionExpression: 'attribute_not_exists(PK)'
                    }
                },
                {
                    Put: {
                        TableName: process.env.TABLE_NAME,
                        Item: {
                            id,
                            PK: `USER#${user.platform.name.toUpperCase()}#${user.platform.id}`,
                            SK: `USER#${user.platform.name.toUpperCase()}#${user.platform.id}`
                        },
                        ConditionExpression: 'attribute_not_exists(PK)'
                    }
                }
            ]
        }).promise()

        return updatedUser
    } catch (error) {
        // TODO: Handle DB Errors
        throw error
    }
}

const getOrCreateUser = async (user: ReturnType<typeof User>) => {
    if (!process.env.TABLE_NAME) {
        throw new ApplicationError()
    }

    try {
        const found = await getUserByPlatform(user)

        if (found.isValid) {
            console.log('User Item Retrieved.')
            return found
        } else {
            console.log('User Item Creating.')
            return await createUserByPlatform(user)
        }
    } catch (error) {
        // TODO: Handle DB Errors
        throw error
    }
}

export default {
    getOrCreateUser,
    getUserByPlatform,
    createUserByPlatform,
    getUserById
}
