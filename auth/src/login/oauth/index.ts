import Products from '../../../../shared/products'
import Clients from '../../../../shared/clients'

import { responseJson, toHandler } from '../../../../shared/utils'
import { createAuthTokens } from '../../../../packages/authorization/src'
import { BadRequestError } from '../../../../shared/errors'

export const handler = toHandler(async (event, context) => {
    const headers = { 'X-AWS-ID': context.awsRequestId }
    const client = Clients[(event.pathParameters?.client as string)]

    if (!client) {
        throw new BadRequestError('Authorization Client Does Not Exist')
    }

    const user = await client.getUser(event.parsedBody.code)

    // TODO: Database stuffs

    return responseJson(createAuthTokens({ user, product: Products.chat }), headers)
})
