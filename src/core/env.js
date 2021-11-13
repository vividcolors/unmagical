//@ts-check

import {normalizePath, typeOf, isIntStr, normalizePathArray, appendPath} from './utils'
import {hasPath as rhasPath, init, path as rpath, assocPath, insert, last, dissoc, remove as rremove, update } from 'ramda'

/**
 * 
 * @typedef {import("./schema").Json} Json
 * @typedef {import("./schema").Schema} Schema
 * @typedef {import("./schema").Slot} Slot
 * @typedef {import("./schema").SchemaDb} SchemaDb
 * @typedef {import("./schema").LookupFunc} LookupFunc
 * @typedef {{
 *   tree: Json, 
 *   trackUpdate: boolean
 *   updatePoint: ((string|number)[])|null
 *   schemaDb: SchemaDb, 
 *   validate: (value:any, slot:Slot, schema:Schema, lookup:LookupFunc) => Slot
 *   extra: {[name:string]:any}
 *   ret?: (env:Env) => void
 *   onPromiseThen?: any
 * }} Env
 */


/**
 * see: https://github.com/ramda/ramda/pull/2841
 * Anyway, here we fix the original behavior.
 * @param {string[]} path 
 * @param {any} x 
 * @return {boolean}
 */
const hasPath = (path, x) => {
  if (! path.length) return true
  return rhasPath(path, x)
}

const init2 = (list) => {
  return init(init(list))
}

/**
 * 
 * @param {Json} value 
 * @return {Slot} 
 */
const makeSlot = (value) => {
  const rv = {'@value':value, invalid:false, message:''}
  switch (typeOf(value)) {
    case 'object': // FALLTHRU
    case 'array': 
      break
    case 'number': // FALLTHRU
    case 'integer': 
      rv.input = '' + value
      rv.touched = false
      break
    case 'boolean': 
      rv.input = (value) ? 'true' : 'false'
      rv.touched = false
      break
    case 'null': 
      rv.input = ''
      rv.touched = false
      break
    case 'string': 
      rv.input = value
      rv.touched = false
      break
  }
  return rv
}

/**
 * 
 * @param {Json} data 
 * @returns {Slot}
 */
const wrap = (data) => {
  /** @type {(data:Json) => Slot} */
  const inner = (data) => {
    switch (typeOf(data)) {
      case 'array': 
        const es = []
        for (let i = 0; i < /** @type {Json[]} */ (data).length; i++) {
          es[i] = inner(data[i])
        }
        return makeSlot(es)
      case 'object': 
        const rec = {}
        for (let p in /** @type {{[name:string]:Json}} */ (data)) {
          rec[p] = inner(data[p])
        }
        return makeSlot(rec)
      default: 
        return makeSlot(data)
    }
  }
  return inner(data)
}

/**
 * 
 * @param {Json} tree 
 * @returns {Json}
 */
const strip = (tree) => {
  const root = tree['@value']
  switch (typeOf(root)) {
    case 'array': 
      const es = []
      for (let i = 0; i < root.length; i++) {
        es[i] = strip(root[i])
      }
      return es
    case 'object': 
      const rec = {}
      for (let p in root) {
        rec[p] = strip(root[p])
      }
      return rec
    default: 
      return root
  }
}

/**
 * Makes env.
 * @param {Json} data 
 * @param {SchemaDb} schemaDb 
 * @param {(value:any, slot:Slot, schema:Schema, lookup:LookupFunc) => Slot} validate
 * @param {boolean} trackUpdate
 * @returns {Env}
 */
export const makeEnv = (data, schemaDb, validate, trackUpdate) => {
  const tree = wrap(data)
  return {
    tree, 
    trackUpdate, 
    updatePoint: trackUpdate ? [] : null, 
    schemaDb, 
    validate, 
    extra: {}
  }
}

/**
 * 
 * @param {Env} env0 
 * @param {Env} env1 
 * @returns {boolean}
 */
export const isSame = (env0, env1) => {
  return (env0.tree === env1.tree && env0.extra === env1.extra)
}

/**
 * Internalizes a path
 * @param {string} path 
 * @returns {(string|number)[]}
 */
