
import * as R from 'ramda'

const typeOf = (x) => x === null ? 'null' : Array.isArray(x) ? 'array' : typeof x

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

const showPath = (frags) => {
  let rv = ""
  for (let i = 0; i < frags.length; i++) {
    if (frags[i] == '@value') {
      rv += "/"
    } else {
      rv += frags[i]
    }
  }
  return rv
}

const wrap = (json, serial, path, validate) => {
  const inner = (json, path) => {
    switch (typeOf(json)) {
      case 'array': 
        const es = []
        const path2 = path + '/*'
        for (let i = 0; i < json.length; i++) {
          es[i] = inner(json[i], path2)
        }
        const xa = validate(es, path)
        xa.key = serial++
        return xa
      case 'object': 
        const rec = {}
        for (let p in json) {
          rec[p] = inner(json[p], path + '/' + p)
        }
        const xo = validate(rec, path)
        xo.key = serial++
        return xo
      default: 
        const xs = validate(json, path)
        xs.key = serial++
        return xs
    }
  }
  return [inner(json, path), serial]
}

const strip = (data) => {
  const root = data['@value']
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

export const fromJson = (json, validate) => {
  const [data, serial] = wrap(json, 1, "", validate)
  return {
    data, 
    path: [], 
    serial
  }
}

export const toJson = (env) => {
  return strip(env.data)
}

export const path = (env) => {
  return showPath(env.path)
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
  // We don't care about the existence of the epath location.
  return showPath(epath)
}

export const goTo = (path, env) => {
  const epath = compose(env.path, path)
  if (! hasPath(epath, env.data)) {
    throw new Error('goTo/1: not found: ' + path)
  }
  return {...env, path:epath}
}

export const test = (path, env) => {
  const epath = compose(env.path, path)
  return hasPath(epath, env.data)
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
  const slot0 = R.path(epath, env.data)
  if (! slot0) {
    throw new Error('sets/1: not found: ' + path)
  }
  slot.key = slot0.key
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
    const [value1, serial] = wrap(value, env.serial, normPath(epath), validate)
    const lis = R.insert(index, value1, slot0['@value'])
    const slot = validate(lis, normPath(location))
    slot.key = slot0.key
    const data = R.assocPath(location, slot, env.data)
    return {...env, data, serial}
  } else {
    // define or set into record
    if (typeof name != 'string') {
      throw new Error('add/4 invalid name: ' + path)
    }
    const [value1, serial] = wrap(value, env.serial, normPath(epath), validate)
    const rec = {...slot0['@value'], [name]:value1}
    const slot = validate(rec, normPath(location))
    slot.key = slot0.key
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
    slot.key = slot0.key
    const data = R.assocPath(location, slot, env.data)
    return {...env, data}
  } else {
    // undefine from record
    if (! slot0['@value'].hasOwnProperty(name)) {
      throw new Error('remove/4: property not found: ' + path)
    }
    const rec = R.dissoc(name, slot0['@value'])
    const slot = validate(rec, normPath(location))
    slot.key = slot0.key
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

export const mapMeta = (f, path, env) => {
  const inner = (slot0, path) => {
    const value0 = slot0['@value']
    switch (typeOf(value0)) {
      case 'array': 
        const lis = []
        for (let i = 0; i < value0.length; i++) {
          lis[0] = inner(value0[i], path + '/' + i)
        }
        return {...f(slot0, path), '@value':lis, key:slot0.key}
      case 'object': 
        const rec = {}
        for (let p in value0) {
          rec[p] = inner(value0[p], path + '/' + p)
        }
        return {...f(slot0, path), '@value':rec, key:slot0.key}
      default: 
        return {...f(slot0, path), '@value':value0, key:slot0.key}
    }
  }
  const epath = compose(env.path, path)
  const slot0 = R.path(epath, env.data)
  if (! slot0) {
    throw new Error('mapMeta/1: not found: ' + path)
  }
  const slot = inner(slot0, showPath(epath))
  const data = R.assocPath(epath, slot, env.data)
  return {...env, data}
}

export const reduce = (f, cur, path, env) => {
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
  const epath = compose(env.path, path)
  const slot = R.path(epath, env.data)
  if (! slot) {
    throw new Error('mapMeta/1: not found: ' + path)
  }
  return inner(cur, slot, showPath(epath))
}