const memoize = require('promise-memoize')

function slowAdd2(x) {
  console.log('slowAdd called with', x, 'returning promise')
  return new Promise(function(resolve, reject) {
    setTimeout(() => resolve(x+1), x)
  })
}

const slowAdd = memoize(slowAdd2, {maxAge: 100})

async function x() {
  console.log('1')
  console.log('2', await slowAdd(1000))
  console.log('3', await slowAdd(1000))
  console.log('4', await slowAdd(2000))
  console.log('x', await slowAdd(500))
  console.log('5', await Promise.all([
    slowAdd(1000),
    slowAdd(1000),
    slowAdd(2000),
    slowAdd(2000),
    slowAdd(1000)
  ]))
  console.log('6', await slowAdd(1000))
}

x()

//let cachedLastPosts = require('promise-memoize')(lastPosts, { maxAge: 60000 });
 
// Later...
// cachedLastPosts(10).then(posts => console.log(posts));
