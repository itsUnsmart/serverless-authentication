import Authorization from '../../../../utils/authorization'
import Controller from '../../../../utils/controller'
import Response from '../../../../utils/response'

import UserRepository from '../../../../repository/user'

import { getOAuthClient, getProduct } from '../../../../utils/consts'
import { BadRequestError } from '../../../../utils/errors'
import { parse } from '../../../../utils'

import { AccountLogin } from './request_schema'
import * as Ajv from 'ajv'
const ajv = new Ajv({ allErrors: true, removeAdditional: true })
const validate = (body: { [key: string]: any }) => ajv.validate(require('./request_schema.json'), body)

export const handle = Controller(async (event, context) => {
    const body: AccountLogin = parse(event.body)
    if (!validate(body)) throw new BadRequestError(ajv.errorsText())

    const product = getProduct(body.clientid)
    const externalUser = await getOAuthClient(body.provider).getUser(body.code)
    const internalUser = await UserRepository.getOrCreateUser(externalUser)
    const authorization = await Authorization.createTokens({ product, user: internalUser })

    return Response.success(authorization, context)
})