const internPath = (path) => {
  const frags = path.split('/')
  const rv = []
  for (let i = 1; i < frags.length; i++) {
    rv.push('@value')
    rv.push(isIntStr(frags[i]) ? +frags[i] : frags[i])
  }
  return rv
}

/**
 * 
 * @param {(string|number)[]} path 
 * @returns {string}
 */
const externPath = (path) => {
  let rv = ""
  for (let i = 0; i < path.length; i += 2) {
    rv += "/" + path[i + 1]
  }
  return rv
}

/**
 * 
 * @param {((string|number)[])|null} path0 
 * @param {((string|number)[])|null} path1
 * @returns {((string|number)[])|null} 
 */
const intersect = (path0, path1) => {
  if (path0 === null) return path1
  if (path1 === null) return path0

  const rv = []
  for (let i = 0; i < path0.length; i += 2) {
    if (i >= path1.length) break
    if (path0[i + 1] !== path1[i + 1]) break
    rv.push(path0[i])
    rv.push(path0[i + 1])
  }
  return rv
}

/**
 * 
 * @param {Env} env 
 * @returns {Env}
 */
export const beginUpdateTracking = (env) => {
  // Essentially, `updatePoint' should be set to null, but it can be omitted 
  // because the value when disabled is null.
  return {...env, trackUpdate:true}
}

/**
 * 
 * @param {Env} env 
 * @returns {[string|null, Env]}
 */
export const endUpdateTracking = (env) => {
  const updatePoint = env.updatePoint ? externPath(env.updatePoint) : null
  console.log('update occurred at ' + JSON.stringify(updatePoint))
  return [
    updatePoint, 
    {...env, trackUpdate:false, updatePoint:null}
  ]
}

/**
 * 
 * @param {string} path 
 * @param {Env} env 
 * @returns {boolean}
 */
export const test = (path, env) => {
  return hasPath(/** @type {string[]} */ (internPath(path)), env.tree)
}

/**
 * Extracts a subtree of Env.
 * @param {string} path
 * @param {Env} env
 * @returns {Json}
 */
export const extract = (path, env) => {
  const epath = /** @type {string[]} */ (internPath(path))
  const slot = rpath(epath, env.tree)
  if (! slot) {
    throw new Error('extract/1: not found: ' + path)
  }
  return strip(slot)
}

/**
 * Low-level api.
 * @param {string} path 
 * @param {Env} env
 * @returns {Slot} 
 */
export const getSlot = (path, env) => {
  const epath = /** @type {string[]} */ (internPath(path))
  const slot = rpath(epath, env.tree)
  if (! slot) {
    throw new Error('getSlot/1: not found: ' + path)
  }
  return slot
}

/**
 * Low-level api. This function executes neither validation nor coercion.
 * @param {string} path 
 * @param {Slot} slot 
 * @param {Env} env
 * @returns {Env} 
 * 
 * slot value must be a scalar.
 */
export const setSlot = (path, slot, env) => {
  const epath = /** @type {string[]} */ (internPath(path))
  const slot0 = rpath(epath, env.tree)
  if (! slot0) {
    throw new Error('setSlot/1: not found: ' + path)
  }
  switch (typeOf(slot0['@value'])) {
    case 'null': 
    case 'boolean': 
    case 'number': 
    case 'string': 
    case 'undefined': 
      break
    default: 
      throw new Error('setSlot/2: not a scalar: ' + path)
  }
  const tree = assocPath(epath, slot, env.tree)
  const updatePoint = env.trackUpdate ? intersect(env.updatePoint, epath) : env.updatePoint
  return {...env, tree, updatePoint}
}

/**
 * Adds value to env. `add' function of JSON patch.
 * @param {string} path 
 * @param {Json} value 
 * @param {Env} env 
 * @returns {Env}
 */
