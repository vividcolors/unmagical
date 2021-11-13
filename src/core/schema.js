//@ts-check

import {emptyObject, typeOf, isJsonValue, appendPath} from './utils'

/**
 * @typedef {null|number|string|boolean|any[]|{[name:string]:any}} Json 
 * @typedef {{
 *   invalid?:boolean, 
 *   message?:string, 
 *   touched?:boolean, 
 *   input?:string, 
 *   ['@value']?:Json
 * }} Slot
 * @typedef {import("./env").Env} Env
 * @typedef {{
 *   [rule:string]:Json
 * }} Schema
 * @typedef {(path:string) => Json} LookupFunc
 * @typedef {(param:Json, value:Json, lookup:LookupFunc, rules:Rules) => true|string} RuleFunc
 * @typedef {{[name:string]:RuleFunc}} Rules
 * @typedef {{[key:string]:string}} Dictionary
 * @typedef {{[path:string]:Schema}} SchemaDb
 * 
 */

/**
 * Returns true if type specification allows null.
 * @param {string|null|undefined} type a type in schema
 */
const nullable = (type) => {
  if (! type) return true
  const lastChar = type.charAt(type.length - 1)
  return type == 'null' || lastChar == '?'
}

/**
 * Maps error codes to messages. Use your own messages for localization.
 * @type {Dictionary}
 */
export const defaultMessages = {
  'schema.ruleError.enum': 'Invalid input',   // 不正な入力です
  'schema.ruleError.const': 'Invalid input',   // 不正な入力です
  'schema.ruleError.required': 'Missing properties',  // フィールドが不足しています
  'schema.ruleError.switchRequired': 'Unknown instance',  // 未知のインスタンスです
  'schema.ruleError.same': 'Not a same value', 
  'schema.ruleError.multipleOf': 'Please enter a multiple of {{0}}',  // %Sの倍数を入力してください
  'schema.ruleError.maximum': 'Please enter {{0}} or less',  // %s以下を入力してください
  'schema.ruleError.exclusiveMaximum': 'Please enter a number less than {{0}}',  // %sより小さい数を入力してください
  'schema.ruleError.minimum': 'Please enter {{0}} or more',  // %s以上を入力してください
  'schema.ruleError.exclusiveMinimum': 'Please enter a number more than {{0}}',  // %sより大きい数を入力してください
  'schema.ruleError.maxLength': 'Please enter no more than {{0}} characters',  // %s文字以下で入力してください
  'schema.ruleError.minLength0': 'Please enter',  // 入力してください
  'schema.ruleError.minLength': 'Please enter at least {{0}} characters',  // %s文字以上で入力してください
  'schema.ruleError.pattern': 'Invalid format',  // 形式が不正です
  'schema.ruleError.maxItems': 'Please make it less than or equal to {{0}}',  // %s個以下にしてください
  'schema.ruleError.minItems': 'Please make it more than or equal to {{0}}',  // %s個以上にしてください
  'schema.valueError.generic': 'Invalid value',  // 不正な値です
  'schema.valueError.null': 'Invalid input', 
  'schema.valueError.number': 'Please input a number', 
  'schema.valueError.number?': 'Please input a number', 
  'schema.valueError.integer': 'Please input an integer', 
  'schema.valueError.integer?': 'Please input an integer', 
  'schema.valueError.boolean': 'Please input true or false', 
  'schema.valueError.boolean?': 'Please input true or false', 
  'schema.valueError.string': 'Invalid input', 
  'schema.valueError.array': 'Invalid input', 
  'schema.valueError.array?': 'Invalid input', 
  'schema.valueError.object': 'Invalid input', 
  'schema.valueError.object?': 'Invalid input'
}

/**
 * 
 * @param {Json} schema 
 * @returns {SchemaDb}
 */
export const buildDb = (schema) => {
  const db = /** @type SchemaDb */ ({})
  const inner = (schema, path) => {
    db[path] = schema
    switch (schema.type) {
      case 'object': 
      case 'object?': 
        for (let p in schema.properties) {
          inner(schema.properties[p], path + '/' + p)
        }
        break
      case 'array': 
      case 'array?': 
        inner(schema.items, path + '/*')
        break
      default: 
        break
    }
  }
  inner(schema, "")
  return db
}

