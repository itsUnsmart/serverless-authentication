import { DynamoDB } from 'aws-sdk'
import { ServiceConfigurationOptions } from 'aws-sdk/lib/service'

const isOffline = process.env.IS_OFFLINE

const options: (DynamoDB.DocumentClient.DocumentClientOptions & ServiceConfigurationOptions & DynamoDB.ClientApiVersions) = {
    region: 'localhost',
    endpoint: 'http://localhost:8000',
    credentials: {
        accessKeyId: 'none',
        secretAccessKey: 'none'
    }
}

export default {
    documentClient: isOffline ? new DynamoDB.DocumentClient(options) : new DynamoDB.DocumentClient()
}