export const add = (path, value, env) => {
  const epath = /** @type {string[]} */ (internPath(path))
  const location = init2(epath)
  const name = last(epath)
  const slot0 = rpath(location, env.tree)
  const type0 = typeOf(slot0['@value'])
  if (type0 != 'object' && type0 != 'array') {
    throw new Error('add/1 neither an object nor an array: ' + path)
  }
  if (type0 == 'array') {
    // insert into array
    const index = (name === '-') ? slot0['@value'].length : name
    if (typeof index != 'number' || index % 1 !== 0) {
      throw new Error('add/2 invalid index: ' + path)
    }
    if (index < 0 || index > slot0['@value'].length) {
      throw new Error('add/3 index out of range: ' + path)
    }
    const value1 = wrap(value)
    const lis = insert(index, value1, slot0['@value'])
    const slot = makeSlot(lis)
    const tree = assocPath(location, slot, env.tree)
    // Insertion to a list is an update not to an item but to the list.
    const updatePoint = env.trackUpdate ? intersect(env.updatePoint, location) : env.updatePoint
    return {...env, tree, updatePoint}
  } else {
    // define or replace into object
    if (typeof name != 'string') {
      throw new Error('add/4 invalid name: ' + path)
    }
    const value1 = wrap(value)
    const rec = {...slot0['@value'], [name]:value1}
    const slot = makeSlot(rec)
    const tree = assocPath(location, slot, env.tree)
    // Adding a property is an update to an object, while replacing a property is an update to an property value.
    const updatePoint = !env.trackUpdate ? env.updatePoint 
      : intersect(env.updatePoint, (name in slot0['@value']) ? epath : location)
    return {...env, tree, updatePoint}
  }
}

/**
 * Removes a value specified by path from env. `remove' function of JSON patch.
 * @param {string} path 
 * @param {Env} env 
 * @returns {Env}
 */
export const remove = (path, env) => {
  const epath = /** @type {string[]} */ (internPath(path))
  const location = init2(epath)
  const name = last(epath)
  const slot0 = rpath(location, env.tree)
  const type0 = typeOf(slot0['@value'])
  if (type0 != 'object' && type0 != 'array') {
    throw new Error('remove/1 neither an object nor an array: ' + path)
  }
  if (type0 == 'array') {
    // removes from array
    if (typeof name != 'number' || name % 1 !== 0) {
      throw new Error('remove/2 invalid index: ' + path)
    }
    if (name < 0 || name >= slot0['@value'].length) {
      throw new Error('remove/3 out of range: ' + path)
    }
    const lis = rremove(name, 1, slot0['@value'])
    const slot = makeSlot(lis)
    const tree = assocPath(location, slot, env.tree)
    const updatePoint = env.trackUpdate ? intersect(env.updatePoint, location) : env.updatePoint
    return {...env, tree, updatePoint}
  } else {
    // delete property from object
    if (! slot0['@value'].hasOwnProperty(name)) {
      throw new Error('remove/4: property not found: ' + path)
    }
    const rec = dissoc(name, slot0['@value'])
    const slot = makeSlot(rec)
    const tree = assocPath(location, slot, env.tree)
    const updatePoint = env.trackUpdate ? intersect(env.updatePoint, location) : env.updatePoint
    return {...env, tree, updatePoint}
  }
}

/**
 * Replaces a value specified by path into value.  Implements replace function of JSON patch.
 * @param {string} path 
 * @param {Json} value 
 * @param {Env} env 
 * @returns {Env}
 */
export const replace = (path, value, env) => {
  const epath = /** @type {string[]} */ (internPath(path))
  if (epath.length == 0) {
    // replace whole data
    const tree = wrap(value)
    const updatePoint = env.trackUpdate ? [] : env.updatePoint
    return {...env, tree, updatePoint}
  }
  const location = init2(epath)
  const name = last(epath)
  const slot0 = rpath(location, env.tree)
  const type0 = typeOf(slot0['@value'])
  if (type0 != 'object' && type0 != 'array') {
    throw new Error('replace/1 neither an object nor an array: ' + path)
  }
  if (type0 == 'array') {
    // replace an element in array
    if (typeof name != 'number' || name % 1 !== 0) {
      throw new Error('replace/2 invalid index: ' + path)
    }
    if (name < 0 || name >= slot0['@value'].length) {
      throw new Error('replace/3 out of range: ' + path)
    }
    const value1 = wrap(value)
    const lis = update(name, value1, slot0['@value'])
    const slot = makeSlot(lis)
    const tree = assocPath(location, slot, env.tree)
    const updatePoint = env.trackUpdate ? intersect(env.updatePoint, epath) : env.updatePoint
    return {...env, tree, updatePoint}
  } else {
    // replace a property of object
    if (typeof name != 'string') {
      throw new Error('replace/4 invalid name: ' + path)
    }
    if (!(name in slot0['@value'])) {
      throw new Error('replace/5 undefined property: ' + path)
    }
    const value1 = wrap(value)
    const rec = {...slot0['@value'], [name]:value1}
    const slot = makeSlot(rec)
    const tree = assocPath(location, slot, env.tree)
    const updatePoint = env.trackUpdate ? intersect(env.updatePoint, epath) : env.updatePoint
    return {...env, tree, updatePoint}
  }
}

