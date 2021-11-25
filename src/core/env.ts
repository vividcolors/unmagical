/**
 * This is the core data store object in Unmagical, and it is an abstract data type.
 * @module core/env
 */

import {normalizePath, typeOf, isIntStr, normalizePathArray, appendPath, Index} from './utils'
import rhasPath from 'ramda/src/hasPath'
import init from 'ramda/src/init'
import rpath from 'ramda/src/path'
import assocPath from 'ramda/src/assocPath'
import insert from 'ramda/src/insert'
import last from 'ramda/src/last'
import dissoc from 'ramda/src/dissoc'
import rremove from 'ramda/src/remove'
import update from 'ramda/src/update'
import {Json, Schema, Slot, SchemaDb, Lookup, Validate} from './schema'

type MutateSlot = (slot:Slot, path:string) => Slot
type ReduceSlot<T> = (cur:T, slot:Slot, path:string) => T

/**
 * Env is the abstract data type.
 * @ignore
 */
export type Env = {
  tree: Json, 
  trackUpdate: boolean, 
  updatePoint: Index[], 
  schemaDb: SchemaDb, 
  validate: Validate, 
  extra: Record<string,any>, 
  ret?: any, 
  onPromiseThen?: any
}


/**
 * see: https://github.com/ramda/ramda/pull/2841
 * Anyway, here we fix the original behavior.
 * @function
 * @private
 * @param {string[]} path 
 * @param {any} x 
 * @return {boolean}
 */
const hasPath = (path:Index[], x:any):boolean => {
  if (! path.length) return true
  return rhasPath(path as string[], x)
}

/**
 * 
 * @function
 * @private
 */
const init2 = <T>(list:T[]) => {
  return init(init(list))
}

/**
 * 
 * @function
 * @private
 * @param {Json} value 
 * @return {Slot} 
 */
const makeSlot = (value:Json):Slot => {
  const rv:Slot = {value, invalid:false, error:null}
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
      rv.input = value as string
      rv.touched = false
      break
  }
  return rv
}

/**
 * 
 * @function
 * @private
 * @param {Json} data 
 * @returns {Slot}
 */
