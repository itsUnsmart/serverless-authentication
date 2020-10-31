import Functions from '../../../../shared/utils/functions'
import Clients from '../../../../shared/clients'

export const handler = Functions.toHandler(async (event) =>
    Functions.respond.redirect(Clients[(event.pathParameters?.client as string)].authorizeUrl as string ?? Clients.twitch.authorizeUrl)
)
