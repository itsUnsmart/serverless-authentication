import Controller from '../../../../../utils/controller'
import Response from '../../../../../utils/response'

import { getOAuthClients } from '../../../../../utils/consts'

export const handle = Controller(async (_event, context) => Response.success(getOAuthClients(), context))
