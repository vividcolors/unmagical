
import * as E from './env'

const validate = (value, path) => {
  console.log('validate called', value, path)
  return {'@value':value}
}

const assert = (ident, thunk, rv) => {
  const lv = thunk()
  if (lv == rv) {
    console.log('ASSERT', ident, 'OK')
  } else {
    console.log('ASSERT', ident, 'NG', lv, rv)
  }
}

const assertError = (ident, thunk, match) => {
  let status = null
  try {
    const lv = thunk()
    status = "no error"
  } catch (e) {
    if (e instanceof Error && e.message.startsWith(match)) {
      console.log('ASSERT', ident, 'OK')
      return
    } else {
      status = "matching failure: " + e.message
    }
  }
  console.log('ASSERT', ident, 'NG', status)
}

export const testEnv = () => {
  const json = {
    name: 'Bob', 
    age: 24, 
    buddies: [
      'Mam', 'Dad'
    ]
  }

  let env = E.fromJson(json, validate)
  assert(1, () => E.lookup('/name', env), 'Bob')

  env = E.add('/email', 'info@example.com', env)
  assert(2, () => E.lookup('/email', env), 'info@example.com')
  assertError(2.1, () => E.lookup('/foo', env), 'lookup/')

  assert(3, () => E.lookup('/buddies/1', env), 'Dad')

  env = E.add('/buddies/1', 'Pochi', env)
  assert(4, () => E.lookup('/buddies/1', env), 'Pochi')
  assertError(4.1, () => E.lookup('/buddies/5', env), 'lookup/')

  env = E.goTo('/buddies', env)
  assert(5, () => E.lookup('0/1', env), 'Pochi')
  assertError(5.1, () => E.lookup('0/5', env), 'lookup/')
  env = E.goTo('', env)

  env = E.add('/buddies/-', 'Komino', env)
  assert(5, () => E.lookup('/buddies/3', env), 'Komino')

  env = E.remove('/buddies/3', env)
  assertError(6, () => E.lookup('/buddies/3', env), 'lookup/')

  env = E.remove('/email', env)
  assertError(7, () => E.lookup('/email', env), 'lookup/')
  assertError(7.1, () => E.remove('/email', env), 'remove/')

  env = E.setm('/name', 'invalid', true, env)
  assert(8, () => E.getm('/name', 'invalid', false, env), true)
}

testEnv()