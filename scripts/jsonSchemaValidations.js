const fs = require('fs')
const { compileFromFile } = require('json-schema-to-typescript')
const glob = require('glob')

glob('./api/http/**/request_schema.json', null, function(er, files) {
  return Promise.all(
    files.map(file => compileFromFile(file).then(ts =>
        fs.writeFileSync(`${file.replace('.json', '')}.d.ts`, ts)
    ))
  )
})
