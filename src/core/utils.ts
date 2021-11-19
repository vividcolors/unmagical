//@ts-check
/** @module core/utils */

export type Index = string|number

/**
 * Returns true if x is an string representation of an integer value.
 * @function
 * @param {any} x
 * @returns {boolean} 
 */
export const isIntStr = (x:any):boolean => {
  const n = +x
  return (n % 1 === 0 && x === "" + n)
}

/**
 * Returns the array-index independent normalized path.
 * @function
 * @param {string} path 
 * @returns {string}
 */
export const normalizePath = (path:string):string => {
  const frags = path.split('/')
  for (let i = 1; i < frags.length; i++) {
    if (isIntStr(frags[i])) {
      frags[i] = '*'
    }
  }
  return frags.join('/')
}

/**
 * Concatenates two pathes, `path' can be a relative one.
 * @function
 * @param {string} base 
 * @param {string} path 
 * @returns {string}
 */
export const appendPath = (base:string, path:string):string => {
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
 * Normalizes not a string path but an array path, then returns a normalized string path.
 * @function
 * @param {Index[]} path
 * @returns {string} 
 */
export const normalizePathArray = (path:Index[]):string => {
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
 * Separates a path described by a string into an Index array.
 * @function
 * @param {string} path 
 * @returns {Index[]}
 */
export const pathToArray = (path:string):Index[] => {
  const frags = path.split('/')
  const rv = []
  for (let i = 1; i < frags.length; i++) {
    rv.push(isIntStr(frags[i]) ? +frags[i] : frags[i])
  }
  return rv
}

/**
 * A variant of `typeof', which handles null and Array appropreately.
 * @function
 * @param {null|array|object|boolean|number|string} x 
 * @returns {string}
 */
export const typeOf = (x:any):string => x === null ? 'null' : Array.isArray(x) ? 'array' : typeof x

/**
 * Empty object.
 * @type {{}}
 */
export const emptyObject:{} = {}

/**
 * Empty Array.
 * @template T
 * @type {T[]}
 */
export const emptyArray:[] = []

/**
 * Returns true if `x' is a json value.
 * @function
 * @param {any} x
 * @returns {boolean} 
 */
export const isJsonValue = (x:any):boolean => {
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
 * Extracts common portion of pathes.
 * @function
 * @param {string} path1 
 * @param {string} path2 
 * @return {string}
 */
export const commonPath = (path1:string, path2:string):string => {
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
 * Builds a query string from `obj'.
 * @function
 * @param {Object} obj 
 * @param {boolean} omitEmptyParam 
 * @returns {Record<string, string>}
 */
export const normalizeQuery = (obj:Record<string,string>, omitEmptyParam:boolean):Record<string,string> => {
  const rv = /** @type {Record<string, string>} */ ({})
  for (let p in obj) {
    switch (typeOf(p)) {
      case 'null': 
        if (!omitEmptyParam) rv[p] = ''
        break
      case 'boolean': 
        rv[p] = obj[p] ? 'true' : 'false'
        break
      case 'number': 
        rv[p] = "" + obj[p]
        break
      case 'string': 
        if (omitEmptyParam && obj[p] === "") break
        rv[p] = obj[p]
        break
    }
  }
  return rv
}