/**
 * This is the core data store object in Unmagical, and it is an abstract data type.
 * @module core/store
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
import {Json, Schema, Mdr, SchemaDb, Lookup, Validate} from './schema'


/**
 * Store is the abstract data type.
 * @ignore
 */
export type Store = {
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
 * @return {Mdr} 
 */
const makeMdr = (value:Json):Mdr => {
  const rv:Mdr = {value, invalid:false, error:null}
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
 * @param data 
 * @returns Mdr
 */
const wrap = (data):Mdr => {
  const inner = (data:Json):Mdr => {
    switch (typeOf(data)) {
      case 'array': 
        const es = []
        for (let i = 0; i < (data as Json[]).length; i++) {
          es[i] = inner(data[i])
        }
        return makeMdr(es)
      case 'object': 
        const rec = {}
        for (let p in (data as Object)) {
          rec[p] = inner(data[p])
        }
        return makeMdr(rec)
      default: 
        return makeMdr(data)
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
  const root = (tree as Mdr).value
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
 * @en Makes store.
 * @ja storeを作る。
 * @param data
 * - `en` initial data
 * - `ja` 初期データ
 * @param schemaDb
 * - `en` schema database
 * - `ja` スキーマデータベース
 * @param validate
 * - `en` validation function
 * - `ja` バリデーション関数
 * @param trackUpdate
 * - `en` if true, then store is created with update tracking in place.
 * - `ja` trueならstoreはアップデートトラッキングをしている状態で作られます。
 * @returns 
 * - `en` newly created store
 * - `ja` 新しく作成されたstore
 * 
 * @category Entries
 */
export const makeStore = (data:Json, schemaDb:SchemaDb, validate:Validate, trackUpdate:boolean):Store => {
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
 * @param {Store} store0 
 * @param {Store} store1 
 * @returns {boolean}
 * 
 * @category Entries
 */
export const isSame = (store0:Store, store1:Store):boolean => {
  return (store0.tree === store1.tree && store0.extra === store1.extra)
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
 * 
 * @category Entries
 */
export const beginUpdateTracking = (store:Store):Store => {
  // Essentially, `updatePoint' should be set to null, but it can be omitted 
  // because the value when disabled is null.
  return {...store, trackUpdate:true}
}

/**
 * 
 * 
 * @category Entries
 */
export const endUpdateTracking = (store:Store):[string|null, Store] => {
  const updatePoint = store.updatePoint ? externPath(store.updatePoint) : null
  console.log('update occurred at ' + JSON.stringify(updatePoint))
  return [
    updatePoint, 
    {...store, trackUpdate:false, updatePoint:null}
  ]
}

/**
 * 
 * 
 * @category Entries
 */
export const test = (path:string, store:Store):boolean => {
  return hasPath(internPath(path), store.tree)
}

/**
 * Extracts a subtree of Store.
 * 
 * @category Entries
 */
export const extract = (path:string, store:Store):Json => {
  const epath = internPath(path)
  const mdr = rpath(epath, store.tree)
  if (! mdr) {
    throw new Error('extract/1: not found: ' + path)
  }
  return strip(mdr as Json)
}

/**
 * Low-level api.
 * 
 * @category Entries
 */
export const getMdr = (path:string, store:Store):Mdr => {
  const epath = internPath(path)
  const mdr = rpath(epath, store.tree)
  if (! mdr) {
    throw new Error('getMdr/1: not found: ' + path)
  }
  return mdr
}

/**
 * Low-level api. This function executes neither validation nor coercion.
 * 
 * The value of MDR must be a scalar.
 * 
 * @category Entries
 */
export const setMdr = (path:string, mdr:Mdr, store:Store):Store => {
  const epath = internPath(path)
  const mdr0 = rpath(epath, store.tree) as Mdr
  if (! mdr0) {
    throw new Error('setMdr/1: not found: ' + path)
  }
  switch (typeOf(mdr0.value)) {
    case 'null': 
    case 'boolean': 
    case 'number': 
    case 'string': 
    case 'undefined': 
      break
    default: 
      throw new Error('setMdr/2: not a scalar: ' + path)
  }
  const tree = assocPath(epath, mdr, store.tree)
  const updatePoint = store.trackUpdate ? intersect(store.updatePoint, epath) : store.updatePoint
  return {...store, tree, updatePoint}
}

/**
 * Adds value to store. `add' function of JSON patch.
 * 
 * @category Entries
 */
export const add = (path:string, value:Json, store:Store):Store => {
  const epath = internPath(path)
  const location = init2(epath)
  const name = last(epath)
  const mdr0 = rpath(location, store.tree) as Mdr
  const type0 = typeOf(mdr0.value)
  if (type0 != 'object' && type0 != 'array') {
    throw new Error('add/1 neither an object nor an array: ' + path)
  }
  if (type0 == 'array') {
    // insert into array
    const index = (name === '-') ? (mdr0.value as Json[]).length : name
    if (typeof index != 'number' || index % 1 !== 0) {
      throw new Error('add/2 invalid index: ' + path)
    }
    if (index < 0 || index > (mdr0.value as Json[]).length) {
      throw new Error('add/3 index out of range: ' + path)
    }
    const value1 = wrap(value) as Json
    const lis = insert(index, value1, mdr0.value as Json[])
    const mdr = makeMdr(lis)
    const tree = assocPath(location, mdr, store.tree)
    // Insertion to a list is an update not to an item but to the list.
    const updatePoint = store.trackUpdate ? intersect(store.updatePoint, location) : store.updatePoint
    return {...store, tree, updatePoint}
  } else {
    // define or replace into object
    if (typeof name != 'string') {
      throw new Error('add/4 invalid name: ' + path)
    }
    const value1 = wrap(value)
    const rec = {...(mdr0.value as {[prop:string]:Json}), [name]:value1} as Json
    const mdr = makeMdr(rec)
    const tree = assocPath(location, mdr, store.tree)
    // Adding a property is an update to an object, while replacing a property is an update to an property value.
    const updatePoint = !store.trackUpdate ? store.updatePoint 
      : intersect(store.updatePoint, (name in (mdr0.value as Object)) ? epath : location)
    return {...store, tree, updatePoint}
  }
}

/**
 * Removes a value specified by path from store. `remove' function of JSON patch.
 * @function
 * @param {string} path 
 * @param {store} store 
 * @returns {store}
 * @category Entries
 */
export const remove = (path:string, store:Store):Store => {
  const epath = internPath(path)
  const location = init2(epath)
  const name = last(epath)
  const mdr0 = rpath(location, store.tree) as Mdr
  const type0 = typeOf(mdr0.value)
  if (type0 != 'object' && type0 != 'array') {
    throw new Error('remove/1 neither an object nor an array: ' + path)
  }
  if (type0 == 'array') {
    // removes from array
    if (typeof name != 'number' || name % 1 !== 0) {
      throw new Error('remove/2 invalid index: ' + path)
    }
    if (name < 0 || name >= (mdr0.value as Json[]).length) {
      throw new Error('remove/3 out of range: ' + path)
    }
    const lis = rremove(name, 1, mdr0.value as Json[])
    const mdr = makeMdr(lis)
    const tree = assocPath(location, mdr, store.tree)
    const updatePoint = store.trackUpdate ? intersect(store.updatePoint, location) : store.updatePoint
    return {...store, tree, updatePoint}
  } else {
    // delete property from object
    if (! mdr0.value.hasOwnProperty(name)) {
      throw new Error('remove/4: property not found: ' + path)
    }
    const rec = dissoc(name as never, mdr0.value as object)
    const mdr = makeMdr(rec)
    const tree = assocPath(location, mdr, store.tree)
    const updatePoint = store.trackUpdate ? intersect(store.updatePoint, location) : store.updatePoint
    return {...store, tree, updatePoint}
  }
}

/**
 * Replaces a value specified by path into value.  Implements replace function of JSON patch.
 * @function
 * @param {string} path 
 * @param {Json} value 
 * @param {Store} store 
 * @returns {Store}
 * @category Entries
 */
export const replace = (path:string, value:Json, store:Store):Store => {
  const epath = internPath(path)
  if (epath.length == 0) {
    // replace whole data
    const tree = wrap(value) as Json
    const updatePoint = store.trackUpdate ? [] : store.updatePoint
    return {...store, tree, updatePoint}
  }
  const location = init2(epath)
  const name = last(epath)
  const mdr0 = rpath(location, store.tree) as Mdr
  const type0 = typeOf(mdr0.value)
  if (type0 != 'object' && type0 != 'array') {
    throw new Error('replace/1 neither an object nor an array: ' + path)
  }
  if (type0 == 'array') {
    // replace an element in array
    if (typeof name != 'number' || name % 1 !== 0) {
      throw new Error('replace/2 invalid index: ' + path)
    }
    if (name < 0 || name >= (mdr0.value as Json[]).length) {
      throw new Error('replace/3 out of range: ' + path)
    }
    const value1 = wrap(value) as Json
    const lis = update(name, value1, mdr0.value as Json[])
    const mdr = makeMdr(lis)
    const tree = assocPath(location, mdr, store.tree)
    const updatePoint = store.trackUpdate ? intersect(store.updatePoint, epath) : store.updatePoint
    return {...store, tree, updatePoint}
  } else {
    // replace a property of object
    if (typeof name != 'string') {
      throw new Error('replace/4 invalid name: ' + path)
    }
    if (!(name in (mdr0.value as {[prop:string]:Json}))) {
      throw new Error('replace/5 undefined property: ' + path)
    }
    const value1 = wrap(value)
    const rec = {...(mdr0.value as {[prop:string]:Json}), [name]:value1} as {[prop:string]:Json}
    const mdr = makeMdr(rec)
    const tree = assocPath(location, mdr, store.tree)
    const updatePoint = store.trackUpdate ? intersect(store.updatePoint, epath) : store.updatePoint
    return {...store, tree, updatePoint}
  }
}

/**
 * Moves a value located in from, to a location specified by path.  Implements move function of JSON patch.
 * @function
 * @param {string} from 
 * @param {string} path 
 * @param {Store} store
 * @returns {Store} 
 * @category Entries
 */
export const move = (from:string, path:string, store:Store):Store => {
  const value = extract(from, store)
  store = remove(from, store)
  store = add(path, value, store)
  return store
}

/**
 * Copies a value located in from, to a location specified by path.  Impelementing copy function of JSON patch.
 * @function
 * @param {string} from 
 * @param {string} path 
 * @param {Store} store
 * @returns {Store} 
 * @category Entries
 */
export const copy = (from:string, path:string, store:Store):Store => {
  const value = extract(from, store)
  store = add(path, value, store)
  return store
}

/**
 * 
 * @function
 * @param {string} path 
 * @param {Store} store
 * @returns {Store} 
 * @category Entries
 */
export const validate = (path:string, store:Store):Store => {
  let basePath = null

  const lookup = (path:string) => {
    const pathToLookup = appendPath(basePath, path)
    return extract(pathToLookup, store)
  }

  const inner = (mdr0:Mdr, npath:string, path:string):Mdr => {
    const value0 = mdr0.value
    switch (typeOf(value0)) {
      case 'array': 
        const lis = []
        for (let i = 0; i < (value0 as Json[]).length; i++) {
          lis[i] = inner(value0[i], npath + '/*', path + '/' + i)
        }
        basePath = path
        return store.validate(lis, mdr0, store.schemaDb[npath], lookup)
      case 'object': 
        const rec = {}
        for (let p in  (value0 as Record<string,Json>)) {
          rec[p] = inner(value0[p], npath + '/' + p, path + '/' + p)
        }
        basePath = path
        return store.validate(rec, mdr0, store.schemaDb[npath], lookup)
      default: 
        basePath = path
        const mdr = store.validate(value0, mdr0, store.schemaDb[npath], lookup)
        if (mdr.value !== value0) {
          throw new Error('validate/0: value changed: ' + path)
        }
        return mdr
    }
  }

  const epath = internPath(path)
  const mdr0 = rpath(epath, store.tree)
  if (! mdr0) {
    throw new Error('validate/1: not found: ' + path)
  }
  const mdr = inner(mdr0, normalizePath(path), path)
  const tree = assocPath(epath, mdr, store.tree)
  return {...store, tree}
}

/**
 * By f, maps every mdr descending to a location specified by path.
 * @category Entries
 */
export const mapDeep = (f:(mdr:Mdr, path:string) => Mdr, path:string, store:Store):Store => {
  const inner = (mdr0:Mdr, path:string):Mdr => {
    const value0 = mdr0.value
    switch (typeOf(value0)) {
      case 'array': 
        const lis = []
        for (let i = 0; i < (value0 as Json[]).length; i++) {
          lis[i] = inner(value0[i], path + '/' + i)
        }
        return {...f(mdr0, path), value:lis}
      case 'object': 
        const rec = {}
        for (let p in (value0 as Record<string,Json>)) {
          rec[p] = inner(value0[p], path + '/' + p)
        }
        return {...f(mdr0, path), value:rec}
      default: 
        return {...f(mdr0, path), value:value0}
    }
  }
  const epath = internPath(path)
  const mdr0 = rpath(epath, store.tree)
  if (! mdr0) {
    throw new Error('mapDeep/1: not found: ' + path)
  }
  const mdr = inner(mdr0, path)
  const tree = assocPath(epath, mdr, store.tree)
  return {...store, tree}
}

/**
 * By f, deeply reduces a subtree of path.
 * @category Entries
 */
export const reduceDeep = <T>(f:(cur:T, mdr:Mdr, path:string) => T, cur:T, path:string, store:Store):T => {
  const inner = (cur:T, mdr:Mdr, path:string):T => {
    const value0 = mdr.value
    switch (typeOf(value0)) {
      case 'array': 
        for (let i = 0; i < (value0 as Json[]).length; i++) {
          cur = inner(cur, value0[i], path + '/' + i)
        }
        return f(cur, mdr, path)
      case 'object': 
        for (let p in (value0 as Record<string,Json>)) {
          cur = inner(cur, value0[p], path + '/' + p)
        }
        return f(cur, mdr, path)
      default: 
        return f(cur, mdr, path)
    }
  }
  const epath = internPath(path)
  const mdr = rpath(epath, store.tree)
  if (! mdr) {
    throw new Error('reduceDeep/1: not found: ' + path)
  }
  return inner(cur, mdr, path)
}

/**
 * 
 * @param path 
 * @param fromStore 
 * @param toStore 
 * @category Entries
 */
export const duplicate = (path:string, fromStore:Store, toStore:Store):Store => {
  const epath = internPath(path)
  if (epath.length == 0) {
    // duplicate whole data
    const tree = fromStore.tree
    const updatePoint = toStore.trackUpdate ? [] : toStore.updatePoint
    return {...toStore, tree, updatePoint}
  }
  const location = init2(epath)
  const name = last(epath)
  const mdr0 = rpath(location, fromStore.tree) as Mdr
  const type0 = typeOf(mdr0.value)
  if (type0 != 'object' && type0 != 'array') {
    throw new Error('duplicate/1 neither an object nor an array: ' + path)
  }
  if (type0 == 'array') {
    // duplicate an element in an array
    if (typeof name != 'number' || name % 1 !== 0) {
      throw new Error('duplicate/2 invalid index: ' + path)
    }
    if (name < 0 || name >= (mdr0.value as Json[]).length) {
      throw new Error('duplicate/3 out of range: ' + path)
    }
    const value1 = mdr0.value[name]
    const lis = update(name, value1, mdr0.value as Json[])
    const mdr = makeMdr(lis)
    const tree = assocPath(location, mdr, toStore.tree)
    const updatePoint = toStore.trackUpdate ? intersect(toStore.updatePoint, epath) : toStore.updatePoint
    return {...toStore, tree, updatePoint}
  } else {
    // duplicate a property of an object
    if (typeof name != 'string') {
      throw new Error('replace/4 invalid name: ' + path)
    }
    if (!(name in (mdr0.value as Record<string,Json>))) {
      throw new Error('replace/5 undefined property: ' + path)
    }
    const value1 = mdr0.value[name]
    const rec = {...(mdr0.value as Record<string,Json>), [name]:value1}
    const mdr = makeMdr(rec)
    const tree = assocPath(location, mdr, toStore.tree)
    const updatePoint = toStore.trackUpdate ? intersect(toStore.updatePoint, epath) : toStore.updatePoint
    return {...toStore, tree, updatePoint}
  }
}

/**
 * 
 * @function
 * @param {string} name 
 * @param {Object|null} info 
 * @param {Store} store
 * @returns {Store} 
 * @category Entries
 */
export const setExtra = (name:string, info:Object|null, store:Store):Store => {
  if (info === null) {
    const {[name]:_unused, ...extra} = store.extra
    return {...store, extra}
  } else {
    const extra = {...store.extra, [name]:info}
    return {...store, extra}
  }
}

/**
 * 
 * @function
 * @param {string} name 
 * @param {Store} store
 * @returns {Object|null} 
 * @category Entries
 */
export const getExtra = (name:string, store:Store):Object|null => {
  return store.extra[name] || null
}

/**
 * 
 * @function
 * @param {any} ret 
 * @param {any} onPromiseThen
 * @param {Store} store 
 * @returns {Store}
 * @category Entries
 */
export const setPortal = (ret:any, onPromiseThen:any, store:Store):Store => {
  if (ret) return {...store, ret, onPromiseThen}
  const {ret:_unused, onPromiseThen:_unused2, ...store2} = store
  return store2
}

/**
 * 
 * @function
 * @param {Store} store
 * @returns {void} 
 * @category Entries
 */
export const doReturn = (store:Store):void => {
  if (store.ret) {
    store.ret(store)
  } else {
    throw new Error('doReturn/0: no ret')
  }
}

/**
 * 
 * @function
 * @param {any} x
 * @returns {boolean} 
 * @category Entries
 */
export const isStore = (x:any):boolean => {
  return (x != null 
    && typeof x == "object" 
    && "tree" in x)
}