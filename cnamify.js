function cnamify (s) {
  s = s.charAt(0).toLowerCase() + s.substr(1)
  return s.replace(/[^\w]/g, '_')
}

module.exports = cnamify
