
import { normalizePath } from './utils'
import * as E from './env'
import * as S from './schema'
import { app } from 'hyperapp'

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
 * @param {Object} params.bindingMap
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
      coerce = null, 
      bindingMap = null 
    }) => {
  // complements reasonable defaults
  if (! evolve) evolve = (_path, env) => env
  if (! validate) validate = S.validate(S.defaultRules, S.defaultMessages)
  if (! coerce) coerce = S.coerce(S.defaultRules, S.defaultMessages)
  if (! bindingMap) bindingMap = defaultBindingMap

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
    env, 
    bindingMap
  }
  const actions = app(state, actions0, view, containerEl)
}

const extractPath = (attributes) => {
  if ('mg-path' in attributes) {
    const path = attributes['mg-path']
    delete attributes['mg-path']
    attributes['data-mg-path'] = path
    return path
  } else {
    return null
  }
}

const modifyNode = (attributes, children, state, actions) => {
  const map = state.bindingMap
  const role = attributes['mg-role']
  delete attributes['mg-role']
  const path = extractPath(attributes)
  const slot = (path !== null) ? E.getSlot(path, state.env) : null
  switch (role) {
    case 'textbox': 
      attributes[map.textbox.oninput] = actions.onTextInput
      attributes[map.textbox.onblur] = actions.onTextBlur
      attributes[map.textbox.value] = slot.input
      if ((slot.touched || false) && (slot.invalid || false)) {
        attributes[map.textbox.class] += ' ' + map.textbox.invalidClass
        attributes[map.textbox.invalid] = true
      }
      break
    case 'listbox': 
      attributes[map.listbox.onchange] = actions.onSelectChange
      if ((slot.touched || false) && (slot.invalid || false)) {
        attributes[map.listbox.class] += ' ' + map.listbox.invalidClass
        attributes[map.listbox.invalid] = true
      }
      children.forEach((o) => {
        o.attributes[map.option.selected] = o.attributes[map.option.value] == slot['@value']
      })
      break
    case 'radio': 
      attributes[map.radio.onchange] = actions.onSelectChange
      attributes[map.radio.checked] = attributes[map.radio.value] == slot['@value']
      if ((slot.touched || false) && (slot.invalid || false)) {
        attributes[map.radio.class] += ' ' + map.radio.invalidClass
        attributes[map.radio.invalid] = true
      }
      break
    case 'checkbox': 
      attributes[map.checkbox.onchange] = actions.onToggleChange
      attributes[map.checkbox.checked] = slot['@value']
      if ((slot.touched || false) && (slot.invalid || false)) {
        attributes[map.checkbox.class] += ' ' + map.checkbox.invalidClass
        attributes[map.checkbox.invalid] = true
      }
      break
    // TODO: file, number, date, color, ...
    case 'button': 
      attributes[map.button.update] = attributes['mg-update']
      if ('mg-context' in attributes) {
        attributes[map.button.context] = JSON.stringify(attributes['mg-context'])
      }
      attributes[map.button.onclick] = actions.onUpdate
      break
    default: 
      break
  }
}

export function h(name, attributes) {
  var rest = []
  var children = []
  var length = arguments.length

  while (length-- > 2) rest.push(arguments[length])

  while (rest.length) {
    var node = rest.pop()
    if (node && node.pop) {
      for (length = node.length; length--; ) {
        rest.push(node[length])
      }
    } else if (node != null && node !== true && node !== false) {
      children.push(node)
    }
  }
  
  if (typeof name == 'function') {
    const rv = name(attributes || {}, children)
    return rv
  } else {
    if (attributes && attributes['mg-role']) {
      const rv = (state, actions) => {
        modifyNode(attributes, children, state, actions)
        const rv = {
          nodeName: name,
          attributes: attributes || {},
          children: children,
          key: attributes && attributes.key
        }
        return rv
      }
      return rv
    } else {
      const rv = {
        nodeName: name,
        attributes: attributes || {},
        children: children,
        key: attributes && attributes.key
      }
      return rv
    }
  }
}

export const defaultBindingMap = {
  textbox: {
    oninput: 'oninput', 
    onblur: 'onblur', 
    value: 'value', 
    class: 'class', 
    invalidClass: 'mg-invalid', 
    invalid: 'data-mg-invalid'
  }, 
  listbox: {
    onchange: 'onchange', 
    class: 'class', 
    invalidClass: 'mg-invalid', 
    invalid: 'data-mg-invalid'
  }, 
  option: {
    selected: 'selected', 
    value: 'value'
  }, 
  radio: {
    onchange: 'onchange', 
    checked: 'checked', 
    value: 'value', 
    class: 'class', 
    invalidClass: 'mg-invalid', 
    invalid: 'data-mg-invalid'
  }, 
  checkbox: {
    onchange: 'onchange', 
    checked: 'checked', 
    class: 'class', 
    invalidClass: 'mg-invalid', 
    invalid: 'data-mg-invalid'
  }, 
  button: {
    onclick: 'onclick', 
    update: 'data-mg-update', 
    context: 'data-mg-context'
  }
}
