import Functions from '../../../../shared/utils/functions'
import Clients from '../../../../shared/clients'

export const handler = Functions.toHandler(async (_event, context) => {
    const headers = { 'X-AWS-ID': context.awsRequestId }
    const clients = Object.keys(Clients).map(name => ({ name, authorizeUrl: Clients[name].authorizeUrl }))
    return Functions.respond.json(clients, headers)
})
