
import * as U from './utils'
import * as E from './store'
import * as S from './schema'

const assert = (ident, thunk, rv) => {
  const lv = thunk()
  if (lv == rv) {
    console.log('- ASSERTION', ident, 'OK')
  } else {
    console.log('! ASSERTION', ident, 'NG', lv, rv)
  }
}

const assertUndefined = (ident, thunk) => {
  const lv = thunk()
  if (typeof lv == "undefined") {
    console.log('- ASSERTION', ident, 'OK')
  } else {
    console.log('! ASSERTION', ident, 'NG', lv, "undefined")
  }
}

const assertError = (ident, thunk, match) => {
  let status = null
  try {
    const lv = thunk()
    status = "no error"
  } catch (e) {
    if (e instanceof Error && e.message.startsWith(match)) {
      console.log('- ASSERTION', ident, 'OK')
      return
    } else {
      status = "matching failure: " + e.message
    }
  }
  console.log('! ASSERTION', ident, 'NG', status)
}

const callRun = (m, name) => {
  console.log('TEST START: ' + name)
  m.run(assert, assertError, assertUndefined)
  console.log('TEST DONE: ' + name)
  console.log('')
}

callRun(U, 'utils')
callRun(E, 'store')
callRun(S, 'schema')