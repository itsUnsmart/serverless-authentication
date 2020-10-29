import Clients from '../../../shared/clients'
import { redirectTo, toHandler } from '../../../shared/utils'

export const handler = toHandler(async (event) => redirectTo(Clients[(event.pathParameters?.client as string)].authorizeUrl as string ?? Clients.twitch.authorizeUrl))
