const makeStore = require('./store')

async function run() {
  const store = makeStore()

  //await store.load('https://www.w3.org/2000/01/rdf-schema')
  //await store.load('https://www.w3.org/2000/01/rdf-schema.ttl')
  //await store.load('https://www.w3.org/2000/01/rdf-schema.rdf')
  await store.load('https://github.com/json-ld/json-ld.org/blob/master/test-suite/manifest.jsonld')
  
  store.dump()
}

run()
