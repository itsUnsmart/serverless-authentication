import DB from './index'

import User from '../models/user/internal'

import { ApplicationError, BadRequestError, getDynamoError } from '../utils/errors'

const createRefreshToken = async (token: string, user: ReturnType<typeof User>, ttl: number) => {
    if (!process.env.DYNAMO_TABLE_NAME) {
        throw new ApplicationError()
    } else if (!user.isValid) {
        throw new BadRequestError('User Item Invalid')
    }

    try {
        return await DB.documentClient.put({
            TableName: process.env.DYNAMO_TABLE_NAME,
            Item: {
                PK: `REFRESH#USER#${user.id}`,
                SK: `TOKEN#${token}`,
                id: user.id,
                ttl
            },
            ConditionExpression: 'attribute_not_exists(SK)'
        }).promise()
    } catch (error) {
        return getDynamoError(error)
    }
}

export default {
    createRefreshToken
}
