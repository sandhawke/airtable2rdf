const fetch = require('./fetch-base')
const rdfize = require('./rdfize')
const data = require('./data')
const N3 = require('n3')

async function run () {
  const store = N3.Store();

  function cb (s, p, o) {
    store.addQuad(s, p, o)
  }

  await rdfize(data, cb)

  const writer = N3.Writer(process.stdout,
                           { end: false,
                             prefixes:
                             { '': 'https://example.org#' } })
  store.forEach((s, p, o, g) => {
    writer.addQuad(s, p, o)
  })
  writer.end()
  
}

run()
