
const nullable = (type) => {
  const lastChar = type.charAt(type.length - 1)
  return type == 'null' || lastChar == '?'
}

const ruleFuns = {
  'enum': (param, value) => {
    for (let i = 0; i < param.length; i++) {
      if (param[i] === value) return true
    }
    return 'should be either of candidates'
  }, 
  'const': (param, value) => {
    if (param === value) return true
    return 'should be %s'
  }, 
  required: (param, value) => {
    if (typeof value != 'object') return true
    for (let i = 0; i < param.length; i++) {
      if (! value.hasOwnProperty(param[i])) return 'no field ' + param[i]
    }
    return true
  }, 
  requiredOneOf: (param, value) => {
    if (typeof value != 'object') return true
    const test = f => value.hasOwnProperty(f)
    let count = 0
    for (let fs of param) {
      if (fs.every(test)) count++
    }
    if (count != 0) return 'should match to any of patterns'
    else if (count != 1) return 'should match exact 1 of patterns'
    return true
  }, 
  // TODO multipleOf(number/integer)
  maximum: (param, value) => {
    if (typeof value != 'number') return true
    if (param >= value) return true
    return 'should be lower than or equals to %s'
  }, 
  exclusiveMaximum: (param, value) => {
    if (typeof value != 'number') return true
    if (param > value) return true
    return 'should be lower than %s'
  }, 
  minimum: (param, value) => {
    if (typeof value != 'number') return true
    if (param <= value) return true
    return 'should be greater than or equals to %s'
  }, 
  exclusiveMinimum: (param, value) => {
    if (typeof value != 'number') return true
    if (param < value) return true
    return 'should be greater than %s'
  }, 
  maxLength: (param, value) => {
    if (typeof value != 'string') return true
    if (value.length <= param) return true
    return 'should be shorter than %s'
  }, 
  minLength: (param, value) => {
    if (typeof value != 'string') return true
    if (value.length >= param) return true
    return 'should be longer than %s'
  }, 
  'pattern': (param, value) => {
    if (typeof value != 'string') return true
    if (new RegExp(param).test(value)) return true
    return 'pattern unmatched'
  }
  // TODO? maxItems
  // TODO? minItems
  // TODO? format
}

const emptyObject = {}

const cook = (value, slot, schema) => {
  for (let p in schema) {
    const f = ruleFuns[p]
    if (! f) continue
    const result = ruleFuns[p](schema[p], value)
    if (result !== true) {
      return {...slot, '@value':value, invalid:true, message:result}
    }
  }
  return {...slot, '@value':value, invalid:false, message:''}
}

const testType = (value, type) => {
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
// @return {input, @value, invalid, touched, message}
export const validate = (value, schema) => {
  const slot = testType(value, schema.type)
    ? cook(value, emptyObject, schema)
    : {'@value':value, invalid:true, touched:value !== null && value !== "", message:'invalid type'}

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

// {input, touched} => {input, @value, invalid, touched, message}
export const coerce = (slot, schema) => {
  if (slot.input == "") {
    if (nullable(schema.type)) {
      return cook(null, slot, schema)
    } else if (schema.type == "string") {
      return cook("", slot, schema)
    } else {
      return {...slot, invalid:true, message:"Input here"}
    }
  }
  switch (schema.type) {
    case 'number':  // FALLTHRU
    case 'number?': 
      const n = +slot.input
      if ("" + n !== slot.input) {
        return {...slot, invalid:true, message:"Not a number"}
      }
      return cook(n, slot, schema)
    case 'integer':  // FALLTHRU
    case 'integer?': 
      const i = +slot.input
      if ("" + i !== slot.input) {
        return {...slot, invalid:true, message:"Not an integer"}
      } else if (i % 1 !== 0) {
        return {...slot, invalid:true, message:"Not an integer"}
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
        return {...slot, invalid:true, message:"Not a boolean"}
      }
      return cook(b, slot, schema)
    default: 
      throw new Error('unknown type: ' + schema.type)
  }
}