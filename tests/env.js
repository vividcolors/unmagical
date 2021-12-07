
import * as E from '../src/core/env'

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

  let env = E.makeEnv(json, {}, validate, true)
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
    let mdr80 = E.getMdr('/name', env)
    mdr80 = {...mdr80, invalid:true}
    env = E.setMdr('/name', mdr80, env)
    mdr80 = E.getMdr('/name', env)
    return mdr80.invalid
  }, true)

  env = E.replace('/age', 30, env)
  assert(9, () => E.extract('/age', env), 30)
  let env2 = E.replace('', {foo:1}, env)
  assert(9.1, () => E.extract('/foo', env2), 1)
  assertError(9.2, () => E.extract('/age', env2), 'extract/')

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

  env = E.mapDeep((mdr, path) => ({...mdr, message:'yeah'}), '/buddies', env)
  assert(14, () => E.getMdr('/buddies', env).message, 'yeah')
  assert(14.1, () => E.getMdr('/buddies/0', env).message, 'yeah')
  assert(14.2, () => E.getMdr('/name', env).message || '', '')

  assert(15, () => {
    return E.reduceDeep((cur, mdr, path) => {
      if (path == '/buddies') return cur
      return cur + `[${mdr.value}]`
    }, "", '/buddies', env)
  }, '[Dad][Mam][Dad][Pochi]')

  env = E.makeEnv(json, {}, validate, true)
  assert(16, () => E.endUpdateTracking(env)[0], "")
  env = E.endUpdateTracking(env)[1]
  env = E.beginUpdateTracking(env)
  env = E.replace('/age', 30, env)
  assert(16.1, () => E.endUpdateTracking(env)[0], "/age")
  env = E.add('/name', 'Jack', env)
  assert(16.2, () => E.endUpdateTracking(env)[0], "")
  env = E.makeEnv(json, {}, validate, false)
  env = E.beginUpdateTracking(env)
  env = E.add('/buddies/-', 'Puppy', env)
  assert(16.3, () => E.endUpdateTracking(env)[0], "/buddies")
  env = E.remove('/name', env)
  assert(16.4, () => E.endUpdateTracking(env)[0], "")
}