/**
 * Makes a localized message for error code.
 * @param {Dictionary} dict 
 * @param {string} code an error code
 * @param {Json} arg a parameter for validation rule
 * @return {string}
 */
const makeMessage = (dict, code, arg = null) => {
  const format = dict[code] || (code + ': {{0}}')
  return format.replace('{{0}}', '' + arg)
}

/**
 * Returns true if the value is in an specified type
 * @param {Json} value
 * @param {string} type 
 * @returns {boolean}
 */
const testType = (value, type) => {
  if (! type) return true
  if (value === null) {
    return nullable(type)
  } else {
    switch (type) {
      case 'null': 
        return false
      case 'number':  // FALLTHRU
      case 'number?': 
        return typeof value == 'number'
      case 'integer':  // FALLTHRU
      case 'integer?': 
        return (typeof value == 'number' && value % 1 === 0)
      case 'boolean':  // FALLTHRU
      case 'boolean?': 
        return typeof value == 'boolean'
      case 'string': 
        return typeof value == 'string'
      case 'object':  // FALLTHRU
      case 'object?': 
        return (typeof value == 'object' && value !== null)
      case 'array':  // FALLTHRU
      case 'array?': 
        return Array.isArray(value)
      default: 
        throw new Error('unknown type: ' + type)
    }
  }
}

/**
 * validation rules.
 * @type {Rules}
 */
export const defaultRules = {
  type: (param, value) => {
    if (typeof param != 'string') throw new Error('invalid type')
    const result = testType(value, param)
    if (! result) return 'schema.typeError.' + param
    return true
  }, 
  'enum': (param, value) => {
    if (! Array.isArray(param)) throw new Error('invalid parameter')
    for (let i = 0; i < param.length; i++) {
      if (param[i] === value) return true
    }
    return 'schema.ruleError.enum'
  }, 
  'const': (param, value) => {
    if (param === value) return true
    return 'schema.ruleError.const'
  }, 
  required: (param, value) => {
    if (! Array.isArray(param)) throw new Error('invalid parameter')
    if (typeOf(value) != 'object') return true
    for (let i = 0; i < param.length; i++) {
      if (! value.hasOwnProperty(param[i])) return 'schema.ruleError.required'
    }
    return true
  }, 
  switchRequired: (param, value, lookup) => {
    if (typeOf(param) != 'object' || !('tagProperty' in /** @type {object} */ (param))) throw new Error('invalid parameter')
    if (typeOf(value) != 'object') return true
    const tag = /** @type {string} */ (lookup('0/' + param.tagProperty))
    if (!tag || !param.types[tag]) return 'schema.ruleError.switchRequired'
    const required = param.types[tag]
    if (! Array.isArray(required)) throw new Error('invalid parameter')
    for (let i = 0; i < required.length; i++) {
      if (! value.hasOwnProperty(required[i])) return 'schema.ruleError.switchRequired'
    }
    return true
  }, 
  same: (param, value, lookup) => {
    if (typeof param != 'string') throw new Error('invalid parameter')
    const target = lookup(param)
    if (target !== value) return 'schema.ruleError.same'
    return true
  }, 
  if: (param, value, lookup, rules) => {
    if (typeOf(param) != 'array') throw new Error('invalid parameter')
    const [target, match, then, el = {}] = /** @type {Array} */ (param)
    if (! target || ! match || ! then) throw new Error('invalid parameter')
    const targetValue = lookup(target)
    const targetResult = applyRules(targetValue, match, lookup, rules)
    if (targetResult === true) {
      return applyRules(value, then, lookup, rules)
    } else {
      return applyRules(value, el, lookup, rules)
    }
  }, 
  // TODO: allOf, eitherOf, not
  multipleOf: (param, value) => {
    if (typeof param != 'number') throw new Error('invalid parameter')
    if (typeof value != 'number') return true
    if (value % param === 0) return true
    return 'schema.ruleError.multipleOf'
  }, 
  maximum: (param, value) => {
    if (typeof value != 'number') return true
    if (param >= value) return true
    return 'schema.ruleError.maximum'
  }, 
  exclusiveMaximum: (param, value) => {
    if (typeof value != 'number') return true
    if (param > value) return true
    return 'schema.ruleError.exclusiveMaximum'
  }, 
  minimum: (param, value) => {
    if (typeof value != 'number') return true
    if (param <= value) return true
    return 'schema.ruleError.minimum'
  }, 
  exclusiveMinimum: (param, value) => {
    if (typeof value != 'number') return true
    if (param < value) return true
    return 'schema.ruleError.exclusiveMinimum'
  }, 
  maxLength: (param, value) => {
    if (typeof value != 'string') return true
    if (value.length <= param) return true
    return 'schema.ruleError.maxLength'
  }, 
  minLength: (param, value) => {
    if (typeof value != 'string') return true
    if (value.length >= param) return true
    return (param == 1) ? 'schema.ruleError.minLength0' : 'schema.ruleError.minLength'
  }, 
  'pattern': (param, value) => {
    if (typeof param != 'string') throw new Error('invalid parameter')
    if (typeof value != 'string') return true
    if (new RegExp(param).test(value)) return true
    return 'schema.ruleError.pattern'
  }, 
  maxItems: (param, value) => {
    if (typeof param != 'number') throw new Error('invalid parameter')
    if (! Array.isArray(value)) return true
    if (value.length <= param) return true
    return 'schema.ruleError.maxItems'
  }, 
  minItems: (param, value) => {
    if (typeof param != 'number') throw new Error('invalid parameter')
    if (! Array.isArray(value)) return true
    if (value.length >= param) return true
    return 'schema.ruleError.minItems'
  }
}