const wrap = (data):Slot => {
  /** @type {(data:Json) => Slot} */
  const inner = (data:Json):Slot => {
    switch (typeOf(data)) {
      case 'array': 
        const es = []
        for (let i = 0; i < (data as Json[]).length; i++) {
          es[i] = inner(data[i])
        }
        return makeSlot(es)
      case 'object': 
        const rec = {}
        for (let p in (data as Object)) {
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
 * @function
 * @private
 * @param {Json} tree 
 * @returns {Json}
 */
const strip = (tree:Json):Json => {
  const root = (tree as Slot).value
  switch (typeOf(root)) {
    case 'array': 
      const es = []
      for (let i = 0; i < (root as Json[]).length; i++) {
        es[i] = strip(root[i])
      }
      return es
    case 'object': 
      const rec = {}
      for (let p in (root as Object)) {
        rec[p] = strip(root[p])
      }
      return rec
    default: 
      return root
  }
}

/**
 * Makes env.
 * @function
 * @param {Json} data 
 * @param {SchemaDb} schemaDb 
 * @param {ValidateFunc} validate
 * @param {boolean} trackUpdate
 * @returns {Env}
 * 
 * @category Common Variables
 */
export const makeEnv = (data:Json, schemaDb:SchemaDb, validate:Validate, trackUpdate:boolean):Env => {
  const tree = wrap(data) as Json
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
 * @function
 * @param {Env} env0 
 * @param {Env} env1 
 * @returns {boolean}
 * 
 * @category Common Variables
 */
export const isSame = (env0:Env, env1:Env):boolean => {
  return (env0.tree === env1.tree && env0.extra === env1.extra)
}

/**
 * Internalizes a path
 * @function
 * @private
 * @param {string} path 
 * @returns {(string|number)[]}
 */
const internPath = (path:string):Index[] => {
  const frags = path.split('/')
  const rv = []
  for (let i = 1; i < frags.length; i++) {
    rv.push('value')
    rv.push(isIntStr(frags[i]) ? +frags[i] : frags[i])
  }
  return rv
}

/**
 * 
 * @function
 * @private
 * @param {(string|number)[]} path 
 * @returns {string}
 */
const externPath = (path:Index[]):string => {
  let rv = ""
  for (let i = 0; i < path.length; i += 2) {
    rv += "/" + path[i + 1]
  }
  return rv
}

/**
 * 
 * @function
 * @private
 * @param {((string|number)[])|null} path0 
 * @param {((string|number)[])|null} path1
 * @returns {((string|number)[])|null} 
 */
const intersect = (path0:Index[]|null, path1:Index[]|null):Index[]|null => {
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
 * @function
 * @param {Env} env 
 * @returns {Env}
 * 
 * @category Common Variables
 */
export const beginUpdateTracking = (env:Env):Env => {
  // Essentially, `updatePoint' should be set to null, but it can be omitted 
  // because the value when disabled is null.
  return {...env, trackUpdate:true}
}

/**
 * 
 * @function
 * @param {Env} env 
 * @returns {[string|null, Env]}
 * 
 * @category Common Variables
 */
export const endUpdateTracking = (env:Env):[string|null, Env] => {
  const updatePoint = env.updatePoint ? externPath(env.updatePoint) : null
  console.log('update occurred at ' + JSON.stringify(updatePoint))
  return [
    updatePoint, 
    {...env, trackUpdate:false, updatePoint:null}
  ]
}

/**
 * 
 * @function
 * @param {string} path 
 * @param {Env} env 
 * @returns {boolean}
 * 
 * @category Common Variables
 */
export const test = (path:string, env:Env):boolean => {
  return hasPath(/** @type {string[]} */ (internPath(path)), env.tree)
}

/**
 * Extracts a subtree of Env.
 * @function
 * @param {string} path
 * @param {Env} env
 * @returns {Json}
 * 
 * @category Common Variables
 */
export const extract = (path:string, env:Env):Json => {
  const epath = /** @type {string[]} */ (internPath(path))
  const slot = rpath(epath, env.tree)
  if (! slot) {
    throw new Error('extract/1: not found: ' + path)
  }
  return strip(slot as Json)
}

/**
 * Low-level api.
 * @function
 * @param {string} path 
 * @param {Env} env
 * @returns {Slot} 
 * 
 * @category Common Variables
 */
export const getSlot = (path:string, env:Env):Slot => {
  const epath = /** @type {string[]} */ (internPath(path))
  const slot = rpath(epath, env.tree)
  if (! slot) {
    throw new Error('getSlot/1: not found: ' + path)
  }
  return slot
}

/**
 * Low-level api. This function executes neither validation nor coercion.
 * @function
 * @param {string} path 
 * @param {Slot} slot 
 * @param {Env} env
 * @returns {Env} 
 * 
 * slot value must be a scalar.
 * 
 * @category Common Variables
 */
export const setSlot = (path:string, slot:Slot, env:Env):Env => {
  const epath = internPath(path)
  const slot0 = rpath(epath, env.tree) as Slot
  if (! slot0) {
    throw new Error('setSlot/1: not found: ' + path)
  }
  switch (typeOf(slot0.value)) {
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
 * @function
 * @param {string} path 
 * @param {Json} value 
 * @param {Env} env 
 * @returns {Env}
 * 
 * @category Common Variables
 */
export const add = (path:string, value:Json, env:Env):Env => {
  const epath = internPath(path)
  const location = init2(epath)
  const name = last(epath)
  const slot0 = rpath(location, env.tree) as Slot
  const type0 = typeOf(slot0.value)
  if (type0 != 'object' && type0 != 'array') {
    throw new Error('add/1 neither an object nor an array: ' + path)
  }
  if (type0 == 'array') {
    // insert into array
    const index = (name === '-') ? (slot0.value as Json[]).length : name
    if (typeof index != 'number' || index % 1 !== 0) {
      throw new Error('add/2 invalid index: ' + path)
    }
    if (index < 0 || index > (slot0.value as Json[]).length) {
      throw new Error('add/3 index out of range: ' + path)
    }
    const value1 = wrap(value) as Json
    const lis = insert(index, value1, slot0.value as Json[])
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
    const rec = {...(slot0.value as {[prop:string]:Json}), [name]:value1} as Json
    const slot = makeSlot(rec)
    const tree = assocPath(location, slot, env.tree)
    // Adding a property is an update to an object, while replacing a property is an update to an property value.
    const updatePoint = !env.trackUpdate ? env.updatePoint 
      : intersect(env.updatePoint, (name in (slot0.value as Object)) ? epath : location)
    return {...env, tree, updatePoint}
  }
}

/**
 * Removes a value specified by path from env. `remove' function of JSON patch.
 * @function
 * @param {string} path 
 * @param {Env} env 
 * @returns {Env}
 * @category Common Variables
 */
export const remove = (path:string, env:Env):Env => {
  const epath = internPath(path)
  const location = init2(epath)
  const name = last(epath)
  const slot0 = rpath(location, env.tree) as Slot
  const type0 = typeOf(slot0.value)
  if (type0 != 'object' && type0 != 'array') {
    throw new Error('remove/1 neither an object nor an array: ' + path)
  }
  if (type0 == 'array') {
    // removes from array
    if (typeof name != 'number' || name % 1 !== 0) {
      throw new Error('remove/2 invalid index: ' + path)
    }
    if (name < 0 || name >= (slot0.value as Json[]).length) {
      throw new Error('remove/3 out of range: ' + path)
    }
    const lis = rremove(name, 1, slot0.value as Json[])
    const slot = makeSlot(lis)
    const tree = assocPath(location, slot, env.tree)
    const updatePoint = env.trackUpdate ? intersect(env.updatePoint, location) : env.updatePoint
    return {...env, tree, updatePoint}
  } else {
    // delete property from object
    if (! slot0.value.hasOwnProperty(name)) {
      throw new Error('remove/4: property not found: ' + path)
    }
    const rec = dissoc(name as never, slot0.value as object)
    const slot = makeSlot(rec)
    const tree = assocPath(location, slot, env.tree)
    const updatePoint = env.trackUpdate ? intersect(env.updatePoint, location) : env.updatePoint
    return {...env, tree, updatePoint}
  }
}

/**
 * Replaces a value specified by path into value.  Implements replace function of JSON patch.
 * @function
 * @param {string} path 
 * @param {Json} value 
 * @param {Env} env 
 * @returns {Env}
 * @category Common Variables
 */
export const replace = (path:string, value:Json, env:Env):Env => {
  const epath = internPath(path)
  if (epath.length == 0) {
    // replace whole data
    const tree = wrap(value) as Json
    const updatePoint = env.trackUpdate ? [] : env.updatePoint
    return {...env, tree, updatePoint}
  }
  const location = init2(epath)
  const name = last(epath)
  const slot0 = rpath(location, env.tree) as Slot
  const type0 = typeOf(slot0.value)
  if (type0 != 'object' && type0 != 'array') {
    throw new Error('replace/1 neither an object nor an array: ' + path)
  }
  if (type0 == 'array') {
    // replace an element in array
    if (typeof name != 'number' || name % 1 !== 0) {
      throw new Error('replace/2 invalid index: ' + path)
    }
    if (name < 0 || name >= (slot0.value as Json[]).length) {
      throw new Error('replace/3 out of range: ' + path)
    }
    const value1 = wrap(value) as Json
    const lis = update(name, value1, slot0.value as Json[])
    const slot = makeSlot(lis)
    const tree = assocPath(location, slot, env.tree)
    const updatePoint = env.trackUpdate ? intersect(env.updatePoint, epath) : env.updatePoint
    return {...env, tree, updatePoint}
  } else {
    // replace a property of object
    if (typeof name != 'string') {
      throw new Error('replace/4 invalid name: ' + path)
    }
    if (!(name in (slot0.value as {[prop:string]:Json}))) {
      throw new Error('replace/5 undefined property: ' + path)
    }
    const value1 = wrap(value)
    const rec = {...(slot0.value as {[prop:string]:Json}), [name]:value1} as {[prop:string]:Json}
    const slot = makeSlot(rec)
    const tree = assocPath(location, slot, env.tree)
    const updatePoint = env.trackUpdate ? intersect(env.updatePoint, epath) : env.updatePoint
    return {...env, tree, updatePoint}
  }
}

/**
 * Moves a value located in from, to a location specified by path.  Implements move function of JSON patch.
 * @function
 * @param {string} from 
 * @param {string} path 
 * @param {Env} env
 * @returns {Env} 
 * @category Common Variables
 */
export const move = (from:string, path:string, env:Env):Env => {
  const value = extract(from, env)
  env = remove(from, env)
  env = add(path, value, env)
  return env
}

/**
 * Copies a value located in from, to a location specified by path.  Impelementing copy function of JSON patch.
 * @function
 * @param {string} from 
 * @param {string} path 
 * @param {Env} env
 * @returns {Env} 
 * @category Common Variables
 */
export const copy = (from:string, path:string, env:Env):Env => {
  const value = extract(from, env)
  env = add(path, value, env)
  return env
}

/**
 * 
 * @function
 * @param {string} path 
 * @param {Env} env
 * @returns {Env} 
 * @category Common Variables
 */
export const validate = (path:string, env:Env):Env => {
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
  const inner = (slot0:Slot, npath:string, path:string):Slot => {
    const value0 = slot0.value
    switch (typeOf(value0)) {
      case 'array': 
        const lis = []
        for (let i = 0; i < (value0 as Json[]).length; i++) {
          lis[i] = inner(value0[i], npath + '/*', path + '/' + i)
        }
        basePath = path
        return env.validate(lis, slot0, env.schemaDb[npath], lookup)
      case 'object': 
        const rec = {}
        for (let p in  (value0 as Record<string,Json>)) {
          rec[p] = inner(value0[p], npath + '/' + p, path + '/' + p)
        }
        basePath = path
        return env.validate(rec, slot0, env.schemaDb[npath], lookup)
      default: 
        basePath = path
        const slot = env.validate(value0, slot0, env.schemaDb[npath], lookup)
        if (slot.value !== value0) {
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
 * @function
 * @param {MutateSlotFunc} f 
 * @param {string} path 
 * @param {Env} env 
 * @returns {Env}
 * @category Common Variables
 */
export const mapDeep = (f:MutateSlot, path:string, env:Env):Env => {
  const inner = (slot0:Slot, path:string):Slot => {
    const value0 = slot0.value
    switch (typeOf(value0)) {
      case 'array': 
        const lis = []
        for (let i = 0; i < (value0 as Json[]).length; i++) {
          lis[i] = inner(value0[i], path + '/' + i)
        }
        return {...f(slot0, path), value:lis}
      case 'object': 
        const rec = {}
        for (let p in (value0 as Record<string,Json>)) {
          rec[p] = inner(value0[p], path + '/' + p)
        }
        return {...f(slot0, path), value:rec}
      default: 
        return {...f(slot0, path), value:value0}
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
 * @function
 * @template T
 * @param {ReduceSlotFunc<T>} f 
 * @param {T} cur 
 * @param {string} path 
 * @param {Env} env 
 * @returns {T}
 * @category Common Variables
 */
export const reduceDeep = <T>(f:ReduceSlot<T>, cur:T, path:string, env:Env):T => {
  const inner = (cur:T, slot:Slot, path:string):T => {
    const value0 = slot.value
    switch (typeOf(value0)) {
      case 'array': 
        for (let i = 0; i < (value0 as Json[]).length; i++) {
          cur = inner(cur, value0[i], path + '/' + i)
        }
        return f(cur, slot, path)
      case 'object': 
        for (let p in (value0 as Record<string,Json>)) {
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

/**
 * 
 * @param path 
 * @param fromEnv 
 * @param toEnv 
 * @category Common Variables
 */
export const duplicate = (path:string, fromEnv:Env, toEnv:Env):Env => {
  const epath = internPath(path)
  if (epath.length == 0) {
    // duplicate whole data
    const tree = fromEnv.tree
    const updatePoint = toEnv.trackUpdate ? [] : toEnv.updatePoint
    return {...toEnv, tree, updatePoint}
  }
  const location = init2(epath)
  const name = last(epath)
  const slot0 = rpath(location, fromEnv.tree) as Slot
  const type0 = typeOf(slot0.value)
  if (type0 != 'object' && type0 != 'array') {
    throw new Error('duplicate/1 neither an object nor an array: ' + path)
  }
  if (type0 == 'array') {
    // duplicate an element in an array
    if (typeof name != 'number' || name % 1 !== 0) {
      throw new Error('duplicate/2 invalid index: ' + path)
    }
    if (name < 0 || name >= (slot0.value as Json[]).length) {
      throw new Error('duplicate/3 out of range: ' + path)
    }
    const value1 = slot0.value[name]
    const lis = update(name, value1, slot0.value as Json[])
    const slot = makeSlot(lis)
    const tree = assocPath(location, slot, toEnv.tree)
    const updatePoint = toEnv.trackUpdate ? intersect(toEnv.updatePoint, epath) : toEnv.updatePoint
    return {...toEnv, tree, updatePoint}
  } else {
    // duplicate a property of an object
    if (typeof name != 'string') {
      throw new Error('replace/4 invalid name: ' + path)
    }
    if (!(name in (slot0.value as Record<string,Json>))) {
      throw new Error('replace/5 undefined property: ' + path)
    }
    const value1 = slot0.value[name]
    const rec = {...(slot0.value as Record<string,Json>), [name]:value1}
    const slot = makeSlot(rec)
    const tree = assocPath(location, slot, toEnv.tree)
    const updatePoint = toEnv.trackUpdate ? intersect(toEnv.updatePoint, epath) : toEnv.updatePoint
    return {...toEnv, tree, updatePoint}
  }
}

/**
 * 
 * @function
 * @param {string} name 
 * @param {Object|null} info 
 * @param {Env} env
 * @returns {Env} 
 * @category Common Variables
 */
export const setExtra = (name:string, info:Object|null, env:Env):Env => {
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
 * @function
 * @param {string} name 
 * @param {Env} env
 * @returns {Object|null} 
 * @category Common Variables
 */
export const getExtra = (name:string, env:Env):Object|null => {
  return env.extra[name] || null
}

/**
 * 
 * @function
 * @param {any} ret 
 * @param {any} onPromiseThen
 * @param {Env} env 
 * @returns {Env}
 * @category Common Variables
 */
export const setPortal = (ret:any, onPromiseThen:any, env:Env):Env => {
  if (ret) return {...env, ret, onPromiseThen}
  const {ret:_unused, onPromiseThen:_unused2, ...env2} = env
  return env2
}

/**
 * 
 * @function
 * @param {Env} env
 * @returns {void} 
 * @category Common Variables
 */
export const doReturn = (env:Env):void => {
  if (env.ret) {
    env.ret(env)
  } else {
    throw new Error('doReturn/0: no ret')
  }
}

/**
 * 
 * @function
 * @param {any} x
 * @returns {boolean} 
 * @category Common Variables
 */
export const isEnv = (x:any):boolean => {
  return (x != null 
    && typeof x == "object" 
    && "tree" in x)
}