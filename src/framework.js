//@ts-check

import { normalizePath, commonPath } from './utils'
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
  validate: E.validate, 
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
   * @returns {number} 
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
   * @param {string} path
   * @param {Env} env
   * @returns {{invalid:boolean, message:string}}
   */
  foldValidity: (path, env) => {
    return API.reduceDeep((cur, slot, _path) => {
      if (cur.invalid) return cur
      if (slot.touched && slot.invalid) return {invalid:true, message:slot.message}
      return cur
    }, /** @type {{invalid:boolean,message:string}} */({invalid:false, message:''}), path, env)
  }, 

  startReordering: (name, env) => {
    const p = new Promise((fulfill, reject) => {
      env = E.setExtra(name, {fulfill, reject}, env)
    })
    E.doReturn(env)
    return p
  }, 

  endReordering: (name, env) => {
    const extra = E.getExtra(name, env)
    if (! extra) return env
    return E.setExtra(name, null, env)
  }, 

  getReordering: (name, env) => {
    const extra = E.getExtra(name, env)
    if (! extra) return null
    return true
  }, 

  /**
   * @param {string} name
   * @param {string} message
   * @param {Object|null} options
   * @param {number|null} params.timeout
   * @param {Env} env
   * @returns {Promise}
   */
  openDialog: (name, message, options, env) => {
    const timeoutId = (options && options.timeout)
      ? setTimeout(() => { actions.onPromiseSettle({name, result:true}) }, options.timeout)
      : null
    const p = new Promise((fulfill, reject) => {
      env = E.setExtra(name, {message, fulfill, reject, timeoutId}, env)
    })
    E.doReturn(env)
    return p
  }, 

  closeDialog: (name, env) => {
    const extra = E.getExtra(name, env)
    if (! extra) return env
    if (extra.timeoutId) {
      clearTimeout(extra.timeoutId)
    }
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

  wrap: (handler) => {  // Our customized handler :: [result, env] => ...
    return (result) => {  // This is the actual promise handler
      let result1 = null  // We will get the result in this variable.
      const ret = (res1) => {result1 = res1}
      actions.onPromiseThen({result, handler, ret})  // enter into hyperapp. Its result is undefined.
      return result1
    }
  }, 

  /**
   * 
   * @param {string} url
   * @param {Object} options
   * @param {string} options.path
   * @param {string} options.errorSelector
   * @param {string} options.method
   * @param {string} options.successMessage
   * @param {number|null} options.successMessageTimeout
   * @param {string} options.failureMessage
   */
  submit: (url, options, env) => {
    const opts = {
      path: '', 
      errorSelector: null, 
      method: 'POST', 
      successMessage: "Submission successful.", 
      successMessageTimeout: 5000, 
      failureMessage: "Submission failed.", 
      ...options
    }
    env = API.touchAll(opts.path, env)
    env = API.validate(opts.path, env)
    const numErrors = API.countValidationErrors(opts.path, env)
    if (numErrors) {
      if (opts.errorSelector) {
        window.setTimeout(() => {
          const targetEl = document.querySelector(opts.errorSelector)
          if (targetEl) targetEl.scrollIntoView()
        }, 100)
      }
      return env
    } else {
      const fetchOptions = {
        method: opts.method, 
        mode: 'cors', 
        body: JSON.stringify(E.extract(opts.path, env)), 
        header: {
          'Content-Type': 'application/json'
        }
      }
      env = API.openProgress('loading', null, env)
      return API.withEnv(env, 
        /** @ts-ignore */
        fetch(url, fetchOptions)
        .catch(API.wrap(([response, env]) => {
          console.error('form submission failed', response)
          return {ok:false}
          //return {ok:true}
        }))
        .then(API.wrap(([response, env]) => {
          env = API.closeProgress('loading', env)
          if (response.ok) {
            return API.openDialog('feedback', opts.successMessage, {timeout:opts.successMessageTimeout}, env)
            .then(API.wrap(([result, env]) => {
              return API.closeDialog('feedback', env)
            }))
          } else {
            return API.openDialog('alert', opts.failureMessage, null, env)
            .then(API.wrap(([result, env]) => {
              return API.closeDialog('alert', env)
            }))
          }
        }))
      )
    }
  }, 

  reorder: (name, fromPath, env) => {
    return API.startReordering(name, env)
      .then(API.wrap(([{path}, env]) => {
        env = API.endReordering(name, env)
        return API.move(fromPath, path, env)
      }))
  }
}

