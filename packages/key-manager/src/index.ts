/// <reference path="./index.d.ts" />

import public1 from './keys/1.key.pub'
import private1 from './keys/1.key'

const publicKeys = {
    1: public1
}

const privateKeys = {
    1: private1
}

const keyId = 1;

const currentKey = {
    public: publicKeys[keyId],
    private: privateKeys[keyId],
    keyId: keyId
}

export default { publicKeys, privateKeys, currentKey }
