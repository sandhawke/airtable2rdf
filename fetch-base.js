/*
  After I wrote this, I noticed airtable-fetch in NPM.   I could rip out
  most of this and use that instead.   But this seem so be working okay.
*/

const memoize = require('promise-memoize')
const Airtable = require('airtable')
const debug = require('debug')('fetch-base')
const cnamify = require('./cnamify')

process.on('unhandledRejection', (reason, p) => {
  console.error(process.argv[1], 'Unhandled Rejection at: Promise', p, 'reason:', reason)
  process.exit()
})

module.exports = fetch

// the real ids look like appt0RIYRgR0UbMJM
// but sometimes they're embedded in a URL, like as they are listed
// on https://airtable.com/api
// so we accept the URL form as well
const re = new RegExp('^(https://airtable.com/)?app(.*?)(/api/docs.*)?$')
function baseId(idMaybe) {
  const m = idMaybe.match(re)
  if (!m) {
    console.error('airtable ID looks bad', idMaybe)
    throw Error('airtable ID looks bad: ' + idMaybe)
  }
  const id = 'app' + m[2]
  return id
}

function fetch(idMaybe, tablename) {
  const id = baseId(idMaybe)
  const base = Airtable.base(id)
  
  if (tablename) {
    return tableDump(base, tablename, id)
  } else {
    return baseDump(base, id)
  }
}

// This should give us some rate limiting, but if we end up
// doing loops to get rows, we'll still hit the limit.  So
// maybe we should do this at a lower level?
const baseDump = memoize(baseDumpReal, { maxAge: 1000 })
const tableDump = memoize(tableDumpReal, { maxAge: 1000 })

async function baseDumpReal(base, id) {
  const tables = {}
  
  // Because Airtable API provides no way to enumerate table, we need
  // to use a table with the hardcoded name 'About', and a row in it
  // called 'tables', which is the table names, one per line.
  tables.About = await tableDumpReal(base, 'About', id)
  tables.about = tables.About
  // debug('got about: ', tables.about)
  const tableNamesRow = tables.about.tables
  if (tableNamesRow) {
    // debug('tablesNames is', tableNamesRow)
    tables._names = tableNamesRow.Value.split(/[,\n]/)
    
    for (const name of tables._names) {
      const data = await tableDumpReal(base, name, id)
      tables[name] = data
      tables[cnamify(name)] = data
    }
  } else {
    console.error('Missing "tables" row in "About" table, needed to find full data')
  }
  
  return tables
}



function tableDumpReal(base, tableName, id) {
  return new Promise((resolve, reject) => {
    const gathering =  []
    
    function rec (row) {
      const obj = row.fields
      obj._id = row.id
      // debug('got row', obj)
      gathering.push(obj)
    }

    function page(records, fetchNextPage) {
      // debug('got page')
      records.forEach(rec)
      fetchNextPage()
    }
    
    function done (err) {
      // debug('done called, err=', err)
      if (err) {
        console.error('rejecting with airtable err', err)
        reject(err)
        return
      }
      const result = { _rows: gathering }
      for (const row of result._rows) {
        result[row._id] = row
        result[row.Name] = row
      }
      console.log('completed fetch of', id, tableName)
      resolve(result)
    }

    console.log('starting fetch of', id, tableName)
    base(tableName).select({
      view: "Grid view"
    }).eachPage(page, done)
  })  
}
