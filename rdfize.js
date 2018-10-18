const N3 = require('n3');
const { DataFactory } = N3;
const { namedNode, blankNode, literal, defaultGraph, quad } = DataFactory;
const cnamify = require('./cnamify')

function rdfize(tables, cb) {
  const byId = {}

  const ns = 'https://example.org#'
  
  for (const name of tables._names) {
    const table = tables[name]
    for (const row of table._rows) {
      byId[row._id] = row

      // use _id or Name?   Maybe use 'id' if there is one?  or :id
      let suff = row._id
      if (row.Name) {
        const m = row.Name.match(/((\w*):(\w+))/)
        if (m) {
          suff = m[3]  //   or use namespace prefix?
        } else {
          suff = cnamify(row.Name)
        }
      }
      row._namedNode = namedNode(ns + suff)
    }
  }

  for (const name of tables._names) {
    const table = tables[name]
    for (const row of table._rows) {
      for (let [key, value] of Object.entries(row)) {
        const s = row._namedNode

        if (key.startsWith('_')) continue // ignore keys like _foo
        // look for :foo
        const p = namedNode(ns + cnamify(key))

        let o 
        if (Array.isArray(value)) {
          if (value.length === 1) {
            o = byId[value[0]]._namedNode
          } else {
            continue // just skip these reverse-links
          }
        } else {
          o = literal(value)
        }

        // console.log(row._id, cnamify(key), JSON.stringify(value))
        const q = quad(s, p, o)
        cb(q)
        // console.log(q)
        // console.log()
      }
    }
  }
}

module.exports = rdfize

/*
const data = require('./data')
rdfize(data)
*/
