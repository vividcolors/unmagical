//@ts-check
/** @module core/schema */

import {emptyObject, typeOf, isJsonValue, appendPath} from './utils'

/**
 * 
 * @typedef {import("./errors").MgError} MgError
 */
/**
 * 
 * @callback LookupFunc
 * @param {string} path
 * @returns {Json}
 */
/**
 * 
 * @callback RuleFunc
 * @param {Json} param
 * @param {Json} value
 * @param {LookupFunc} lookup
 * @param {Rules} rules
 * @returns {true|MgError}
 */
/**
 * 
 * @typedef {null|number|string|boolean|array|object} Json 
 */
/**
 * 
 * @typedef {Object} Slot
 * @property {boolean} [invalid]
 * @property {MgError} [error]
 * @property {boolean} [touched]
 * @property {string} [input]
 * @property {Json} [value]
 */
/**
 * 
 * @callback ValidateFunc
 * @param {any} value
 * @param {Slot} slot0
 * @param {Schema} schema
 * @param {LookupFunc} lookup
 * @returns {Slot}
 */
/**
 * 
 * @typedef {Record<string,Json>} Schema
 */
/**
 * 
 * @typedef {Record<string,RuleFunc>} Rules
 */
/**
 * 
 * @typedef {Record<string,Schema>} SchemaDb
 */

/**
 * Returns true if type specification allows null.
 * @function
 * @private
 * @param {string|null|undefined} type a type in schema
 */
const nullable = (type) => {
  if (! type) return true
  const lastChar = type.charAt(type.length - 1)
  return type == 'null' || lastChar == '?'
}

/**
 * Builds a map from path to schema.
 * @function
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
 * Returns true if the value is in an specified type
 * @function
 * @private
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
 * default validation rules.
 * @type {Rules}
 */
