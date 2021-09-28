
import * as E from '../src/env'

const validate = (value, schema) => {
  //console.log('validate called', value, path)
  return {'@value':value}
}

export const run = (assert, assertError) => {
  const json = {
    name: 'Bob', 
    age: 24, 
    buddies: [
      'Mam', 'Dad'
    ]
  }

  let env = E.makeEnv(json, {}, validate)
  assert(1, () => E.extract('/name', env), 'Bob')
  assert(1.1, () => E.test('/name', env), true)
  assert(1.2, () => E.test('/foo', env), false)

  env = E.add('/email', 'info@example.com', env)
  assert(2, () => E.extract('/email', env), 'info@example.com')
  assertError(2.1, () => E.extract('/foo', env), 'extract/')

  assert(3, () => E.extract('/buddies/1', env), 'Dad')

  env = E.add('/buddies/1', 'Pochi', env)  // Mam,Pochi,Dad
  assert(4, () => E.extract('/buddies/1', env), 'Pochi')
  assertError(4.1, () => E.extract('/buddies/5', env), 'extract/')

  env = E.add('/buddies/-', 'Komino', env)  // Mam,Pochi,Dad,Komino
  assert(5, () => E.extract('/buddies/3', env), 'Komino')

  env = E.remove('/buddies/3', env)  // Mam,Pochi,Dad
  assert(6, () => E.extract('/buddies', env).join(','), 'Mam,Pochi,Dad')
  assertError(6.1, () => E.extract('/buddies/3', env), 'extract/')

  env = E.remove('/email', env)
  assertError(7, () => E.extract('/email', env), 'extract/')
  assertError(7.1, () => E.remove('/email', env), 'remove/')

  assert(8, () => {
    let slot80 = E.getSlot('/name', env)
    slot80 = {...slot80, invalid:true}
    env = E.setSlot('/name', slot80, env)
    slot80 = E.getSlot('/name', env)
    return slot80.invalid
  }, true)

  env = E.replace('/age', 30, env)
  assert(9, () => E.extract('/age', env), 30)

  env = E.add('/id', 'TS1101', env)
  env = E.move('/id', '/employeeId', env)
  assert(10, () => E.extract('/employeeId', env), 'TS1101')
  assertError(10.1, () => E.extract('/id', env), 'extract/')

  env = E.copy('/employeeId', '/id', env)
  assert(11, () => E.extract('/employeeId', env), 'TS1101')
  assert(11.1, () => E.extract('/id', env), 'TS1101')

  assert(11.9, () => E.extract('/buddies', env).join(','), 'Mam,Pochi,Dad')
  env = E.move('/buddies/2', '/buddies/0', env)  // Dad,Mam,Pochi
  assert(12, () => E.extract('/buddies', env).join(','), 'Dad,Mam,Pochi')

  env = E.copy('/buddies/0', '/buddies/2', env)  // Dad,Mam,Dad,Pochi
  assert(13, () => E.extract('/buddies', env), 'Dad,Mam,Dad,Pochi')

  env = E.mapDeep((slot, path) => ({...slot, message:'yeah'}), '/buddies', env)
  assert(14, () => E.getSlot('/buddies', env).message, 'yeah')
  assert(14.1, () => E.getSlot('/buddies/0', env).message, 'yeah')
  assert(14.2, () => E.getSlot('/name', env).message || '', '')

  assert(15, () => {
    return E.reduceDeep((cur, slot, path) => {
      if (path == '/buddies') return cur
      return cur + `[${slot['@value']}]`
    }, "", '/buddies', env)
  }, '[Dad][Mam][Dad][Pochi]')
}

