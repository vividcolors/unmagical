//@ts-check

import { normalizePath } from './utils'
import * as E from './env'
import * as S from './schema'
import * as X from './errors'
import { app, h as h0 } from 'hyperapp'

/**
 * 
 * @typedef {import("./schema").Json} Json
 * @typedef {import("./schema").Schema} Schema
 * @typedef {import("./schema").Slot} Slot
 * @typedef {import("./schema").SchemaDb} SchemaDb
 * @typedef {import("./schema").LookupFunc} LookupFunc
 * @typedef {import("./schema").Rules} Rules
 * @typedef {import("./env").Env} Env
 * @typedef {import("./errors").MgError} MgError
 * @typedef {import("./errors").Catalog} Catalog
 * 
 */


/**
 * @namespace
 */
export const API = {
  // re-export from env
  test: E.test, 
  extract: E.extract, 
  getSlot: E.getSlot, 
  add: E.add, 
  remove: E.remove, 
  replace: E.replace, 
  move: E.move, 
  copy: E.copy, 
  duplicate: E.duplicate, 
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
   * @returns {{invalid:boolean, error:MgError}}
   */
  foldValidity: (path, env) => {
    return API.reduceDeep((cur, slot, _path) => {
      if (cur.invalid) return cur
      if (slot.touched && slot.invalid) return {invalid:true, error:slot.error}
      return cur
    }, /** @type {{invalid:boolean,error:MgError}} */({invalid:false, error:null}), path, env)
  }, 

  /**
   * @param {number} ms
   * @param {Env} env
   * @returns {[Promise, Env]}
   */
  sleep: (ms, env) => {
    const p = new Promise((fulfill, reject) => {
      setTimeout(() => {
        fulfill(null)
      }, ms)
    })
    return [p, env]
  }, 

  /**
   * @param {string} name
   * @param {string} itemPath
   * @param {string} group
   * @param {Env} env
   * @returns {[Promise, Env]}
   */
  startReordering: (name, itemPath, group, env) => {
    const p = new Promise((fulfill, reject) => {
      env = E.setExtra(name, {itemPath, group, fulfill, reject}, env)
    })
    return [p, env]
  }, 

  /**
   * @param {string} name
   * @param {Env} env
   * @returns {Env}
   */
  endReordering: (name, env) => {
    const extra = E.getExtra(name, env)
    if (! extra) return env
    return E.setExtra(name, null, env)
  }, 

  /**
   * @param {string} name
   * @param {Env} env
   * @returns {string|null}
   */
  getReordering: (name, env) => {
    const extra = E.getExtra(name, env)
    if (! extra) return null
    return extra.itemPath
  }, 

  /**
   * @param {string} name
   * @param {any} data
   * @param {Env} env
   * @returns {[Promise, Env]}
   */
  openDialog: (name, data, env) => {
    const p = new Promise((fulfill, reject) => {
      env = E.setExtra(name, {data, fulfill, reject}, env)
    })
    return [p, env]
  }, 

  /**
   * @param {string} name
   * @param {Env} env
   * @returns {Env}
   */
  closeDialog: (name, env) => {
    const extra = E.getExtra(name, env)
    if (! extra) return env
    return E.setExtra(name, null, env)
  }, 

  /**
   * @param {string} name
   * @param {Env} env
   * @returns {any|null}
   */
  getDialog: (name, env) => {
    const extra = E.getExtra(name, env)
    if (! extra) return null
    return extra.data
  }, 

  /**
   * @param {string} name
   * @param {any} data
   * @param {Env} env
   * @returns {Env}
   */
  openFeedback: (name, data, env) => {
    return E.setExtra(name, data, env)
  }, 

  /**
   * @param {string} name
   * @param {Env} env
   * @returns {Env}
   */
  closeFeedback: (name, env) => {
    const extra = E.getExtra(name, env)
    if (! extra) return env
    return E.setExtra(name, null, env)
  }, 

  /**
   * @param {string} name
   * @param {Env} env
   * @returns {any|null}
   */
  getFeedback: (name, env) => {
    return E.getExtra(name, env)
  }, 

  /**
   * @param {string} name
   * @param {number} current
   * @param {Env} env
   * @returns {Env}
   */
  setPage: (name, current, env) => {
    return E.setExtra(name, current, env)
  }, 

  /**
   * @param {string} name
   * @param {Env} env
   * @returns {number}
   */
  getPage: (name, env) => {
    const extra = E.getExtra(name, env)
    return (extra !== null) ? extra : 0
  }, 

  /**
   * @param {string} name
   * @param {Env} env
   * @returns {Env}
   */
  nextPage: (name, env) => {
    const extra = E.getExtra(name, env)
    const current = (extra !== null) ? extra : 0
    return E.setExtra(name, current + 1, env)
  }, 

  /**
   * @param {string} name
   * @param {Env} env
   * @returns {Env}
   */
  prevPage: (name, env) => {
    const extra = E.getExtra(name, env)
    const current = (extra !== null) ? extra : 0
    return E.setExtra(name, current - 1, env)
  }, 

  /**
   * @param {string} name
   * @param {boolean} shown
   * @param {Env} env
   * @returns {Env}
   */
  setSwitch: (name, shown, env) => {
    return E.setExtra(name, shown, env)
  }, 

  /**
   * @param {string} name
   * @param {Env} env
   * @returns {boolean}
   */
  getSwitch: (name, env) => {
    const extra = E.getExtra(name, env)
    return (extra !== null) ? extra : false
  }, 

  /**
   * @param {string} name
   * @param {Env} env
   * @returns {Env}
   */
  toggleSwitch: (name, env) => {
    const extra = E.getExtra(name, env)
    const current = (extra !== null) ? extra : false
    return E.setExtra(name, !current, env)
  }, 

  /*
   * TODO: progress bar, ReadStream, ...
   */
  /**
   * @param {string} name
   * @param {any} unknown
   * @param {Env} env
   * @returns {Env}
   */
  openProgress: (name, unknown, env) => {
    return E.setExtra(name, {current:-1}, env)
  }, 

  /**
   * @param {string} name
   * @param {Env} env
   * @returns {Env}
   */
  closeProgress: (name, env) => {
    return E.setExtra(name, null, env)
  }, 

  /**
   * @param {string} name
   * @param {Env} env
   * @returns {number|null}
   */
  getProgress: (name, env) => {
    const extra = E.getExtra(name, env)
    if (! extra) return null
    return extra.current
  }, 
  
  /**
   * @param {string} name 
   * @param {string} fromPath 
   * @param {string} group
   * @param {Env} env
   * @returns {Env|Promise}
   */
  reorder: (name, fromPath, group, env) => {
    const {enter, leave} = API.makePortal(env)
    return /** @type {Promise} */ (leave(API.startReordering(name, fromPath, group, env)))
    .then(enter(({path}, env) => {
      env = API.endReordering(name, env)
      return API.move(fromPath, path, env)
    }))
  }, 

  /**
   * @param {Env} env
   */
  makePortal: (env) => {
    return {
      /**
       * @param {(result:any, env:Env) => any} handler
       * @returns {(result:any) => any}
       */
      enter: (handler) => {  // Our customized handler :: [result, env] => ...
        return (result) => {  // This is the actual, standard promise handler
          let result1 = null  // We will get the result in this variable.
          const ret = (res1) => {result1 = res1}
          env.onPromiseThen({result, handler, ret})  // enter into hyperapp. Its result is undefined.
          return result1
        }
      }, 
      /**
       * @param {[(Promise|Error), Env] | (Promise|Error)} x
       * @param {Env} [y]
       * @returns {Promise|Error}
       */
      leave: (x, y) => {
        const p = Array.isArray(x) ? x[0] : x
        const env = Array.isArray(x) ? x[1] : y
        if (! E.isEnv(env)) throw new Error('exit/1: env required')
        E.doReturn(env)
        return p
      }
    }
  }
}

