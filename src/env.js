
import * as R from 'ramda'

const append2 = (name1, name2, list) => {
  return R.append(name2, R.append(name1, list))
}

const init2 = (list) => {
  return R.init(R.init(list))
}

// see: https://github.com/ramda/ramda/pull/2841
// Anyway, here we fix the original behavior.
const hasPath = (path, x) => {
  if (! path.length) return true
  return R.hasPath(path, x)
}

const last2 = (list) => {
  return list[list.length - 2]
}

const typeFrag = (str) => {
  if (typeof str == 'number') return str
  const n = +str
  return (n + "" === str) ? n : str
}

const normPath = (frags) => {
  let rv = ""
  for (let i = 0; i < frags.length; i++) {
    if (frags[i] == '@value') {
      rv += '/'
    } else if (typeof frags[i] == 'number' || frags[i] == '-') {
      rv += '*'
    } else {
      rv += frags[i]
    }
  }
  return rv
}

const wrap = (json, path, validate) => {
  switch (json === null ? 'null' : Array.isArray(json) ? 'array' : typeof json) {
    case 'array': 
      const es = []
      const path2 = path + '/*'
      for (let i = 0; i < json.length; i++) {
        es[i] = wrap(json[i], path2, validate)
      }
      return validate(es, path)
    case 'object': 
      const rec = {}
      for (let p in json) {
        rec[p] = wrap(json[p], path + '/' + p, validate)
      }
      return validate(rec, path)
    default: 
      return validate(json, path)
  }
}