/**
 * Validates a value with a schema.
 * @description shallow validation
 * @param {Rules} rules
 * @param {Dictionary} dict
 * @returns {(value:any, slot:Slot, schema:Schema, lookup:LookupFunc) => Slot} 
 */
export const validate = (rules, dict) => (value, slot, schema, lookup) => {
  if (! isJsonValue(value)) {
    const code = (schema && schema.type) ? 'schema.valueError.' + schema.type : 'schema.valueError.generic'
    return {...slot, '@value':value, invalid:true, message:makeMessage(dict, code, null)}
  }

  if (schema) {
    const result = applyRules(value, schema, lookup, rules)
    if (result !== true) {
      const message = makeMessage(dict, result, null)  // TODO make precise message
      return {...slot, '@value':value, invalid:true, message}
    }
  }
  return {...slot, '@value':value, invalid:false, message:''}
}

/**
 * 
 * @param {Json} value 
 * @param {Schema} schema 
 * @param {LookupFunc} lookup 
 * @param {Rules} rules 
 */
export const applyRules = (value, schema, lookup, rules) => {
  for (let p in schema) {
    const f = rules[p]
    if (! f) continue
    const result = f(schema[p], value, lookup, rules)
    if (result !== true) return result
  }
  return true
}

/**
 * 
 * @param {Rules} rules 
 * @param {Dictionary} dict 
 * @returns {(input:string, slot:Slot, schema:Schema) => Slot}
 */
export const coerce = (rules, dict) => (input, slot, schema) => {
  input = "" + input  // coerce to string
  if (! schema) {
    throw new Error('coerce/0: no schema')
  }
  if (! schema.type || typeof schema.type != 'string') {
    throw new Error('coerce/1: type not specified')
  }
  const type = schema.type
  if (['null', 'boolean', 'boolean?', 'integer', 'integer?', 'number', 'number?', 'string'].indexOf(type) == -1) {
    throw new Error('coerce/2: not a coercion enabled type: ' + type)
  }

  switch (type) {
    case 'null': 
      break
    case 'number': 
    case 'number?': 
      const n = +input
      if ("" + n === input) {
        return {'@value':n, input, touched:slot.touched}
      }
      break
    case 'integer': 
    case 'integer?': 
      const i = +input
      if ("" + i === input && i % 1 === 0) {
        return {'@value':i, input, touched:slot.touched}
      }
      break
    case 'boolean': 
    case 'boolean?': 
      if (input === "true" || input === "false") {
        return {'@value':input==="true", input, touched:slot.touched}
      }
      break
    case 'string': 
      return {'@value':input, input, touched:slot.touched}
  }
  if (input == "" && nullable(type)) {
    return {'@value':null, input, touched:slot.touched}
  }
  return {input, touched:slot.touched}
}