const updateEnabledApis = {
  openDialog: API.openDialog, 
  closeDialog: API.closeDialog, 
  openFeedback: API.openFeedback, 
  closeFeedback: API.closeFeedback, 
  openProgress: API.openProgress, 
  closeProgress: API.closeProgress, 
  setPage: API.setPage, 
  nextPage: API.nextPage, 
  prevPage: API.prevPage, 
  setSwitch: API.setSwitch, 
  toggleSwitch: API.toggleSwitch, 
  reorder: API.reorder
}

/**
 * @param {Object} params
 * @param {Json} params.data
 * @param {Schema} params.schema
 * @param {(Env) => import('hyperapp').VNode} params.view
 * @param {Element} params.containerEl
 * @param {((env:Env, updatePointer:string, prevEnv:Env|null) => Env) | null} params.evolve
 * @param {{[name:string]:(any)}} params.updates
 * @param {Rules} params.rules
 * @param {Catalog} params.catalog
 */
export const start = (
    {
      data, 
      schema, 
      view, 
      containerEl, 
      evolve = null, 
      updates = {}, 
      rules = null, 
      catalog = null
    }) => {
  // complements reasonable defaults
  if (! evolve) evolve = (env, _pointer, _prevEnv) => env
  const validate = S.validate(rules || S.defaultRules)
  const coerce = S.coerce
  const normalizeError = X.normalizeError(catalog || X.defaultErrorMessages)

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
      let updatePointer
      let baseEnv = E.beginUpdateTracking(state.baseEnv)
      baseEnv = E.setSlot(path, slot, baseEnv)
      baseEnv = E.validate("", baseEnv);
      [updatePointer, baseEnv] = E.endUpdateTracking(baseEnv)
      let env = evolve(baseEnv, updatePointer, baseEnv)
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
      let updatePointer
      let baseEnv = E.beginUpdateTracking(state.baseEnv)
      baseEnv = E.setSlot(path, slot, baseEnv)
      baseEnv = E.validate("", baseEnv);
      [updatePointer, baseEnv] = E.endUpdateTracking(baseEnv)
      let env = evolve(baseEnv, updatePointer, state.env)
      env = E.validate("", env)
      return {...state, baseEnv, env}
    }, 
    onListboxChange: (ev) => (state, actions) => {
      const path = ev.currentTarget.dataset.mgPath
      const value = ev.currentTarget[ev.currentTarget.dataset.mgValueAttribute]
      const npath = normalizePath(path)
      const slot0 = {...E.getSlot(path, state.baseEnv), touched:true}
      const slot = coerce(value, slot0, schemaDb[npath])
      let updatePointer
      let baseEnv = E.beginUpdateTracking(state.baseEnv)
      baseEnv = E.setSlot(path, slot, baseEnv)
      baseEnv = E.validate("", baseEnv);
      [updatePointer, baseEnv] = E.endUpdateTracking(baseEnv)
      let env = evolve(baseEnv, updatePointer, state.env)
      env = E.validate("", env)
      return {...state, baseEnv, env}
    }, 
    onRadioChange: (ev) => (state, actions) => {
      const path = ev.currentTarget.dataset.mgPath
      const value = ev.currentTarget[ev.currentTarget.dataset.mgValueAttribute]
      const npath = normalizePath(path)
      const slot0 = {...E.getSlot(path, state.baseEnv), touched:true}
      const slot = coerce(value, slot0, schemaDb[npath])
      let updatePointer
      let baseEnv = E.beginUpdateTracking(state.baseEnv)
      baseEnv = E.setSlot(path, slot, baseEnv)
      baseEnv = E.validate("", baseEnv);
      [updatePointer, baseEnv] = E.endUpdateTracking(baseEnv)
      let env = evolve(baseEnv, updatePointer, state.env)
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
      let updatePointer
      let baseEnv = E.beginUpdateTracking(state.baseEnv)
      baseEnv = E.setSlot(path, slot, baseEnv)
      baseEnv = E.validate("", baseEnv);
      [updatePointer, baseEnv] = E.endUpdateTracking(baseEnv)
      let env = evolve(baseEnv, updatePointer, state.env)
      env = E.validate("", env)
      return {...state, baseEnv, env}
    }, 
    onSmartControlChange: (pair) => (state, actions) => {
      const pairs = Array.isArray(pair) ? pair : [pair]
      let updatePointer
      let baseEnv = E.beginUpdateTracking(state.baseEnv)
      for (let i = 0; i < pairs.length; i++) {
        const {path, input} = pairs[i]
        const slot0 = {...E.getSlot(path, baseEnv), touched:true}
        const slot = coerce(input, slot0, schemaDb[normalizePath(path)])
        baseEnv = E.setSlot(path, slot, baseEnv)
      }
      baseEnv = E.validate("", baseEnv);
      [updatePointer, baseEnv] = E.endUpdateTracking(baseEnv)
      let env = evolve(baseEnv, updatePointer, state.env)
      env = E.validate("", env)
      return {...state, baseEnv, env}
    }, 
    onUpdate: (ev) => (state, actions) => {
      const update = ('currentTarget' in ev) ? ev.currentTarget.dataset.mgUpdate : ev.update
      const context = ('currentTarget' in ev) ? JSON.parse(ev.currentTarget.dataset.mgContext || "null") : ev.context
      let updatePointer
      let baseEnv = E.beginUpdateTracking(state.baseEnv)
      baseEnv = E.setPortal((env0) => {baseEnv = env0}, actions.onPromiseThen, baseEnv)
      const func = updates[update] || updateEnabledApis[update]
      if (! func) throw new Error('onUpdate/0: no update or unknown update')
      if (! Array.isArray(context)) throw new Error('onUpdate/1: parameter must be an array')
      if (context.length + 1 != func.length) throw new Error('onUpdate/2: bad number of parameters')
      const res = func.apply(null, [...context, baseEnv])
      baseEnv = E.setPortal(null, null, E.isEnv(res) ? res : baseEnv)
      baseEnv = E.validate("", baseEnv);
      [updatePointer, baseEnv] = E.endUpdateTracking(baseEnv)
      let env = state.env
      if (! E.isSame(state.baseEnv, baseEnv)) {
        env = evolve(baseEnv, updatePointer, env)
        env = E.validate("", env)
      }
      return {...state, baseEnv, env}
    }, 
    onPromiseSettle: (ev) => (state, actions) => {
      const name = ('currentTarget' in ev) ? ev.currentTarget.dataset.mgName : ev.name
      const result = ('currentTarget' in ev) ? JSON.parse(ev.currentTarget.dataset.mgResult || "null") : ev.result
      const extra = E.getExtra(name, state.baseEnv)
      if (! extra || ! extra.fulfill) throw new Error('onPromiseSettle/0: no callback or unknown callback')
      // Calling fulfill() will cause the process to re-enter the hyperapp, 
      // so we call fulfill() not now but in a different tick.
      window.requestAnimationFrame(() => {
        extra.fulfill(result)
      })
      return null  // indicating no update.
    }, 
    onPromiseThen: (context) => (state, actions) => {
      let updatePointer
      let baseEnv = E.beginUpdateTracking(state.baseEnv)
      baseEnv = E.setPortal((env0) => {baseEnv = env0}, actions.onPromiseThen, baseEnv)
      const res = context.handler(context.result, baseEnv)
      baseEnv = E.setPortal(null, null, E.isEnv(res) ? res : baseEnv)
      baseEnv = E.validate("", baseEnv);
      [updatePointer, baseEnv] = E.endUpdateTracking(baseEnv)
      let env = state.env
      if (! E.isSame(state.baseEnv, baseEnv)) {
        env = evolve(baseEnv, updatePointer, env)
        env = E.validate("", env)
      }
      if (! E.isEnv(res)) {
        context.ret(res)
      }
      return {...state, baseEnv, env}
    }
  }

  let updatePointer
  let baseEnv = E.makeEnv(data, schemaDb, validate, true)
  baseEnv = E.validate("", baseEnv);
  [updatePointer, baseEnv] = E.endUpdateTracking(baseEnv)
  let env = evolve(baseEnv, updatePointer, null)
  env = E.validate("", env)
  const state = {
    baseEnv, 
    env, 
    normalizeError
  }
  const view1 = (state, actions) => view(state.env)
  const actions = app(state, actions0, view1, containerEl)
  return {
    onUpdate: actions.onUpdate, 
  }
}



export const h = h0