const strip = (data) => {
  const root = data['@value']
  switch (root === null ? 'null' : Array.isArray(root) ? 'array' : typeof root) {
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

export const fromJson = (json, validate) => {
  return {
    data: wrap(json, "", validate), 
    path: []
  }
}

export const toJson = (env) => {
  return strip(env.data)
}

export const path = (env) => {
  let rv = ""
  for (let i = 0; i < env.path.length; i++) {
    if (env.path[i] == '@value') {
      rv += "/"
    } else {
      rv += env.path[i]
    }
  }
  return rv
}

export const basename = (env) => {
  if (! R.length(env.path)) {
    throw new Error('basename/1: on root location')
  }
  return R.last(env.path)
}

/**
 * 
 * @param {index[]} base internal representation of path
 * @param {string} path absolute or relative JSON pointer
 */
const compose = (base, path) => {
  if (path === '0') {
    // common easy case first
    return base
  }
  let frag0 = R.split('/', path)
  let frag = []
  if (path.length > 0 && path[0] != '/') {
    // relative
    const upcount = +frag0[0]
    frag = base
    for (let i = 0; i < upcount; i++) {
      if (! R.length(frag)) {
        throw new Error('compose/1: no parent location')
      }
      frag = init2(frag)
    }
  }

  frag0 = R.tail(frag0)
  for (let i = 0; i < frag0.length; i++) {
    frag = append2('@value', typeFrag(frag0[i]), frag)
  }
  return frag
}

export const makePath = (path, env) => {
  const epath = compose(env.path, path)
  //if (! hasPath(epath, env.data)) {
  //  throw new Error('makePath/1: not found: ' + path)
  //}
  let rv = ""
  for (let i = 0; i < epath.length; i++) {
    if (epath[i] == '@value') {
      rv += "/"
    } else {
      rv += epath[i]
    }
  }
  return rv
}

export const goTo = (path, env) => {
  const epath = compose(env.path, path)
  if (! hasPath(epath, env.data)) {
    throw new Error('goTo/1: not found: ' + path)
  }
  return {...env, path:epath}
}

export const getm = (path, meta, value, env) => {
  const epath = compose(env.path, path)
  const slot = R.path(epath, env.data)
  if (! slot) {
    throw new Error('getm/1: not found: ' + path)
  }
  return slot.hasOwnProperty(meta) ? slot[meta] : value
}

export const gets = (path, env) => {
  const epath = compose(env.path, path)
  const slot = R.path(epath, env.data)
  if (! slot) {
    throw new Error('gets/1: not found: ' + path)
  }
  return slot
}

export const setm = (path, meta, value, env) => {
  const epath = compose(env.path, path)
  const slot0 = R.path(epath, env.data)
  if (! slot0) {
    throw new Error('setm/1: not found: ' + path)
  }
  const slot = {...slot0, [meta]:value}
  const data = R.assocPath(epath, slot, env.data)
  return {...env, data}
}

export const sets = (path, slot, env) => {
  const epath = compose(env.path, path)
  if (! hasPath(epath, env.data)) {
    throw new Error('sets/1: not found: ' + path)
  }
  const data = R.assocPath(epath, slot, env.data)
  return {...env, data}
}

export const lookup = (path, env) => {
  const epath = compose(env.path, path)
  const slot = R.path(epath, env.data)
  if (! slot) {
    throw new Error('lookup/1: not found: ' + path)
  }
  return strip(slot)
}

export const length = (path, env) => {
  const epath = compose(env.path, path)
  const slot = R.path(epath, env.data)
  if (! slot) {
    throw new Error('length/1: not found: ' + path)
  }
  if (! Array.isArray(slot['@value'])) {
    throw new Error('length/2: not a list: ' + path)
  }
  return slot['@value'].length
}

// totally replace the value of the path.
// metas are generated by validation
export const replace = (path, value, env) => {
  // TODO implement
  throw new Error('implement!')
}

// generates new metas
export const add = (path, value, validate, env) => {
  const epath = compose(env.path, path)
  const location = init2(epath)
  const name = R.last(epath)
  const slot0 = R.path(location, env.data)
  if (typeof slot0['@value'] != 'object') {
    throw new Error('add/1 neither a record nor a list: ' + path)
  }
  if (Array.isArray(slot0['@value'])) {
    // insert into list
    const index = (name === '-') ? slot0['@value'].length : name
    if (typeof index != 'number' || index % 1 !== 0) {
      throw new Error('add/2 invalid index: ' + path)
    }
    if (index < 0 || index > slot0['@value'].length) {
      throw new Error('add/3 out of range: ' + path)
    }
    const lis = R.insert(index, wrap(value, normPath(epath), validate), slot0['@value'])
    const slot = validate(lis, normPath(location))
    const data = R.assocPath(location, slot, env.data)
    return {...env, data}
  } else {
    // define or set into record
    if (typeof name != 'string') {
      throw new Error('add/4 invalid name: ' + path)
    }
    const value1 = wrap(value, normPath(epath), validate)
    const rec = {...slot0['@value'], [name]:value1}
    const slot = validate(rec, normPath(location))
    const data = R.assocPath(location, slot, env.data)
    return {...env, data}
  }
}

export const remove = (path, validate, env) => {
  const epath = compose(env.path, path)
  const location = init2(epath)
  const name = R.last(epath)
  const slot0 = R.path(location, env.data)
  if (typeof slot0['@value'] != 'object' || slot0['@value'] === null) {
    throw new Error('remove/1 neither a record nor a list: ' + path)
  }
  if (Array.isArray(slot0['@value'])) {
    // remove from list
    if (typeof name != 'number' || name % 1 !== 0) {
      throw new Error('remove/2 invalid index: ' + path)
    }
    if (name < 0 || name >= slot0['@value'].length) {
      throw new Error('remove/3 out of range: ' + path)
    }
    const lis = R.remove(name, 1, slot0['@value'])
    const slot = validate(lis, normPath(location))
    const data = R.assocPath(location, slot, env.data)
    return {...env, data}
  } else {
    // undefine from record
    if (! slot0['@value'].hasOwnProperty(name)) {
      throw new Error('remove/4: property not found: ' + path)
    }
    const rec = R.dissoc(name, slot0['@value'])
    const slot = validate(rec, normPath(location))
    const data = R.assocPath(location, slot, env.data)
    return {...env, data}
  }
}

export const move = (from, path, env) => {
  // TODO implement
  throw new Error('impelement!')
}

export const copy = (from, path, env) => {
  // TODO implement
  throw new Error('impelement!')
}