
import * as U from '../src/core/utils'

export const run = (assert, assertError, assertUndefined) => {
  assert(1, () => U.appendPath('/a/b', '0/c/d'), '/a/b/c/d')
  assert(1.1, () => U.appendPath('', '0/c'), '/c')
  assert(1.2, () => U.appendPath('/a/b', '/x/y'), '/x/y')
  assert(1.3, () => U.appendPath('/a/b/c', '1/d/e'), '/a/b/d/e')
  assert(1.4, () => U.appendPath('/a', '3/z'), '/z')
  assert(1.5, () => U.appendPath('/a/b', '1'), '/a')
  assert(1.6, () => U.appendPath('/a/b/c', '3'), '')

  assert(2, () => U.commonPath('/a/b/c', '/a/b/c'), '/a/b/c')
  assert(2.1, () => U.commonPath('/a/b/c', '/a/b/d'), '/a/b')
  assert(2.2, () => U.commonPath('/a/b/c', '/a'), '/a')
  assert(2.3, () => U.commonPath('/a/b/c', ''), '')
}