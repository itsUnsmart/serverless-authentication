import Config from '../config'
import * as jws from 'jws'

interface IJWTPayload {
    iss: string
    aud: string
    sub: string
    exp: number
    [key: string]: any
}

interface IParsedJWT {
    header: { [key: string]: any }
    payload: IJWTPayload
}

interface IVerifyInput {
    token: string | null
    keys: { [key: string]: string }
}


/**
 * Create JWT's
 */

const algorithm = 'RS256'
const reservedKeys = ['iss', 'sub', 'aud', 'exp']

function create({ currentKey, data = {}, expiresIn = 1000 * 60 * 30, clientid, userid }: { currentKey: { private: string, keyId: number }; data?: { [key: string]: any }; expiresIn?: number; clientid: string; userid: string; }) {
  const header = {
    alg: algorithm as jws.Algorithm,
    typ: 'JWT',
    kid: `${currentKey.keyId}`
  }

  const keys = Object.keys(data);
  if (reservedKeys.some(key => keys.includes(key)))
    throw new InvalidJWTError(`JWT data cannot contain the reserved keys: [ ${reservedKeys.join(', ')} ]`)

  const payload: IJWTPayload = {
    ...data,
    iss: Config.issuer,
    sub: userid,
    aud: clientid,
    exp: Math.floor((Date.now() + expiresIn) / 1000)
  }

  return {
    payload,
    jwt: jws.sign({
      header,
      payload,
      privateKey: currentKey.private
    })
  }
}

/**
 * Parse and Verify JWT's
 */

function safeParseJSON(data: string): { [key: string]: any } | null {
  try {
    return JSON.parse(data)
  } catch {
    return null
  }
}

function parse(token: string | null): IParsedJWT {
  if (!token) throw new InvalidJWTError('No authorization token provided.', 10404)

  const parts = token.split('.')

  if (parts.length !== 3) throw new InvalidJWTError()

  const header = safeParseJSON(Buffer.from(parts[0], 'base64').toString('utf8'))
  const payload = safeParseJSON(Buffer.from(parts[1], 'base64').toString('utf8')) as IJWTPayload

  if (header === null || payload === null) throw new InvalidJWTError()

  return { header, payload }
}

function validateDetails({ token, keys }: IVerifyInput): IParsedJWT {
  const { header, payload } = parse(token)

  if (header.alg !== algorithm || !keys[header.kid]) throw new InvalidJWTError()
  else if (Number.isNaN(payload.exp) || Date.now() > payload.exp * 1000) throw new InvalidJWTError('Authorization token has expired.', 10401)

  return { header, payload }
}

function verify({ token, keys }: IVerifyInput) {
  const { header, payload } = validateDetails({ token, keys })

  if (!jws.verify(token as string, algorithm, keys[header.kid])) throw new InvalidJWTError('Cannot verify authorization token.', 10401)

  return { header, payload }
}

class InvalidJWTError extends Error {
  public code: number

  constructor(message: string = 'Cannot process authorization token. Token is malformed.', code = 10400) {
    super(message)

    this.name = 'Invalid Authorization Token'
    this.code = code
  }
}

export default { create, verify, InvalidJWTError }
