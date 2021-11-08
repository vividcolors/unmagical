//@ts-check

/**
 * Returns true if x is an string representation of an integer value.
 * @param {any} x
 * @returns {boolean} 
 */
export const isIntStr = (x) => {
  const n = +x
  return (n % 1 === 0 && x === "" + n)
}

/**
 * 
 * @param {string} path 
 * @returns {string}
 */
export const normalizePath = (path) => {
  const frags = path.split('/')
  for (let i = 1; i < frags.length; i++) {
    if (isIntStr(frags[i])) {
      frags[i] = '*'
    }
  }
  return frags.join('/')
}

/**
 * 
 * @param {string} base 
 * @param {string} path 
 * @returns {string}
 */
export const appendPath = (base, path) => {
  if (path.charAt(0) == '' || path.charAt(0) == '/') return path  // absolute path
  if (path === '0') return base  // easy frequent case
  
  const base1 = pathToArray(base)
  let frag0 = path.split('/')
  let frag = []
  let unused = null

  let upcount = +frag0[0]
  frag = base1
  if (upcount > frag.length) {
    upcount = frag.length
  }
  frag.splice(frag.length - upcount, upcount)

  frag0.shift()

  if (frag0.length == 0 && frag.length == 0) return ''
  return '/' + frag.concat(frag0).join('/')
}

/**
 * 
 * @param {(string | number)[]} path
 * @returns {string} 
 */
export const normalizePathArray = (path) => {
  let rv = ''
  for (let i = 0; i < path.length; i++) {
    if (typeof path[i] == 'number' || isIntStr(path[i])) {
      rv += '/*'
    } else {
      rv += '/' + path[i]
    }
  }
  return rv
}

/**
 * 
 * @param {string} path 
 * @returns {(string | number)[]}
 */
export const pathToArray = (path) => {
  const frags = path.split('/')
  const rv = []
  for (let i = 1; i < frags.length; i++) {
    rv.push(isIntStr(frags[i]) ? +frags[i] : frags[i])
  }
  return rv
}

/**
 * A variant of `typeof`, which handles null and Array appropreately.
 * @param {null|array|object|boolean|number|string} x 
 * @returns {string}
 */
export const typeOf = (x) => x === null ? 'null' : Array.isArray(x) ? 'array' : typeof x

/**
 * @type {{}}
 */
export const emptyObject = {}

/**
 * @template T
 * @type {T[]}
 */
export const emptyArray = []

/**
 * Returns true if `x' is json value.
 * @param {any} x
 * @returns {boolean} 
 */
export const isJsonValue = (x) => {
  switch (typeOf(x)) {
    case 'null': 
    case 'number': 
    case 'boolean': 
    case 'string': 
    case 'object': 
    case 'array': 
      return true
    default: 
      return false
  }
}

/**
 * 
 * @param {string} path1 
 * @param {string} path2 
 * @return {string}
 */
export const commonPath = (path1, path2) => {
  const frags1 = path1.split('/')
  const frags2 = path2.split('/')
  const rv = []
  for (let i = 0; i < frags1.length; i++) {
    if (frags2.length <= i) break
    if (frags1[i] != frags2[i]) break
    rv.push(frags1[i])
  }
  return rv.join('/')
}

/**
 * 
 * @param {Object} obj 
 * @param {boolean} omitEmptyString 
 * @returns {Record<string, string>}
 */
export const normalizeQuery = (obj, omitEmptyString) => {
  const rv = /** @type {Record<string, string>} */ ({})
  for (let p in obj) {
    switch (typeOf(p)) {
      case 'null': 
        if (!omitEmptyString) rv[p] = ''
        break
      case 'boolean': 
        rv[p] = obj[p] ? 'true' : 'false'
        break
      case 'number': 
        rv[p] = "" + obj[p]
        break
      case 'string': 
        if (omitEmptyString && obj[p] === "") break
        rv[p] = obj[p]
        break
    }
  }
  return rv
}