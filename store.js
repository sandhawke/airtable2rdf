const N3 = require('n3')
const load = require('./load')

function makeStore () {
  const store = N3.Store()
  store.aload = load   // call it aload to remind myself to await it
  // (which seems silly, but I keep forgetting.)
  store.dump = dump
  return store

  function dump() {
  const writer = N3.Writer(process.stdout,
                           { end: false,
                             prefixes:
                             { '': 'https://example.org#' } })
  store.forEach(q => writer.addQuad(q))
  writer.end()
}


}

// find prefixes programmatically???

module.exports = makeStore


