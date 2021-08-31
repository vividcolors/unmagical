
import * as E from './env'

const filterTable = {}

export const addFilter = (name, f) => {
  filterTable[name] = f
}

export const evalXpath = (xpath, env) => {
  const [body, ...filters] = xpath.split('|')
  const matches = body.match(/([\w-\/]+)(\?([\w-]+))?/)
  if (! matches) {
    throw new Error('evalXpath/1: invalid xpath: ' + xpath)
  }
  const path = matches[1]
  const defaults = {raw:'', touched:false, invalid:false, ecode:'', eparam:null, disabled:false, key:0}
  if (matches[3] && !defaults.hasOwnProperty(matches[3])) {
    throw new Error('evalXpath/2: unkdnown meta: ' + matches[3])
  }
  let value = matches[3] ? E.getm(path, matches[3], defaults[matches[3]], env) : E.lookup(path, env)
  return filters.reduce((value, f) => filterTable[f](value), value)
}

const typeOf = (x) => x === null ? 'null' : Array.isArray(x) ? 'array' : typeof x

// returns true for null, [], {} and ""
addFilter('empty', (value) => {
  switch (typeOf(value)) {
    case 'null': 
      return true
    case 'array': 
      return value.length == 0
    case 'object': 
      for (let p in value) {
        return false
      }
      return true
    case 'string': 
      return value === ""
    default: 
      return false
  }
})

// return falsy for false, 0, "", null
addFilter('falsy', (value) => {
  return (!value)
})

addFilter('truthy', (value) => {
  return (!!value)
})

addFilter('not', (value) => {
  return (!value)
})

addFilter('positive', (value) => {
  if (typeof value != 'number') return false
  return value > 0
})

addFilter('negative', (value) => {
  if (typeof value != 'number') return false
  return value < 0
})