
import { normalizePath } from './utils'
import * as E from './env'
import * as S from './schema'
import { app, h as h0 } from 'hyperapp'

/**
 * 
 * @typedef {import("./schema").Json} Json
 * @typedef {import("./schema").Schema} Schema
 * @typedef {import("./schema").Slot} Slot
 * @typedef {import("./schema").SchemaDb} SchemaDb
 * @typedef {import("./env").Env} Env
 */


 /**
  * @namespace
  */
export const API = {
  // re-export from env
  test: E.test, 
  extract: E.extract, 
  getSlot: E.getSlot, 
  setSlot: E.setSlot, 
  add: E.add, 
  remove: E.remove, 
  replace: E.replace, 
  move: E.move, 
  copy: E.copy, 
  mapDeep: E.mapDeep, 
  reduceDeep: E.reduceDeep, 
  getExtra: E.getExtra, 

  /**
   * 
   * @param {string} path 
   * @param {Env} env
   * @returns {Env} 
   */
  touchAll: (path, env) => {
    return E.mapDeep((slot, _path) => ({...slot, touched:true}), path, env)
  }, 

  /**
   * 
   * @param {string} path 
   * @param {Env} env
   * @returns {Env} 
   */
  countValidationErrors: (path, env) => {
    return E.reduceDeep((cur, slot, _path) => {
      const d = slot.touched && slot.invalid ? 1 : 0
      return cur + d
    }, 0, path, env)
  }, 

  /**
   * 
   * @param {string} path 
   * @param {Env} env
   * @returns {string[]} 
   */
  validationErrors: (path, env) => {
    const errors = []
    E.reduceDeep((_cur, slot, path) => {
      if (slot.touched && slot.invalid) {
        errors.push(path)
      }
      return null
    }, null, path, env)
    return errors
  }, 

  /**
   * @param {string} name
   * @param {string} message
   * @param {Env} env
   * @returns {Promise}
   */
  openDialog: (name, message, env) => {
    const p = new Promise((fulfill, reject) => {
      env = E.setExtra(name, {message, fulfill, reject}, env)
    })
    E.doReturn(env)
    return p
  }, 

  closeDialog: (name, env) => {
    return E.setExtra(name, null, env)
  }, 

  getDialog: (name, env) => {
    const extra = E.getExtra(name, env)
    if (! extra) return null
    return extra.message
  }, 

  setPage: (name, current, env) => {
    return E.setExtra(name, current, env)
  }, 

  getPage: (name, env) => {
    const extra = E.getExtra(name, env)
    return (extra !== null) ? extra : 0
  }, 

  nextPage: (name, env) => {
    const extra = E.getExtra(name, env)
    const current = (extra !== null) ? extra : 0
    return E.setExtra(name, current + 1, env)
  }, 

  prevPage: (name, env) => {
    const extra = E.getExtra(name, env)
    const current = (extra !== null) ? extra : 0
    return E.setExtra(name, current - 1, env)
  }, 

  setSwitch: (name, shown, env) => {
    return E.setExtra(name, shown, env)
  }, 

  getSwitch: (name, env) => {
    const extra = E.getExtra(name, env)
    return (extra !== null) ? extra : false
  }, 

  toggleSwitch: (name, env) => {
    const extra = E.getExtra(name, env)
    const current = (extra !== null) ? extra : false
    return E.setExtra(name, !current, env)
  }, 

  /**
   * TODO: progress bar, ReadStream, ...
   */
  openProgress: (name, unknown, env) => {
    return E.setExtra(name, {current:-1}, env)
  }, 

  closeProgress: (name, env) => {
    return E.setExtra(name, null, env)
  }, 

  getProgress: (name, env) => {
    const extra = E.getExtra(name, env)
    if (! extra) return null
    return extra.current
  }, 

  withEnv: (env, p) => {
    E.doReturn(env)
    return p
  }, 

  wrap: (handler) => {
    return (result) => {
      let result1 = null
      const ret = (res1) => {result1 = res1}
      actions.onThen({result, handler, ret})
      return result1
    }
  }, 

  /**
   * 
   * @param {Object} context
   * @param {string} context.path
   * @param {string} context.errorSelector
   * @param {string} context.url
   * @param {string} context.method
   * @param {string} context.successMessage
   * @param {string} context.failureMessage
   */
  submit: (context, env) => {
    env = API.touchAll(context.path, env)
    const numErrors = API.countValidationErrors(context.path, env)
    if (numErrors) {
      window.setTimeout(() => {
        const targetEl = document.querySelector(context.errorSelector)
        if (targetEl) targetEl.scrollIntoView()
      }, 100)
      return env
    } else {
      const options = {
        method: context.method, 
        mode: 'cors', 
        body: JSON.stringify(E.extract(context.path, env)), 
        header: {
          'Content-Type': 'application/json'
        }
      }
      env = API.openProgress('loading', null, env)
      return API.withEnv(env, 
        fetch(context.url, options)
        .catch(API.wrap(([response, env]) => {
          console.error('form submission failed', response)
          return {ok:true}
        }))
        .then(API.wrap(([response, env]) => {
          env = API.closeProgress('loading', env)
          if (response.ok) {
            return API.openDialog('feedback', context.successMessage, env)
            .then(API.wrap(([result, env]) => {
              return API.closeDialog('feedback', env)
            }))
          } else {
            return API.openDialog('alert', context.failureMessage, env)
            .then(API.wrap(([result, env]) => {
              return API.closeDialog('alert', env)
            }))
          }
        }))
      )
    }
  }
}

/**
 * @type {Object|null}
 */
let actions = null

