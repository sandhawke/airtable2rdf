/*
  Given a URL, load the RDF from it

  Basically, extends ldfetch to also do Airtable, and includes the
  semantics that the URL is the graph name.  (Maybe at some point we'll
  support multiple loadings or something, also re-loading.)

  BUG: reload doesn't clear it first

  Also includes silly hack for nicer github URLs -- works with normal
  URLs, so you don't need to get over to rawgithubusercontent.com
  yourself.

*/
const airfetch = require('./fetch-base')
const LDFetcher = require('ldfetch')
const rdfize = require('./rdfize')
const N3 = require('n3')
const { DataFactory } = N3;
const { namedNode, literal, defaultGraph, quad } = DataFactory;
const debug = require('debug')('load')

async function load (url, store) {
  const graphName = namedNode(url)
  if (!store) store = this // at func to store, if you like

  const cb = (triple) => {
    triple.graph = graphName
    debug('adding', triple)
    store.addQuad(triple)
  }
  
  if (url.match(/^https:\/\/airtable.com\//)) {
    const base = await airfetch(url)
    rdfize(base, cb)
    return
  }
  
  url = rawGitHub(url)
    
  const fetcher = new LDFetcher()
  fetcher.on('request', url => { console.log("HTTP " + url); });
  fetcher.on('response', (url, resp)=> { console.log("OK " + url, resp); });
  fetcher.on('downloaded', obj => { console.log('got', obj) });
  fetcher.on('redirect', obj => { console.log('redirect', obj) });
  fetcher.on('error', e => { console.log(e) })

  const response = await fetcher.get(url)
  for (let i = 0; i < response.triples.length; i++) {
    let triple = response.triples[i];
    // console.log('triple', triple)
    cb(triple)
  }
}

const ghre = new RegExp('https://github.com/(.*?)/(.*?)/blob/master/(.*)')
function rawGitHub(url) {
  const m = url.match(ghre)
  if (m) {
    const user = m[1]
    const repo = m[2]
    const file = m[3]
    url = `https://raw.githubusercontent.com/${user}/${repo}/master/${file}`
  }
  return url
}

module.exports = load
