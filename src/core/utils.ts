
/**
 * Some utility functions.
 * 
 * @module core/utils 
 */

/**
 * JSON path's index portion.  
 * We handle JSON path of `"/abc/1/def"` as an index array of `["abc", 1, "def"]`.
 */
export type Index = string|number

/**
 * Returns true if x is an string representation of an integer value.
 * 
 * @example
 * ```js
 * isIntStr("abc");  // => false
 * isIntStr("123");  // => true
 * isIntStr("1a");   // => false
 * ```
 * 
 */
export const isIntStr = (x:string):boolean => {
  const n = +x
  return (n % 1 === 0 && x === "" + n)
}

/**
 * Returns the array-index independent normalized path.
 * 
 * @example
 * ```
 * normalizePath("/abc/1/def");  // => "/abc/" + "*" + "/def"
 * ```
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
 * Concatenates two paths, `path' can be a relative one.
 * It roughly follows the Relative JSON path standard.
 * 
 * @example
 * ```
 * appendPath("/abc/def", "1/zzz");  // => "/abc/zzz"
 * appendPath("/abc/def", "0/zzz");  // => "/abc/def/zzz"
 * appendPath("/abc/def", "/zzz");   // => "/zzz"
 * ```
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
 * 
 */
export const normalizePathArray = (path:Index[]):string => {
  let rv = ''
  for (let i = 0; i < path.length; i++) {
    if (typeof path[i] == 'number' || isIntStr("" + path[i])) {
      rv += '/*'
    } else {
      rv += '/' + path[i]
    }
  }
  return rv
}

/**
 * Separates a path described by a string into an Index array.
 * 
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
 * 
 * @example
 * ```
 * typeOf([]);    // => 'array'
 * typeOf(null);  // => 'null'
 * ```
 */
export const typeOf = (x:any):string => x === null ? 'null' : Array.isArray(x) ? 'array' : typeof x

/**
 * Returns true if `x' is a json value. This is just a shallow test.
 * 
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
 * Extracts common portion of paths.
 * 
 * @example
 * ```
 * commonPath("/abc/def", "/abc/zzz");  // => "/abc"
 * commonPath("/abc/def", "/abc/deX");  // => "/abc"
 * commonPath("/abc", "/xxx");  // => ""
 * commonPath("/abc/def/aaa", "/abc/def/bbb");  // => "/abc/def"
 * ```
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
 * 
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