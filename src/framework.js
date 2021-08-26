
import * as E from './env'
import * as S from './schema'
import {app, h} from 'hyperapp'

const buildSchemaDb = (schema) => {
  const db = {}
  const inner = (schema, path) => {
    db[path] = schema
    switch (schema.type) {
      case 'record': 
      case 'record?': 
        for (let p in schema.fields) {
          inner(schema.fields[p], path + '/' + p)
        }
        break
      case 'list': 
      case 'list?': 
        inner(schema.items, path + '/*')
        break
      default: 
        break
    }
  }
  inner(schema, "")
  return db
}

const normPath = (path) => {
  let frag = path.split('/')
  for (let i = 0; i < frag.length; i++) {
    const n = +frag[i]
    if ("" + n === frag[i]) {
      frag[i] = '*'
    }
  }
  return frag.join('/')
}

const renderTable = {}

export const addComponent = (name, f) => {
  renderTable[name] = f
}

const isComponent = (tag) => {
  const code = tag.charCodeAt(0)
  const a = 'A'.charCodeAt(0)
  const z = 'Z'.charCodeAt(0)
  return (a <= code && code <= z)
}

export const render = (view, env, actions, state) => {
  //console.log('render', view, env)
  if (Array.isArray(view)) {
    if (isComponent(view[0])) {
      return renderTable[view[0]](view, env, actions, state)
    } else {
      return (
        h(
          view[0], 
          view[1], 
          view.slice(2).map(v => render(v, env, actions, state))
        )
      )
    }
  } else {
    return view
  }
}

export const start = (data, schema, evolve, view, el) => {
  console.log('start/0', data, schema, view)
  const customActions = {
    Add: (i, props, baseEnv) => {
      const path = props[`action${i}path`]
      const tplName = props[`action${i}data`]
      baseEnv = E.add(path, data[tplName], validate, baseEnv)
      return baseEnv
    }, 
    Remove: (i, props, baseEnv) => {
      const path = props[`action${i}path`]
      baseEnv = E.remove(path, validate, baseEnv)
      return baseEnv
    }
  }
  const actions0 = {
    onTextInput: (ev) => (state, actions) => {
      const path = ev.currentTarget.dataset.path
      let baseEnv = E.setm(path, 'input', ev.currentTarget.value, state.baseEnv)
      let env = E.setm(path, 'input', ev.currentTarget.value, state.env)
      return {...state, baseEnv, env}
    }, 
    onTextBlur: (ev) => (state, actions) => {
      const path = ev.currentTarget.dataset.path
      const npath = normPath(path)
      const slot0 = {touched:true, input:ev.currentTarget.value}
      const slot = S.coerce(slot0, schemaDb[npath])
      let baseEnv = E.sets(path, slot, state.baseEnv)
      let env = evolve(baseEnv, validate, E)
      env = E.goTo("", env)
      return {...state, env, baseEnv}
    }, 
    onSelectionChange: (ev) => (state, actions) => {
      const path = ev.currentTarget.dataset.path
      const npath = normPath(path)
      const slot0 = {touched:true, input:ev.currentTarget.value}
      const slot = S.coerce(slot0, schemaDb[npath])
      let baseEnv = E.sets(path, slot, state.baseEnv)
      let env = evolve(baseEnv, validate, E)
      env = E.goTo("", env)
      return {...state, env, baseEnv}
    }, 
    onToggleChange: (ev) => (state, actions) => {
      const path = ev.currentTarget.dataset.path
      const npath = normPath(path)
      const slot0 = {touched:true, input:ev.currentTarget.checked ? "true" : "false"}
      const slot = S.coerce(slot0, schemaDb[npath])
      let baseEnv = E.sets(path, slot, state.baseEnv)
      let env = evolve(baseEnv, validate, E)
      env = E.goTo("", env)
      return {...state, env, baseEnv}
    }, 
    onExecute: (ev) => (state, actions) => {
      const dataset = ev.currentTarget.dataset
      const length = +dataset['actionlength']
      let baseEnv = state.baseEnv
      for (let i = 0; i < length; i++) {
        baseEnv = customActions[dataset[`action${i}name`]](i, dataset, baseEnv)
      }
      let env = evolve(baseEnv, validate, E)
      env = E.goTo("", env)
      return {...state, env, baseEnv}
    }
    // TODO implement
  }

  const schemaDb = buildSchemaDb(schema)
  const validate = (value, path) => {
    return S.validate(value, schemaDb[path])
  }

  let baseEnv = E.fromJson(data.initial, validate)
  baseEnv = E.goTo("", baseEnv)
  let env = evolve(baseEnv, validate, E)
  env = E.goTo("", env)
  
  const render0 = (state, actions) => {
    console.log('render0', state.env)
    return render(view, state.env, actions, state)
  }
  const state = {
    baseEnv, 
    env
    // TODO internal state
  }
  const actions = app(state, actions0, render0, el)
  return actions
}