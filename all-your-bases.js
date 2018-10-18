// belongs in a different repo, soon

const makeStore = require('./store')

const N3 = require('n3')
const { DataFactory } = N3;
const { namedNode, literal, defaultGraph, quad } = DataFactory;

const root = 'https://airtable.com/appiqq4fgycEaChJC/api/docs'
const rootGraph = namedNode(root)

const ns = 'https://example.org#'

async function run () {
  const store = makeStore()
  await store.aload(root)
  
  const sourceURLs = []
  const publicURL = namedNode(ns + 'public_URL')
  store.some(q => {
    sourceURLs.push(q.object.value)
    console.log('URL:', q.object.value)
  }, null, publicURL, null, rootGraph)

  for (const src of sourceURLs) {
    try {
      await store.aload(src)
    } catch (e) {
      console.log('WARNING: failed fetching listed source', src, e)
      continue
    }
  }

  store.dump()
}

run()

module.exports = run
