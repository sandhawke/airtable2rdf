
const fetch = require('./fetch-base')

const id = 'appdSee21XfRfKD4Q'

fetch(id).then(x => {
  console.log('RETURNED\n', JSON.stringify(x, null, 2))
})