/**
 * Moves a value located in from, to a location specified by path.  Implements move function of JSON patch.
 * @param {string} from 
 * @param {string} path 
 * @param {Env} env
 * @returns {Env} 
 */
export const move = (from, path, env) => {
  const value = extract(from, env)
  env = remove(from, env)
  env = add(path, value, env)
  return env
}

/**
 * Copies a value located in from, to a location specified by path.  Impelementing copy function of JSON patch.
 * @param {string} from 
 * @param {string} path 
 * @param {Env} env
 * @returns {Env} 
 */
export const copy = (from, path, env) => {
  const value = extract(from, env)
  env = add(path, value, env)
  return env
}

/**
 * 
 * @param {string} path 
 * @param {Env} env
 * @returns {Env} 
 */
export const validate = (path, env) => {
  let basePath = null

  /**
   * 
   * @param {string} path 
   * @returns {Json}
   */
  const lookup = (path) => {
    const pathToLookup = appendPath(basePath, path)
    return extract(pathToLookup, env)
  }

  /**
   * 
   * @param {Slot} slot0 
   * @param {string} npath
   * @param {string} path
   * @returns {Slot} 
   */
  const inner = (slot0, npath, path) => {
    const value0 = slot0['@value']
    switch (typeOf(value0)) {
      case 'array': 
        const lis = []
        for (let i = 0; i < (/** @type {Json[]} */(value0)).length; i++) {
          lis[i] = inner(value0[i], npath + '/*', path + '/' + i)
        }
        basePath = path
        return env.validate(lis, slot0, env.schemaDb[npath], lookup)
      case 'object': 
        const rec = {}
        for (let p in  /** @type {{[name:string]:Json}} */(value0)) {
          rec[p] = inner(value0[p], npath + '/' + p, path + '/' + p)
        }
        basePath = path
        return env.validate(rec, slot0, env.schemaDb[npath], lookup)
      default: 
        basePath = path
        const slot = env.validate(value0, slot0, env.schemaDb[npath], lookup)
        if (slot['@value'] !== value0) {
          throw new Error('validate/0: value changed: ' + path)
        }
        return slot
    }
  }

  const epath = internPath(path)
  const slot0 = rpath(epath, env.tree)
  if (! slot0) {
    throw new Error('validate/1: not found: ' + path)
  }
  const slot = inner(slot0, normalizePath(path), path)
  const tree = assocPath(epath, slot, env.tree)
  return {...env, tree}
}

/**
 * By f, maps every slot descending to a location specified by path.
 * @param {(slot:Slot, path:string) => Slot} f 
 * @param {string} path 
 * @param {Env} env 
 * @returns {Env}
 */
export const mapDeep = (f, path, env) => {
  const inner = (slot0, path) => {
    const value0 = slot0['@value']
    switch (typeOf(value0)) {
      case 'array': 
        const lis = []
        for (let i = 0; i < value0.length; i++) {
          lis[i] = inner(value0[i], path + '/' + i)
        }
        return {...f(slot0, path), '@value':lis}
      case 'object': 
        const rec = {}
        for (let p in value0) {
          rec[p] = inner(value0[p], path + '/' + p)
        }
        return {...f(slot0, path), '@value':rec}
      default: 
        return {...f(slot0, path), '@value':value0}
    }
  }
  const epath = internPath(path)
  const slot0 = rpath(epath, env.tree)
  if (! slot0) {
    throw new Error('mapDeep/1: not found: ' + path)
  }
  const slot = inner(slot0, path)
  const tree = assocPath(epath, slot, env.tree)
  return {...env, tree}
}