export const defaultRules = {
  type: (param, value) => {
    if (typeof param != 'string') throw new Error('invalid type')
    const result = testType(value, param)
    if (! result) return {code:'type.'+param}
    return true
  }, 
  'enum': (param, value) => {
    if (! Array.isArray(param)) throw new Error('invalid parameter')
    for (let i = 0; i < param.length; i++) {
      if (param[i] === value) return true
    }
    return {code:'rule.enum'}
  }, 
  'const': (param, value) => {
    if (param === value) return true
    switch (typeOf(param)) {
      case 'string': 
      case 'number': 
      case 'null': 
      case 'boolean': 
        return {code:'rule.const', hint: /** @type {string|number|null|boolean} */(param)}
      default: 
        return {code:'rule.const.nohint'}
    }
  }, 
  notEmpty: (_param, value) => {
    if (typeOf(value) != 'string') return true
    if (value !== '') return true
    return {code:'rule.notEmpty'}
  }, 
  required: (param, value) => {
    if (! Array.isArray(param)) throw new Error('invalid parameter')
    if (typeOf(value) != 'object') return true
    for (let i = 0; i < param.length; i++) {
      if (! value.hasOwnProperty(param[i])) return {code:'rule.required', hint:param[i]}
    }
    return true
  }, 
  switchRequired: (param, value, lookup) => {
    if (typeOf(param) != 'object' || !('tagProperty' in /** @type {object} */ (param))) throw new Error('invalid parameter')
    if (typeOf(value) != 'object') return true
    const tag = /** @type {string} */ (lookup('0/' + param.tagProperty))
    if (! tag) return {code:'rule.switchRequired.nohint', decription:'no tag'}
    if (! param.types[tag]) return {code:'rule.switchRequired.nohint', detail:'no type'}
    const required = param.types[tag]
    if (! Array.isArray(required)) throw new Error('invalid parameter')
    for (let i = 0; i < required.length; i++) {
      if (! value.hasOwnProperty(required[i])) return {code:'rule.switchRequired', hint:required[i]}
    }
    return true
  }, 
  same: (param, value, lookup) => {
    if (typeof param != 'string') throw new Error('invalid parameter')
    const target = lookup(param)
    if (target !== value) {
      switch (typeOf(target)) {
        case 'string': 
        case 'number': 
        case 'null': 
        case 'boolean': 
          return {code:'rule.same', hint: /** @type {string|number|null|boolean} */(target)}
        default: 
          return {code:'rule.same.nohint'}
      }
    }
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
    return {code:'rule.multipleOf', hint:param}
  }, 
  maximum: (param, value) => {
    if (typeof value != 'number') return true
    if (param >= value) return true
    return {code:'rule.maximum', hint: /** @type {number} */ (param)}
  }, 
  exclusiveMaximum: (param, value) => {
    if (typeof value != 'number') return true
    if (param > value) return true
    return {code:'rule.exclusiveMaximum', hint: /** @type {number} */ (param)}
  }, 
  minimum: (param, value) => {
    if (typeof value != 'number') return true
    if (param <= value) return true
    return {code:'rule.minimum', hint: /** @type {number} */ (param)}
  }, 
  exclusiveMinimum: (param, value) => {
    if (typeof value != 'number') return true
    if (param < value) return true
    return {code:'rule.exclusiveMinimum', hint: /** @type {number} */ (param)}
  }, 
  maxLength: (param, value) => {
    if (typeof value != 'string') return true
    if (value.length <= param) return true
    return {code:'rule.maxLength', hint: /** @type {number} */ (param)}
  }, 
  minLength: (param, value) => {
    if (typeof value != 'string') return true
    if (value.length >= param) return true
    return {code:'rule.minLength', hint: /** @type {number} */ (param)}
  }, 
  'pattern': (param, value) => {
    if (typeof param != 'string') throw new Error('invalid parameter')
    if (typeof value != 'string') return true
    if (new RegExp(param).test(value)) return true
    return {code:'rule.pattern', hint: /** @type {string} */ (param)}
  }, 
  maxItems: (param, value) => {
    if (typeof param != 'number') throw new Error('invalid parameter')
    if (! Array.isArray(value)) return true
    if (value.length <= param) return true
    return {code:'rule.maxItems', hint: /** @type {number} */ (param)}
  }, 
  minItems: (param, value) => {
    if (typeof param != 'number') throw new Error('invalid parameter')
    if (! Array.isArray(value)) return true
    if (value.length >= param) return true
    return {code:'rule.minItems', hint: /** @type {number} */ (param)}
  }
}

/**
 * Validates a value with a schema.
 * @function
 * @description shallow validation
 * @param {Rules} rules
 * @returns {ValidateFunc} 
 */
export const validate = (rules) => (value, slot, schema, lookup) => {
  if (! isJsonValue(value)) {
    if (schema && schema.type) {
      const error = {code:'type.'+schema.type, detail:'given value: '+value}
      return {...slot, value, invalid:true, error}
    } else {
      const error = {code:'value', detail:'given value: '+value}
      return {...slot, value, invalid:true, error}
    }
  }

  if (schema) {
    const result = applyRules(value, schema, lookup, rules)
    if (result !== true) {
      return {...slot, value, invalid:true, error:result}
    }
  }
  return {...slot, value, invalid:false, error:null}
}

/**
 * 
 * @function
 * @param {Json} value 
 * @param {Schema} schema 
 * @param {LookupFunc} lookup 
 * @param {Rules} rules 
 * @returns {true|MgError}
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
 * @function
 * @param {string} input
 * @param {Slot} slot
 * @param {Schema} schema
 * @returns {Slot}
 */
export const coerce = (input, slot, schema) => {
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
        return {value:n, input, touched:slot.touched}
      }
      break
    case 'integer': 
    case 'integer?': 
      const i = +input
      if ("" + i === input && i % 1 === 0) {
        return {value:i, input, touched:slot.touched}
      }
      break
    case 'boolean': 
    case 'boolean?': 
      if (input === "true" || input === "false") {
        return {value:input==="true", input, touched:slot.touched}
      }
      break
    case 'string': 
      return {value:input, input, touched:slot.touched}
  }
  if (input == "" && nullable(type)) {
    return {value:null, input, touched:slot.touched}
  }
  return {input, touched:slot.touched}
}
