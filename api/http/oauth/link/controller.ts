import Authorization from '../../../../utils/authorization'
import Controller from '../../../../utils/controller'
import Response from '../../../../utils/response'

import UserRepository from '../../../../repository/user'

import { getOAuthClient } from '../../../../utils/consts'
import { BadRequestError } from '../../../../utils/errors'
import { parse } from '../../../../utils'

import { AccountLink } from './request_schema'
import * as Ajv from 'ajv'
const ajv = new Ajv({ allErrors: true, removeAdditional: true })
const validate = (body: { [key: string]: any }) => ajv.validate(require('./request_schema.json'), body)

export const handle = Controller(async (event, context) => {
    const body: AccountLink = parse(event.body)
    if (!validate(body)) throw new BadRequestError(ajv.errorsText())

    const authorization = Authorization.getRequired(event.headers.Authorization?.toString())
    const externalUser = await getOAuthClient(body.provider).getUser(body.code)
    await UserRepository.linkExternalUser(authorization.user, externalUser)

    return Response.success({ linked: true, externalUser, internalUser: authorization.user }, context)
})
