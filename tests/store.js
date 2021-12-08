
import * as E from '../src/core/store'

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

  let store = E.makeStore(json, {}, validate, true)
  assert(1, () => E.get('/name', store), 'Bob')
  assert(1.1, () => E.test('/name', store), true)
  assert(1.2, () => E.test('/foo', store), false)

  store = E.add('/email', 'info@example.com', store)
  assert(2, () => E.get('/email', store), 'info@example.com')
  assertError(2.1, () => E.get('/foo', store), 'get/')

  assert(3, () => E.get('/buddies/1', store), 'Dad')

  store = E.add('/buddies/1', 'Pochi', store)  // Mam,Pochi,Dad
  assert(4, () => E.get('/buddies/1', store), 'Pochi')
  assertError(4.1, () => E.get('/buddies/5', store), 'get/')

  store = E.add('/buddies/-', 'Komino', store)  // Mam,Pochi,Dad,Komino
  assert(5, () => E.get('/buddies/3', store), 'Komino')

  store = E.remove('/buddies/3', store)  // Mam,Pochi,Dad
  assert(6, () => E.get('/buddies', store).join(','), 'Mam,Pochi,Dad')
  assertError(6.1, () => E.get('/buddies/3', store), 'get/')

  store = E.remove('/email', store)
  assertError(7, () => E.get('/email', store), 'get/')
  assertError(7.1, () => E.remove('/email', store), 'remove/')

  assert(8, () => {
    let mdr80 = E.getMdr('/name', store)
    mdr80 = {...mdr80, invalid:true}
    store = E.setMdr('/name', mdr80, store)
    mdr80 = E.getMdr('/name', store)
    return mdr80.invalid
  }, true)

  store = E.replace('/age', 30, store)
  assert(9, () => E.get('/age', store), 30)
  let store2 = E.replace('', {foo:1}, store)
  assert(9.1, () => E.get('/foo', store2), 1)
  assertError(9.2, () => E.get('/age', store2), 'get/')

  store = E.add('/id', 'TS1101', store)
  store = E.move('/id', '/employeeId', store)
  assert(10, () => E.get('/employeeId', store), 'TS1101')
  assertError(10.1, () => E.get('/id', store), 'get/')

  store = E.copy('/employeeId', '/id', store)
  assert(11, () => E.get('/employeeId', store), 'TS1101')
  assert(11.1, () => E.get('/id', store), 'TS1101')

  assert(11.9, () => E.get('/buddies', store).join(','), 'Mam,Pochi,Dad')
  store = E.move('/buddies/2', '/buddies/0', store)  // Dad,Mam,Pochi
  assert(12, () => E.get('/buddies', store).join(','), 'Dad,Mam,Pochi')

  store = E.copy('/buddies/0', '/buddies/2', store)  // Dad,Mam,Dad,Pochi
  assert(13, () => E.get('/buddies', store), 'Dad,Mam,Dad,Pochi')

  store = E.mapDeep((mdr, path) => ({...mdr, message:'yeah'}), '/buddies', store)
  assert(14, () => E.getMdr('/buddies', store).message, 'yeah')
  assert(14.1, () => E.getMdr('/buddies/0', store).message, 'yeah')
  assert(14.2, () => E.getMdr('/name', store).message || '', '')

  assert(15, () => {
    return E.reduceDeep((cur, mdr, path) => {
      if (path == '/buddies') return cur
      return cur + `[${mdr.value}]`
    }, "", '/buddies', store)
  }, '[Dad][Mam][Dad][Pochi]')

  store = E.makeStore(json, {}, validate, true)
  assert(16, () => E.endUpdateTracking(store)[0], "")
  store = E.endUpdateTracking(store)[1]
  store = E.beginUpdateTracking(store)
  store = E.replace('/age', 30, store)
  assert(16.1, () => E.endUpdateTracking(store)[0], "/age")
  store = E.add('/name', 'Jack', store)
  assert(16.2, () => E.endUpdateTracking(store)[0], "")
  store = E.makeStore(json, {}, validate, false)
  store = E.beginUpdateTracking(store)
  store = E.add('/buddies/-', 'Puppy', store)
  assert(16.3, () => E.endUpdateTracking(store)[0], "/buddies")
  store = E.remove('/name', store)
  assert(16.4, () => E.endUpdateTracking(store)[0], "")
}

