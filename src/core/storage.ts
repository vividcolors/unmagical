/**
 * Repository implementation by Web Storage API
 * @module core/storage
 */

import {SingularRepository} from './updates'

export const makeStorageRepository = (storage:Storage, keyName:string):SingularRepository => {
  return {
    get: () => {
      return new Promise((fulfill) => {
        const s = storage.getItem(keyName)
        fulfill(JSON.parse(s))
      })
    }, 
    replace: (entity) => {
      return new Promise((fulfill) => {
        const s = JSON.stringify(entity)
        storage.setItem(keyName, s)
        fulfill(null)
      })
    }
  }
}