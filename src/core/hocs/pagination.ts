
import {UnmagicalAction, UnmagicalState, UnmagicalActions, API} from '../framework'
import {NodeName, Children, h, UnmagicalComponent} from '../components'


const getSiblings = (pageNo:number, width:number, firstPageNo:number, lastPageNo:number):number[] => {
  const rv = []
  for (let i = pageNo - width; i <= pageNo + width; i++) {
    if (i < firstPageNo) continue
    if (i > lastPageNo) continue
    rv.push(i)
  }
  return rv
}


export type PaginationExtraProps = {
  listPath: string, 
  width?: number, 
  pageProperty?: string, 
  limitProperty?: string
}

export type PaginationAutoProps = {
  listPath: string, 
  current: number|null, 
  prev: number|null, 
  next: number|null, 
  first: number|null, 
  last: number|null, 
  siblings: number[]
}

export const playPagination = <OtherAttrs extends {}>(C:NodeName<PaginationAutoProps & OtherAttrs>):NodeName<PaginationExtraProps & OtherAttrs> => {
  return (props, children) => (state, actions) => {
    const {listPath, width = 2, pageProperty = 'page', limitProperty = 'limit', ...attributes} = props
    const query = API.extract(listPath + '/query', state.env)
    const totalCount = +API.extract(listPath + '/totalCount', state.env)
    const page = query[pageProperty]
    if (totalCount > 0) {
      const first = 1
      const last = Math.ceil(totalCount / query[limitProperty])
      const siblings = getSiblings(page, width, first, last)
      const attrs:PaginationAutoProps = {
        ...attributes, 
        listPath, 
        current: page, 
        prev: first < page ? page - 1 : null, 
        next: page < last ? page + 1 : null, 
        first: first < page - width ? first : null, 
        last: page + width < last ? last : null, 
        siblings
      }
      return h(C, attrs, ...children)
    } else {
      const attrs:PaginationAutoProps = {
        ...attributes, 
        listPath, 
        current: null, 
        prev: null, 
        next: null, 
        first: null, 
        last: null, 
        siblings: []
      }
      return h(C, attrs, ...children)
    }
  }
}