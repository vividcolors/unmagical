
import * as E from './env'
import * as S from './schema'
import {app} from 'hyperapp'

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
        return (slot.touched && slot.invalid) ? (cur + 1) : cur
      }, 0, path, env)
    }, 
    validationErrors: (path, env) => {
      let errors = []
      E.reduce((cur, slot, path) => {
        if (slot.touched && slot.invalid) {
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
    onSelectChange: (ev) => (state, actions) => {
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
    onButtonClick: (ev) => (state, actions) => {
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
    }, 
    onCall: ({hook, effect, data}) => (state, actions) => {
      let baseEnv = state.baseEnv
      if (hook) baseEnv = hooks[hook](baseEnv, data, API)
      let env = hooks.evolve(baseEnv, API)
      env = E.goTo("", env)
      if (effect) env = hooks[effect](env, data, API)
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
  console.log('start/2', env)
  
  const state = {
    baseEnv, 
    env
    // TODO internal state
  }
  const actions = app(state, actions0, view, el)
  return actions.onCall
}

const defaultDict = {
  'schema.ruleError.enum': 'Invalid input',   // 不正な入力です
  'schema.ruleError.const': 'Invalid input',   // 不正な入力です
  'schema.ruleError.required': 'Missing fields',  // フィールドが不足しています
  'schema.ruleError.requiredAnyOf': 'Unknown instance',  // 未知のインスタンスです
  'schema.ruleError.maximum': 'Please enter {{0}} or less',  // %s以下を入力してください
  'schema.ruleError.exclusiveMaximum': 'Please enter a number less than {{0}}',  // %sより小さい数を入力してください
  'schema.ruleError.minimum': 'Please enter {{0}} or more',  // %s以上を入力してください
  'schema.ruleError.exclusiveMinimum': 'Please enter a number more than {{0}}',  // %sより大きい数を入力してください
  'schema.ruleError.maxLength': 'Please enter no more than {{0}} characters',  // %s文字以下で入力してください
  'schema.ruleError.minLength0': 'Please enter',  // 入力してください
  'schema.ruleError.minLength': 'Please enter at least {{0}} characters',  // %s文字以上で入力してください
  'schema.ruleError.pattern': 'Invalid format',  // 形式が不正です
  'schema.typeError': 'Invalid type',  // 不正な型です
  'schema.scanError.empty': 'Please select',  // 選択してください
  'schema.scanError.number': "Please enter a number",  // 数値を入力してください
  'schema.scanError.integer': "Please enter an integer",  // 整数を入力してください
  'schema.scanError.boolean': "Please enter a boolean value"  // 真偽値を入力してください
}

export const applyDict = (dict, code, arg = null) => {
  const format = dict[code] || defaultDict[code] || code
  return format.replace('{{0}}', '' + arg)
}

const bindingType = (name, inputType) => {
  switch (name) {
    case 'textarea': return 'text'
    case 'select': return 'select'
    case 'input': 
      switch (inputType) {
        case 'text': return 'text'
        case 'password': return 'text'
        case 'number': return 'text'
        case 'radio': return 'radio'
        case 'checkbox': return 'checkbox'
        case 'file': return 'file'
        // TODO: color, date, ...
        default: 'text'
      }
    default: return ''
  }
}

export function h(name, attributes) {
  //console.log('h/0', typeof name == 'function' ? name.name : name)
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
    //console.log('h/1', name.name, rv)
    return rv
  } else {
    if (attributes && attributes.path) {
      const rv = (state, actions) => {
        //console.log('h/2.0', name)
        const path = attributes.path
        delete attributes.path
        const env = E.goTo(path, state.env)
        attributes['data-path'] = path
        const slot = E.gets(path, state.env)
        attributes.key = slot.key
        const invalidClass = ' mg-invalid'  // TODO
        switch (bindingType(name, attributes.type)) {
          case 'text': 
            attributes.oninput = actions.onTextInput
            attributes.onblur = actions.onTextBlur
            attributes.value = slot.input
            if ((slot.touched || false) && (slot.invalid || false)) {
              attributes.class += invalidClass
            }
            break
          case 'select': 
            attributes.onchange = actions.onSelectChange
            attributes.checked = attributes.value == slot['@value']
            if ((slot.touched || false) && (slot.invalid || false)) {
              attributes.class += invalidClass
            }
            children.forEach((option) => {
              option.attributes.selected = option.attributes.value == slot['@value']
            })
            break
          case 'radio': 
            attributes.onchange = actions.onSelectChange
            attributes.checked = attributes.value == slot['@value']
            if ((slot.touched || false) && (slot.invalid || false)) {
              attributes.class += invalidClass
            }
            break
          case 'checkbox': 
            attributes.onchange = actions.onToggleChange
            attributes.checked = slot['@value']
            if ((slot.touched || false) && (slot.invalid || false)) {
              attributes.class += invalidClass
            }
            break
          default: 
            // TODO: file, number, date, color, ...
            break
        }
        const rv = {
          nodeName: name,
          attributes: attributes || {},
          children: children,
          key: attributes && attributes.key
        }
        //console.log('h/2.1', name, rv)
        return rv
      }
      //console.log('h/2', name, rv)
      return rv
    } else {
      const rv = {
        nodeName: name,
        attributes: attributes || {},
        children: children,
        key: attributes && attributes.key
      }
      //console.log('h/3', name, rv)
      return rv
    }
  }
}