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