/**
 * @param {Object} params
 * @param {Json} params.data
 * @param {Schema} params.schema
 * @param {(any, any) => any} params.view
 * @param {Element} params.containerEl
 * @param {((string, Env) => Env) | null} params.evolve
 * @param {{[name:string]:(any)}} params.updates
 * @param {((value:any, schema:Schema) => Slot) | null} params.validate
 * @param {((slot:Slot, schema:Schema) => Slot) | null} params.coerce
 */
export const start = (
    {
      data, 
      schema, 
      view, 
      containerEl, 
      evolve = null, 
      updates = {}, 
      validate = null, 
      coerce = null
    }) => {
  // complements reasonable defaults
  if (! evolve) evolve = (_path, env) => env
  if (! validate) validate = S.validate(S.defaultRules, S.defaultMessages)
  if (! coerce) coerce = S.coerce(S.defaultRules, S.defaultMessages)

  const schemaDb = S.buildDb(schema)

  const actions0 = {
    onTextInput: (ev) => (state, actions) => {
      const path = ev.currentTarget.dataset.mgPath
      const slot0 = E.getSlot(path, state.baseEnv)
      const slot = {...slot0, input:ev.currentTarget.value}
      const baseEnv = E.setSlot(path, slot, state.baseEnv)
      const slotb0 = E.getSlot(path, state.env)
      const slotb = {...slotb0, input:ev.currentTarget.value}
      const env = E.setSlot(path, slotb, state.env)
      return {...state, baseEnv, env}
    }, 
    onTextBlur: (ev) => (state, actions) => {
      const path = ev.currentTarget.dataset.mgPath
      const npath = normalizePath(path)
      const slot0 = {touched:true, input:ev.currentTarget.value}
      const slot = coerce(slot0, schemaDb[npath])
      let baseEnv = E.setSlot(path, slot, state.baseEnv)
      let env = evolve(path, baseEnv)
      return {...state, baseEnv, env}
    }, 
    onSelectChange: (ev) => (state, actions) => {
      const path = ev.currentTarget.dataset.mgPath
      const npath = normalizePath(path)
      const slot0 = {touched:true, input:ev.currentTarget.value}
      const slot = coerce(slot0, schemaDb[npath])
      let baseEnv = E.setSlot(path, slot, state.baseEnv)
      let env = evolve(path, baseEnv)
      return {...state, baseEnv, env}
    }, 
    onToggleChange: (ev) => (state, actions) => {
      const path = ev.currentTarget.dataset.mgPath
      const npath = normalizePath(path)
      const slot0 = {touched:true, input:ev.currentTarget.checked ? "true" : "false"}
      const slot = coerce(slot0, schemaDb[npath])
      let baseEnv = E.setSlot(path, slot, state.baseEnv)
      let env = evolve(path, baseEnv)
      return {...state, baseEnv, env}
    }, 
    onUpdate: (ev) => (state, actions) => {
      const update = (ev instanceof Event) ? ev.currentTarget.dataset.mgUpdate : ev.update
      const context = (ev instanceof Event) ? JSON.parse(ev.currentTarget.dataset.mgContext || "null") : ev.context
      let baseEnv = state.baseEnv
      const ret = (env0) => {baseEnv = env0}
      baseEnv = {...baseEnv, ret}
      if (! update || ! updates[update]) throw new Error('onUpdate/0: no update or unknown update')
      const res = updates[update](context, baseEnv)
      let _unused = null
      baseEnv = E.isEnv(res) ? {...res, ret:_unused} : {...baseEnv, ret:_unused}
      let env = state.env
      if (! E.isSame(state.baseEnv, baseEnv)) {
        env = evolve("", baseEnv)
      }
      return {...state, baseEnv, env}
    }, 
    onFulfill: (ev) => (state, actions) => {
      const name = (ev instanceof Event) ? ev.currentTarget.dataset.mgName : ev.name
      const result = (ev instanceof Event) ? JSON.parse(ev.currentTarget.dataset.mgResult || "null") : ev.result
      let baseEnv = state.baseEnv
      const extra = E.getExtra(name, baseEnv)
      const ret = (env0) => {baseEnv = env0}
      baseEnv = {...baseEnv, ret}
      if (! extra || ! extra.fulfill) throw new Error('onFulfill/0: no callback or unknown callback')
      const res = extra.fulfill([result, baseEnv])
      let _unused = null
      baseEnv = E.isEnv(res) ? {...res, ret:_unused} : {...baseEnv, ret:_unused}
      let env = state.env
      if (! E.isSame(state.baseEnv, baseEnv)) {
        env = evolve("", baseEnv)
      }
      return {...state, baseEnv, env}
    }, 
    onThen: (context) => (state, actions) => {
      let baseEnv = state.baseEnv
      const ret = (env0) => {baseEnv = env0}
      baseEnv = {...baseEnv, ret}
      const res = context.handler([context.result, baseEnv])
      let _unused = null
      baseEnv = E.isEnv(res) ? {...res, ret:_unused} : {...baseEnv, ret:_unused}
      let env = state.env
      if (! E.isSame(state.baseEnv, baseEnv)) {
        env = evolve("", baseEnv)
      }
      if (! res.hasOwnProperty('tree')) {
        context.ret(res)
      }
      return {...state, baseEnv, env}
    }
  }

  let baseEnv = E.makeEnv(data, schemaDb, validate)
  let env = evolve("", baseEnv)
  const state = {
    baseEnv, 
    env
  }
  actions = app(state, actions0, view, containerEl)
  return {
    onUpdate: actions.onUpdate, 
  }
}



export const h = h0