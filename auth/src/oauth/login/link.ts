import Functions from '../../../../shared/utils/functions'
import Products from '../../../../shared/products'
import Clients from '../../../../shared/clients'

import UserRepository from '../../../../packages/repository/src/user'

import { getAuthorization, createAuthTokens } from '../../../../packages/authorization/src'
import { BadRequestError, AuthorizationError } from '../../../../shared/errors'


export const handler = Functions.toHandler(async (event, context) => {
    const headers = { 'X-AWS-ID': context.awsRequestId }

    const authorization = getAuthorization(event.headers.Authorization?.toString())
    if (!authorization.isValid) {
        throw new AuthorizationError(authorization)
    }

    const oauthClient = Clients[(event.pathParameters?.client?.toLowerCase() as string)]
    const product = Products[(event.parsedBody.clientid?.toLowerCase() as string)]

    if (!oauthClient) {
        throw new BadRequestError(`${event.pathParameters?.client || 'NULL'} is not a valid oauth provider.`)
    } else if (!product) {
        throw new BadRequestError(`${event.parsedBody.clientid || 'NULL'} is not a valid product.`)
    }

    const externalUser = await oauthClient.getUser(event.parsedBody.code)
    await UserRepository.linkAccount(authorization.user, externalUser)
    const tokens = await createAuthTokens({ user: authorization.user, product })

    return Functions.respond.json(tokens, headers)
})
