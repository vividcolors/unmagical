
import * as E from './env'
import * as S from './schema'
import {evalXpath} from './filters'
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
  console.log('render', view)
  if (Array.isArray(view)) {
    if (isComponent(view[0])) {
      return renderTable[view[0]](view, env, actions, state)
    } else {
      let props = view[1]
      if (view[1].hasOwnProperty('showIf')) {
        const shown = evalXpath(view[1].showIf, env)
        console.log('showIf', view[1].showIf, shown)
        if (! shown) return null
        props = {...view[1]}
        delete props.showIf
      }
      return (
        h(
          view[0], 
          props, 
          view.slice(2).map(v => render(v, env, actions, state))
        )
      )
    }
  } else {
    return view
  }
}

export const start = (data, schema, hooks, view, el) => {
  //console.log('start/0', data, schema, view)
  console.log('start', E)
  const API = {
    ...E, 
    validate: (value, path) => {
      return S.validate(value, schemaDb[path])
    }, 
    touchAll: (path, env) => {
      return E.mapMeta((slot, _path) => ({...slot, touched:true}), path, env)
    }, 
    countValidationErrors: (path, env) => {
      return E.reduce((cur, slot, _path) => {
        return (!slot.disabled && slot.touched && slot.invalid) ? (cur + 1) : cur
      }, 0, path, env)
    }, 
    validationErrors: (path, env) => {
      let errors = []
      E.reduce((cur, slot, path) => {
        if (!slot.disabled && slot.touched && slot.invalid) {
          errors.push(path)
        }
        return null
      }, null, path, env)
      return errors
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
      let env = hooks.evolve(baseEnv, API)
      env = E.goTo("", env)
      return {...state, env, baseEnv}
    }, 
    onSelectionChange: (ev) => (state, actions) => {
      const path = ev.currentTarget.dataset.path
      const npath = normPath(path)
      const slot0 = {touched:true, input:ev.currentTarget.value}
      const slot = S.coerce(slot0, schemaDb[npath])
      let baseEnv = E.sets(path, slot, state.baseEnv)
      let env = hooks.evolve(baseEnv, API)
      env = E.goTo("", env)
      return {...state, env, baseEnv}
    }, 
    onToggleChange: (ev) => (state, actions) => {
      const path = ev.currentTarget.dataset.path
      const npath = normPath(path)
      const slot0 = {touched:true, input:ev.currentTarget.checked ? "true" : "false"}
      const slot = S.coerce(slot0, schemaDb[npath])
      let baseEnv = E.sets(path, slot, state.baseEnv)
      let env = hooks.evolve(baseEnv, API)
      env = E.goTo("", env)
      return {...state, env, baseEnv}
    }, 
    onCallHook: (ev) => (state, actions) => {
      const hook = ev.currentTarget.dataset.hook
      const effect = ev.currentTarget.dataset.effect
      const path = ev.currentTarget.dataset.path
      let baseEnv = state.baseEnv
      if (hook) baseEnv = hooks[hook](baseEnv, path, API)
      let env = hooks.evolve(baseEnv, API)
      env = E.goTo("", env)
      if (effect) env = hooks[effect](env, path, API)
      env = E.goTo("", env)
      return {...state, env, baseEnv}
    }
    // TODO implement
  }

  const schemaDb = buildSchemaDb(schema)

  let baseEnv = E.fromJson(data, API.validate)
  console.log('start/2', baseEnv)
  let env = hooks.evolve(baseEnv, API)
  env = E.goTo("", env)
  
  const render0 = (state, actions) => {
    console.log('render0', state.env)
    const vdom = render(view, state.env, actions, state)
    console.log('render0/1', vdom)
    return vdom
  }
  const state = {
    baseEnv, 
    env
    // TODO internal state
  }
  const actions = app(state, actions0, render0, el)
  return actions
}

export {evalXpath}