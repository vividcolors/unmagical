/**
 * Data schema and validation
 * 
 * @module core/schema
 */

import {isJsonValue} from './utils'
import {MgError} from './errors'
import * as R from './rules'

/**
 * Json array to silence tsc.
 * 
 * @category Types
 */
export interface JsonArray extends Array<Json> {}

/**
 * Json Object to silence tsc.
 * 
 * @category Types
 */
export interface JsonObject extends Record<string,Json> {}

/**
 * Simple Json type definition
 * 
 * @category Types
 */
export type Json = null | number | string | boolean | JsonArray | JsonObject

/**
 * Type of lookup function used in validation rules.
 * 
 * @category Types
 */
export type Lookup = (path:string) => Json

/**
 * Type of validation rule functions.<br>
 * They returns true if validation succeeded.<br>
 * Otherwise return MgError.
 * 
 * @category Types
 */
export type RuleFunc = (param:Json, value:Json, lookup:Lookup, rules:Rules) => true|MgError

/**
 * Named set of Rule functions.
 * 
 * @category Types
 */
export type Rules = Record<string,RuleFunc>

/**
 * The schema is modeled after JSON Schema.
 * 
 * @category Types
 */
export type Schema = Record<string,Json>

/**
 * Compiled schema.<br>
 * You can lookup a schema by a normalized path.
 * 
 * @category Types
 */
export type SchemaDb = Record<string,Schema>

/**
 * Mdr (abbreviation of Meta data record) is where meta data of each value of the model data comes. 
 * 
 * @category Types
 */
export type Mdr = {
  /**
   * `true` if the value is invalid.
   */
  invalid?: boolean, 
  /**
   * Non-null if the value has error.
   */
  error?: MgError, 
  /**
   * `true` if the user changed this value.
   */
  touched?: boolean, 
  /**
   * Raw string of user input.
   */
  input?: string, 
  /**
   * the value itself of this value.
   */
  value?: Json
}

/**
 * Type of validation function.
 * 
 * @category Types
 */
export type Validate = (value:any, mdr:Mdr, schema:Schema, lookup:Lookup) => Mdr


/**
 * Returns true if type specification allows null.
 * 
 * @category Entries
 */
export const nullable = (type:string):boolean => {
  if (! type) return true
  const lastChar = type.charAt(type.length - 1)
  return type == 'null' || lastChar == '?'
}

/**
 * Builds a map from path to schema.
 * 
 * @category Entries
 */
export const buildDb = (schema:Schema):SchemaDb => {
  const db = {}
  const inner = (schema:Schema, path:string) => {
    db[path] = schema
    switch (schema.type) {
      case 'object': 
      case 'object?': 
        for (let p in schema.properties as Record<string,Json>) {
          inner(schema.properties[p], path + '/' + p)
        }
        break
      case 'array': 
      case 'array?': 
        inner(schema.items as Schema, path + '/*')
        break
      default: 
        break
    }
  }
  inner(schema, "")
  return db
}

/**
 * default validation rules.
 * Rules prefixed by '$' is registered by its true name. Use `defaultRules.if` instead of `defaultRules.$if`.
 * 
 * @category Entries
 */
export const defaultRules:Rules = {
  type:R.type, 'enum':R.$enum, 'const':R.$const, notEmpty:R.notEmpty, required:R.required, switchRequired:R.switchRequired, same:R.same, 'if':R.$if, 
  // TODO: allOf, eitherOf, not
  multipleOf:R.multipleOf, maximum:R.maximum, exclusiveMaximum:R.exclusiveMaximum, minimum:R.minimum, exclusiveMinimum:R.exclusiveMinimum, maxLength:R.maxLength, minLength:R.minLength, pattern:R.pattern, maxItems:R.maxItems, minItems:R.minItems
}

/**
 * Validates a value with a schema. It is a shallow validation.
 * 
 * @param rules set of validation rules, which means that you can add your own rules.
 * 
 * @category Entries
 */
export const validate = (rules:Rules):Validate => (value, mdr, schema, lookup) => {
  if (! isJsonValue(value)) {
    if (schema && schema.type) {
      const error = {code:'type.'+schema.type, detail:'given value: '+value}
      return {...mdr, value, invalid:true, error}
    } else {
      const error = {code:'value', detail:'given value: '+value}
      return {...mdr, value, invalid:true, error}
    }
  }

  if (schema) {
    const result = applyRules(value, schema, lookup, rules)
    if (result !== true) {
      return {...mdr, value, invalid:true, error:result}
    }
  }
  return {...mdr, value, invalid:false, error:null}
}

/**
 * 
 * 
 * 
 * @category Entries
 */
export const applyRules = (value:any, schema:Schema, lookup:Lookup, rules:Rules):true|MgError => {
  for (let p in schema) {
    const f = rules[p]
    if (! f) continue
    const result = f(schema[p], value, lookup, rules)
    if (result !== true) return result
  }
  return true
}

/**
 * Executes coercion. Coercion is a process that interpretes a user input of string into a value of schema-specified type.
 * 
 * @category Entries
 */
export const coerce = (input:string, mdr:Mdr, schema:Schema):Mdr => {
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
        return {value:n, input, touched:mdr.touched}
      }
      break
    case 'integer': 
    case 'integer?': 
      const i = +input
      if ("" + i === input && i % 1 === 0) {
        return {value:i, input, touched:mdr.touched}
      }
      break
    case 'boolean': 
    case 'boolean?': 
      if (input === "true" || input === "false") {
        return {value:input==="true", input, touched:mdr.touched}
      }
      break
    case 'string': 
      return {value:input, input, touched:mdr.touched}
  }
  if (input == "" && nullable(type)) {
    return {value:null, input, touched:mdr.touched}
  }
  return {input, touched:mdr.touched}
}