/**
 * By f, deeply reduces a subtree of path.
 * @template T
 * @param {(cur:T, slot:Slot, path:String) => T} f 
 * @param {T} cur 
 * @param {string} path 
 * @param {Env} env 
 */
export const reduceDeep = (f, cur, path, env) => {
  const inner = (cur, slot, path) => {
    const value0 = slot['@value']
    switch (typeOf(value0)) {
      case 'array': 
        for (let i = 0; i < value0.length; i++) {
          cur = inner(cur, value0[i], path + '/' + i)
        }
        return f(cur, slot, path)
      case 'object': 
        for (let p in value0) {
          cur = inner(cur, value0[p], path + '/' + p)
        }
        return f(cur, slot, path)
      default: 
        return f(cur, slot, path)
    }
  }
  const epath = internPath(path)
  const slot = rpath(epath, env.tree)
  if (! slot) {
    throw new Error('reduceDeep/1: not found: ' + path)
  }
  return inner(cur, slot, path)
}

export const duplicate = (path, fromEnv, toEnv) => {
  const epath = /** @type {string[]} */ (internPath(path))
  if (epath.length == 0) {
    // duplicate whole data
    const tree = fromEnv.tree
    const updatePoint = toEnv.trackUpdate ? [] : toEnv.updatePoint
    return {...toEnv, tree, updatePoint}
  }
  const location = init2(epath)
  const name = last(epath)
  const slot0 = rpath(location, fromEnv.tree)
  const type0 = typeOf(slot0['@value'])
  if (type0 != 'object' && type0 != 'array') {
    throw new Error('duplicate/1 neither an object nor an array: ' + path)
  }
  if (type0 == 'array') {
    // duplicate an element in an array
    if (typeof name != 'number' || name % 1 !== 0) {
      throw new Error('duplicate/2 invalid index: ' + path)
    }
    if (name < 0 || name >= slot0['@value'].length) {
      throw new Error('duplicate/3 out of range: ' + path)
    }
    const value1 = slot0['@value'][name]
    const lis = update(name, value1, slot0['@value'])
    const slot = makeSlot(lis)
    const tree = assocPath(location, slot, toEnv.tree)
    const updatePoint = toEnv.trackUpdate ? intersect(toEnv.updatePoint, epath) : toEnv.updatePoint
    return {...toEnv, tree, updatePoint}
  } else {
    // duplicate a property of an object
    if (typeof name != 'string') {
      throw new Error('replace/4 invalid name: ' + path)
    }
    if (!(name in slot0['@value'])) {
      throw new Error('replace/5 undefined property: ' + path)
    }
    const value1 = slot0['@value'][name]
    const rec = {...slot0['@value'], [name]:value1}
    const slot = makeSlot(rec)
    const tree = assocPath(location, slot, toEnv.tree)
    const updatePoint = toEnv.trackUpdate ? intersect(toEnv.updatePoint, epath) : toEnv.updatePoint
    return {...toEnv, tree, updatePoint}
  }
}

/**
 * 
 * @param {string} name 
 * @param {Object|null} info 
 * @param {Env} env
 * @returns {Env} 
 */
export const setExtra = (name, info, env) => {
  if (info === null) {
    const {[name]:_unused, ...extra} = env.extra
    return {...env, extra}
  } else {
    const extra = {...env.extra, [name]:info}
    return {...env, extra}
  }
}

/**
 * 
 * @param {string} name 
 * @param {Env} env
 * @returns {Object|null} 
 */
export const getExtra = (name, env) => {
  return env.extra[name] || null
}

/**
 * 
 * @param {((env:Env) => void)|null} ret 
 * @param {any} onPromiseThen
 * @param {Env} env 
 * @returns {Env}
 */
export const setPortal = (ret, onPromiseThen, env) => {
  if (ret) return {...env, ret, onPromiseThen}
  const {ret:_unused, onPromiseThen:_unused2, ...env2} = env
  return env2
}

/**
 * 
 * @param {Env} env
 * @returns {void} 
 */
export const doReturn = (env) => {
  if (env.ret) {
    env.ret(env)
  } else {
    throw new Error('doReturn/0: no ret')
  }
}

export const isEnv = (x) => {
  return (x != null 
    && typeof x == "object" 
    && "tree" in x)
}