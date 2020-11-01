import DB from './index'
import NanoID from '../utils/nanoid'

import ExternalUser from '../models/user/external'
import InternalUser from '../models/user/internal'

import { ApplicationError, BadRequestError, getDynamoError } from '../utils/errors'
import { cleanObject } from '../utils'

const getUserById = async (id: string) => {
    if (!process.env.DYNAMO_TABLE_NAME) {
        throw new ApplicationError()
    }

    try {
        const found = await DB.documentClient.get({
            TableName: process.env.DYNAMO_TABLE_NAME,
            Key: {
                PK: `USER#SA#${id}`,
                SK: 'userAccount'
            }
        }).promise()

        return InternalUser(found.Item ?? {})
    } catch (error) {
        return getDynamoError(error)
    }
}

const getUserByPlatform = async (user: ReturnType<typeof ExternalUser>) => {
    if (!process.env.DYNAMO_TABLE_NAME) {
        throw new ApplicationError()
    } else if (!user.isValid) {
        throw new BadRequestError('Invalid User Item')
    }

    try {
        const found = await DB.documentClient.get({
            TableName: process.env.DYNAMO_TABLE_NAME,
            Key: {
                PK: `USER#${user.platform.toUpperCase()}#${user.id}`,
                SK: 'linkedAccount'
            }
        }).promise()

        return found.Item?.id ? await getUserById(found.Item.id) : InternalUser({})
    } catch (error) {
        return getDynamoError(error)
    }
}

const createUserByPlatform = async (user: ReturnType<typeof ExternalUser>) => {
    if (!process.env.DYNAMO_TABLE_NAME) {
        throw new ApplicationError()
    } else if (!user.isValid) {
        throw new BadRequestError('Invalid User Item')
    }

    try {
        const id = `${NanoID.generate(15, true)}`;

        const updatedUser = InternalUser({
            ...cleanObject(user),
            id
        })

        await DB.documentClient.transactWrite({
            TransactItems: [
                {
                    Put: {
                        TableName: process.env.DYNAMO_TABLE_NAME,
                        Item: {
                            ...cleanObject(updatedUser),
                            PK: `USER#SA#${id}`,
                            SK: 'userAccount'
                        },
                        ConditionExpression: 'attribute_not_exists(PK)'
                    }
                },
                {
                    Put: {
                        TableName: process.env.DYNAMO_TABLE_NAME,
                        Item: {
                            id,
                            PK: `USER#${user.platform.toUpperCase()}#${user.id}`,
                            SK: 'linkedAccount',
                            GSI1PK: `USER#SA#${id}`,
                            GSI1SK: `USER#LINKED#${user.platform.toUpperCase()}#${user.id}`
                        },
                        ConditionExpression: 'attribute_not_exists(PK)'
                    }
                }
            ]
        }).promise()

        return updatedUser
    } catch (error) {
        return getDynamoError(error)
    }
}

const getOrCreateUser = async (user: ReturnType<typeof ExternalUser>) => {
    if (!process.env.DYNAMO_TABLE_NAME) {
        throw new ApplicationError()
    }

    try {
        const found = await getUserByPlatform(user)

        return found.isValid ? found : await createUserByPlatform(user)
    } catch (error) {
        return getDynamoError(error)
    }
}

const linkExternalUser = async (internalUser: ReturnType<typeof InternalUser>, externalUser: ReturnType<typeof ExternalUser>) => {
    if (!process.env.DYNAMO_TABLE_NAME) {
        throw new ApplicationError()
    } else if (!internalUser.isValid || !externalUser.isValid) {
        throw new BadRequestError('Invalid User Item')
    }

    try {
        return await DB.documentClient.put({
            TableName: process.env.DYNAMO_TABLE_NAME,
            Item: {
                id: internalUser.id,
                PK: `USER#${externalUser.platform.toUpperCase()}#${externalUser.id}`,
                SK: 'linkedAccount',
                GSI1PK: `USER#SA#${internalUser.id}`,
                GSI1SK: `USER#LINKED#${externalUser.platform.toUpperCase()}`
            },
            ConditionExpression: 'attribute_not_exists(PK)'
        }).promise()
    } catch (error) {
        return getDynamoError(error)
    }
}

export default {
    getOrCreateUser,
    getUserByPlatform,
    createUserByPlatform,
    getUserById,
    linkExternalUser
}
