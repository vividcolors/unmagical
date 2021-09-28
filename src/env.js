//@ts-check

import {normalizePath, typeOf, isIntStr, normalizePathArray} from './utils'
import {hasPath as rhasPath, init, path as rpath, assocPath, insert, last, dissoc, remove as rremove, update } from 'ramda'

/**
 * 
 * @typedef {import("./schema").Json} Json
 * @typedef {import("./schema").Schema} Schema
 * @typedef {import("./schema").Slot} Slot
 * @typedef {import("./schema").SchemaDb} SchemaDb
 * @typedef {{
 *   tree: Json, 
 *   schemaDb: SchemaDb, 
 *   validate: (value:any, schema:Schema) => Slot
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
 * @param {Json} data 
 * @param {string} path 
 * @param {SchemaDb} schemaDb 
 * @param {(value:any, schema:Schema) => Slot} validate 
 * @returns {Slot}
 */
const wrap = (data, path, schemaDb, validate) => {
  /** @type {(data:Json, path:string) => Slot} */
  const inner = (data, path) => {
    switch (typeOf(data)) {
      case 'array': 
        const es = []
        const path2 = path + '/*'
        for (let i = 0; i < /** @type {Json[]} */ (data).length; i++) {
          es[i] = inner(data[i], path2)
        }
        const xa = validate(es, schemaDb[path])
        return xa
      case 'object': 
        const rec = {}
        for (let p in /** @type {{[name:string]:Json}} */ (data)) {
          rec[p] = inner(data[p], path + '/' + p)
        }
        const xo = validate(rec, schemaDb[path])
        return xo
      default: 
        const xs = validate(data, schemaDb[path])
        return xs
    }
  }
  return inner(data, path)
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
 * @param {(value:any, schema:Schema) => Slot} validate
 * @returns {Env}
 */
export const makeEnv = (data, schemaDb, validate) => {
  const tree = wrap(data, "", schemaDb, validate)
  return {
    tree, 
    schemaDb, 
    validate
  }
}

/**
 * Internalizes a path
 * @param {string} path 
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
 * @param {string} path 
 * @param {Env} env 
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
 */
export const setSlot = (path, slot, env) => {
  const epath = /** @type {string[]} */ (internPath(path))
  const slot0 = rpath(epath, env.tree)
  if (! slot) {
    throw new Error('setSlot/1: not found: ' + path)
  }
  const tree = assocPath(epath, slot, env.tree)
  return {...env, tree}
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
    const value1 = wrap(value, normalizePath(path), env.schemaDb, env.validate)
    const lis = insert(index, value1, slot0['@value'])
    const slot = env.validate(lis, env.schemaDb[normalizePathArray(location)])
    const tree = assocPath(location, slot, env.tree)
    return {...env, tree}
  } else {
    // define or replace into object
    if (typeof name != 'string') {
      throw new Error('add/4 invalid name: ' + path)
    }
    const value1 = wrap(value, normalizePath(path), env.schemaDb, env.validate)
    const rec = {...slot0['@value'], [name]:value1}
    const slot = env.validate(rec, env.schemaDb[normalizePathArray(location)])
    const tree = assocPath(location, slot, env.tree)
    return {...env, tree}
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
    const slot = env.validate(lis, env.schemaDb[normalizePathArray(location)])
    const tree = assocPath(location, slot, env.tree)
    return {...env, tree}
  } else {
    // delete property from object
    if (! slot0['@value'].hasOwnProperty(name)) {
      throw new Error('remove/4: property not found: ' + path)
    }
    const rec = dissoc(name, slot0['@value'])
    const slot = env.validate(rec, env.schemaDb[normalizePathArray(location)])
    const tree = assocPath(location, slot, env.tree)
    return {...env, tree}
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
    const value1 = wrap(value, normalizePath(path), env.schemaDb, env.validate)
    const lis = update(name, value1, slot0['@value'])
    const slot = env.validate(lis, env.schemaDb[normalizePathArray(location)])
    const tree = assocPath(location, slot, env.tree)
    return {...env, tree}
  } else {
    // replace a property of object
    if (typeof name != 'string') {
      throw new Error('replace/4 invalid name: ' + path)
    }
    const value1 = wrap(value, normalizePath(path), env.schemaDb, env.validate)
    const rec = {...slot0['@value'], [name]:value1}
    const slot = env.validate(rec, env.schemaDb[normalizePathArray(location)])
    const tree = assocPath(location, slot, env.tree)
    return {...env, tree}
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
