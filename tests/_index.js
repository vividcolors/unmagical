
import * as E from './env'

const assert = (ident, thunk, rv) => {
  const lv = thunk()
  if (lv == rv) {
    console.log('- ASSERT', ident, 'OK')
  } else {
    console.log('! ASSERT', ident, 'NG', lv, rv)
  }
}

const assertError = (ident, thunk, match) => {
  let status = null
  try {
    const lv = thunk()
    status = "no error"
  } catch (e) {
    if (e instanceof Error && e.message.startsWith(match)) {
      console.log('- ASSERT', ident, 'OK')
      return
    } else {
      status = "matching failure: " + e.message
    }
  }
  console.log('! ASSERT', ident, 'NG', status)
}

const callRun = (m, name) => {
  console.log('TEST START: ' + name)
  m.run(assert, assertError)
  console.log('TEST DONE: ' + name)
  console.log('')
}

callRun(E, 'env')