const apiProxies = {
  openDialog: (context, env) => {
    return API.openDialog(context.name, context.message, context.options, env)
  }, 
  closeDialog: (context, env) => {
    return API.closeDialog(context.name, env)
  }, 
  openProgress: (context, env) => {
    return API.openProgress(context.name, null, env)
  }, 
  closeProgress: (context, env) => {
    return API.closeProgress(context.name, env)
  }, 
  setPage: (context, env) => {
    return API.setPage(context.name, context.current, env)
  }, 
  nextPage: (context, env) => {
    return API.nextPage(context.name, env)
  }, 
  prevPage: (context, env) => {
    return API.prevPage(context.name, env)
  }, 
  setSwitch: (context, env) => {
    return API.setSwitch(context.name, context.shown, env)
  }, 
  toggleSwitch: (context, env) => {
    return API.toggleSwitch(context.name, env)
  }, 
  submit: (context, env) => {
    return API.submit(context.url, context.options, env)
  }, 
  reorder: (context, env) => {
    return API.reorder(context.name, context.fromPath, env)
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
 * @param {(Env) => import('hyperapp').VNode} params.view
 * @param {Element} params.containerEl
 * @param {((string, Env) => Env) | null} params.evolve
 * @param {{[name:string]:(any)}} params.updates
 * @param {((value:any, slot:Slot, schema:Schema, path:string, env:Env) => Slot) | null} params.validate
 * @param {((input:string, slot:Slot, schema:Schema) => Slot) | null} params.coerce
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
    onTextboxInput: (ev) => (state, actions) => {
      const path = ev.currentTarget.dataset.mgPath
      const value = ev.currentTarget[ev.currentTarget.dataset.mgValueAttribute]
      const slot0 = E.getSlot(path, state.baseEnv)
      const slot = {...slot0, input:value}
      const baseEnv = E.setSlot(path, slot, state.baseEnv)
      // We don't call evolve() here, because oninput is not a check point of evolve().
      // Thus we update not only baseEnv but also env.
      const slotb0 = E.getSlot(path, state.env)
      const slotb = {...slotb0, input:value}
      const env = E.setSlot(path, slotb, state.env)
      return {...state, baseEnv, env}
    }, 
    onTextboxBlur: (ev) => (state, actions) => {
      const path = ev.currentTarget.dataset.mgPath
      const value = ev.currentTarget[ev.currentTarget.dataset.mgValueAttribute]
      const npath = normalizePath(path)
      const slot0 = {...E.getSlot(path, state.baseEnv), touched:true}
      const slot = coerce(value, slot0, schemaDb[npath])
      let baseEnv = E.setSlot(path, slot, state.baseEnv)
      baseEnv = E.validate("", baseEnv)
      let env = evolve(path, baseEnv)
      env = E.validate("", env)
      return {...state, baseEnv, env}
    }, 
    onSliderInput: (ev) => (state, actions) => {
      const path = ev.currentTarget.dataset.mgPath
      const value = ev.currentTarget[ev.currentTarget.dataset.mgValueAttribute]
      const slot0 = E.getSlot(path, state.baseEnv)
      const slot = {...slot0, input:value}
      const baseEnv = E.setSlot(path, slot, state.baseEnv)
      // We don't call evolve() here, because oninput is not a check point of evolve().
      // Thus we update not only baseEnv but also env.
      const slotb0 = E.getSlot(path, state.env)
      const slotb = {...slotb0, input:value}
      const env = E.setSlot(path, slotb, state.env)
      return {...state, baseEnv, env}
    }, 
    onSliderChange: (ev) => (state, actions) => {
      const path = ev.currentTarget.dataset.mgPath
      const value = ev.currentTarget[ev.currentTarget.dataset.mgValueAttribute]
      const npath = normalizePath(path)
      const slot0 = {...E.getSlot(path, state.baseEnv), touched:true}
      const slot = coerce(value, slot0, schemaDb[npath])
      let baseEnv = E.setSlot(path, slot, state.baseEnv)
      baseEnv = E.validate("", baseEnv)
      let env = evolve(path, baseEnv)
      env = E.validate("", env)
      return {...state, baseEnv, env}
    }, 
    onListboxChange: (ev) => (state, actions) => {
      const path = ev.currentTarget.dataset.mgPath
      const value = ev.currentTarget[ev.currentTarget.dataset.mgValueAttribute]
      const npath = normalizePath(path)
      const slot0 = {...E.getSlot(path, state.baseEnv), touched:true}
      const slot = coerce(value, slot0, schemaDb[npath])
      let baseEnv = E.setSlot(path, slot, state.baseEnv)
      baseEnv = E.validate("", baseEnv)
      let env = evolve(path, baseEnv)
      env = E.validate("", env)
      return {...state, baseEnv, env}
    }, 
    onRadioChange: (ev) => (state, actions) => {
      const path = ev.currentTarget.dataset.mgPath
      const value = ev.currentTarget[ev.currentTarget.dataset.mgValueAttribute]
      const npath = normalizePath(path)
      const slot0 = {...E.getSlot(path, state.baseEnv), touched:true}
      const slot = coerce(value, slot0, schemaDb[npath])
      let baseEnv = E.setSlot(path, slot, state.baseEnv)
      baseEnv = E.validate("", baseEnv)
      let env = evolve(path, baseEnv)
      env = E.validate("", env)
      return {...state, baseEnv, env}
    }, 
    onCheckboxChange: (ev) => (state, actions) => {
      const path = ev.currentTarget.dataset.mgPath
      const checked = ev.currentTarget[ev.currentTarget.dataset.mgCheckedAttribute]
      const value = checked ? "true" : "false"
      const npath = normalizePath(path)
      const slot0 = {...E.getSlot(path, state.baseEnv), touched:true}
      const slot = coerce(value, slot0, schemaDb[npath])
      let baseEnv = E.setSlot(path, slot, state.baseEnv)
      baseEnv = E.validate("", baseEnv)
      let env = evolve(path, baseEnv)
      env = E.validate("", env)
      return {...state, baseEnv, env}
    }, 
    onSmartControlChange: (pair) => (state, actions) => {
      const pairs = Array.isArray(pair) ? pair : [pair]
      let cpath = Array.isArray(pair) ? pair[0].path : pair.path
      let baseEnv = state.baseEnv
      for (let i = 0; i < pairs.length; i++) {
        const {path, input} = pairs[i]
        const slot0 = {...E.getSlot(path, baseEnv), touched:true}
        const slot = coerce(input, slot0, schemaDb[normalizePath(path)])
        baseEnv = E.setSlot(path, slot, baseEnv)
        cpath = commonPath(cpath, path)
      }
      baseEnv = E.validate("", baseEnv)
      let env = evolve(cpath, baseEnv)
      env = E.validate("", env)
      return {...state, baseEnv, env}
    }, 
    onUpdate: (ev) => (state, actions) => {
      const update = ('currentTarget' in ev) ? ev.currentTarget.dataset.mgUpdate : ev.update
      const context = ('currentTarget' in ev) ? JSON.parse(ev.currentTarget.dataset.mgContext || "null") : ev.context
      let baseEnv = state.baseEnv
      baseEnv = E.setRet((env0) => {baseEnv = env0}, baseEnv)
      if (! update || !(updates[update] || apiProxies[update])) throw new Error('onUpdate/0: no update or unknown update')
      const res = (updates[update] || apiProxies[update])(context, baseEnv)
      baseEnv = E.setRet(null, E.isEnv(res) ? res : baseEnv)
      baseEnv = E.validate("", baseEnv)
      let env = state.env
      if (! E.isSame(state.baseEnv, baseEnv)) {
        env = evolve("", baseEnv)
        env = E.validate("", env)
      }
      return {...state, baseEnv, env}
    }, 
    onPromiseSettle: (ev) => (state, actions) => {
      const name = ('currentTarget' in ev) ? ev.currentTarget.dataset.mgName : ev.name
      const result = ('currentTarget' in ev) ? JSON.parse(ev.currentTarget.dataset.mgResult || "null") : ev.result
      const extra = E.getExtra(name, state.baseEnv)
      if (! extra || ! extra.fulfill) throw new Error('onPromiseSettle/0: no callback or unknown callback')
      if (extra.timeoutId) {
        clearTimeout(extra.timeoutId)
      }
      extra.fulfill(result)
    }, 
    onPromiseThen: (context) => (state, actions) => {
      let baseEnv = state.baseEnv
      baseEnv = E.setRet((env0) => {baseEnv = env0}, baseEnv)
      const res = context.handler([context.result, baseEnv])
      baseEnv = E.setRet(null, E.isEnv(res) ? res : baseEnv)
      baseEnv = E.validate("", baseEnv)
      let env = state.env
      if (! E.isSame(state.baseEnv, baseEnv)) {
        env = evolve("", baseEnv)
        env = E.validate("", env)
      }
      if (! E.isEnv(res)) {
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
  const view1 = (state, actions) => view(state.env)
  actions = app(state, actions0, view1, containerEl)
  return {
    onUpdate: actions.onUpdate, 
  }
}



export const h = h0