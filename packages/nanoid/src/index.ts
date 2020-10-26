// SOURCE: https://github.com/ai/nanoid [10-15-2020]

import crypto from 'crypto'

const urlAlphabet = 'ModuleSymbhasOwnPr-0123456789ABCDEFGHNRVfgctiUvz_KqYTJkLxpZXIjQW'
const numAlphabet = '0123456789012345678901234567890123456789012345678901234567890123'

const buffers: { [key: number]: Buffer } = {}
const random = (bytes: number) => {
  const buffer = buffers[bytes] || Buffer.allocUnsafe(bytes)
  if (!buffers[bytes] && bytes <= 255) buffers[bytes] = buffer
  return crypto.randomFillSync(buffer)
}

function generate (size = 25, numerical = false): string | number {
  const alphabet = numerical ? numAlphabet : urlAlphabet
  const bytes = random(size)

  let id = ''

  while (size--) {
    id += alphabet[bytes[size] & 63]
  }

  return id;
}

export default { generate }
