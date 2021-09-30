
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
   * @param {Object} context
   * @param {string} context.touchAllPath
   * @param {string} context.errorSelector
   * @param {string} context.url
   * @param {string} context.update
   * @param {string} context.context
   */
  submit: (context, callEvolve, env) => {
    env = API.touchAll(context.touchAllPath, env)
    env = callEvolve(context.touchAllPath, env)

    const numErrors = API.countValidationErrors(context.touchAllPath, env)
    if (numErrors) {
      window.setTimeout(() => {
        const targetEl = containerEl.querySelector(context.errorSelector)
        if (targetEl) targetEl.scrollIntoView()
      }, 100)
    } else if (context.url) {
      const req = new XMLHttpRequest()
      req.open("POST", context.url)
      req.addEventListener('loadend', (res) => {
        // TODO: call update with context, or call transit with context
      })
      req.setRequestHeader("Content-Type", "application/json")
      req.send(JSON.stringify(API.extract("", env)))
      window.setTimeout(() => {window.alert('サブミットしました。')}, 100)
    }
  }
}

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
      const context = (ev instanceof Event) ? JSON.parse(ev.currentTarget.dataset.mgContext || "null") :  ev.context
      let baseEnv = state.baseEnv
      let env = state.env
      if (! update || ! updates[update]) throw new Error('onUpdate/0: no update or unknown update')
      const callEvolve = (path, baseEnv0) => {
        if (baseEnv0 && baseEnv0 !== baseEnv) {
          baseEnv = baseEnv0
          env = evolve(path, baseEnv)
        } else {
          // do nothing because `env' will not change.
        }
        return env
      }
      let env0 = updates[update](context, callEvolve, baseEnv)
      if (env0 && env0 !== env) env = env0
      return {...state, baseEnv, env}
    }
  }

  let baseEnv = E.makeEnv(data, schemaDb, validate)
  let env = evolve("", baseEnv)
  const state = {
    baseEnv, 
    env
  }
  const actions = app(state, actions0, view, containerEl)
  return {
    onUpdate: actions.onUpdate, 
  }
}

export const h = h0