
const nullable = (type) => {
  if (! type) return true
  const lastChar = type.charAt(type.length - 1)
  return type == 'null' || lastChar == '?'
}

const ruleFuns = {
  'enum': (param, value) => {
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
    if (typeof value != 'object') return true
    for (let i = 0; i < param.length; i++) {
      if (! value.hasOwnProperty(param[i])) return 'schema.ruleError.required'
    }
    return true
  }, 
  requiredAnyOf: (param, value) => {
    if (typeof value != 'object') return true
    const test = f => value.hasOwnProperty(f)
    for (let fs of param) {
      if (fs.every(test)) return true
    }
    return 'schema.ruleError.requiredAnyOf'
  }, 
  // TODO multipleOf(number/integer)
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
    if (typeof value != 'string') return true
    if (new RegExp(param).test(value)) return true
    return 'schema.ruleError.pattern'
  }
  // TODO maxItems
  // TODO minItems
  // TODO formats of email, url, ipv4, ...
}

const emptyObject = {}

const cook = (value, slot, schema) => {
  for (let p in schema) {
    const f = ruleFuns[p]
    if (! f) continue
    const result = ruleFuns[p](schema[p], value)
    if (result !== true) {
      return {...slot, '@value':value, invalid:true, ecode:result, eparam:schema[p]}
    }
  }
  return {...slot, '@value':value, invalid:false, ecode:'', eparam:null}
}

const testType = (value, type) => {
  if (! type) return true
  if (value === null) {
    if (! nullable(type)) {
      return false
    }
  } else {
    switch (type) {
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
        return true
      case 'record':  // FALLTHRU
      case 'record?': 
        return (typeof value == 'object' && value !== null)
      case 'list':  // FALLTHRU
      case 'list?': 
        return Array.isArray(value)
      default: 
        throw new Error('unknown type: ' + type)
    }
  }

}

// shallow validation
// @return {input, @value, invalid, touched, ecode, eparam}
export const validate = (value, schema) => {
  const slot = !schema ? {'@value':value, invalid:false, touched:value !== null && value !== "", ecode:'', eparam:null} 
    : testType(value, schema.type) ? cook(value, emptyObject, schema)
    : {'@value':value, invalid:true, touched:value !== null && value !== "", ecode:'schema.typeError', eparam:null}

  if (! slot.hasOwnProperty('input')) {
    // add input meta if possible
    switch (value === null ? 'null' : typeof value) {
      case 'null': 
        slot.input = ""
        break
      case 'number':  // FALLTHRU
      case 'number?':
        slot.input = "" + value
        break
      case 'string': 
        slot.input = value
        break
      case 'boolean':  // FALLTHRU
      case 'boolean?': 
        slot.input = value ? 'true' : 'false'
        break
      default: 
        slot.input = ""
    }
  }
  return slot
}

// {input, touched} => {input, @value, invalid, touched, ecode, eparam}
export const coerce = (slot, schema) => {
  if (! schema) {
    throw new Error('coerce/0: no schema')
  }
  if (! schema.type) {
    throw new Error('coerce/1: type not specified')
  }
  if (slot.input == "") {
    if (nullable(schema.type)) {
      return cook(null, slot, schema)
    } else if (schema.type == "string") {
      return cook("", slot, schema)
    } else {
      return {...slot, invalid:true, ecode:'schema.scanError.empty', eparam:null}
    }
  }
  switch (schema.type) {
    case 'number':  // FALLTHRU
    case 'number?': 
      const n = +slot.input
      if ("" + n !== slot.input) {
        return {...slot, invalid:true, ecode:'schema.scanError.number', eparam:null}
      }
      return cook(n, slot, schema)
    case 'integer':  // FALLTHRU
    case 'integer?': 
      const i = +slot.input
      if ("" + i !== slot.input || i % 1 !== 0) {
        return {...slot, invalid:true, ecode:'schema.scanError.integer', eparam:null}
      }
      return cook(n, slot, schema)
    case 'string': 
      return cook(slot.input, slot, schema)
    case 'boolean':  // FALLTHRU
    case 'boolean?': 
      const b = (slot.input === "true") ? true
              : (slot.input === "false") ? false
              : null
      if (b === null) {
        return {...slot, invalid:true, ecode:'schema.scanError.boolean', eparam:null}
      }
      return cook(b, slot, schema)
    default: 
      throw new Error('unknown type: ' + schema.type)
  }
}