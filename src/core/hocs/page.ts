
import {UnmagicalAction, UnmagicalState, UnmagicalActions, API} from '../framework'
import {NodeName, Children, h, UnmagicalComponent} from '../components'


export type PageExtraProps = {
  index: number, 
  name: string
}

export type PageAutoProps = {
  index: number, 
  name: string, 
  shown: boolean
}

export const playPage = (nullIfHidden:boolean) => <OtherAttrs extends {}>(C:NodeName<PageAutoProps & OtherAttrs>):NodeName<PageExtraProps & OtherAttrs> => {
  return (props, children) => (state, actions) => {
    const attributes = props
    const index = attributes.index
    const name = attributes.name
    const current = API.getPage(name, state.env)
    const shown = (index == current)
    if (! shown && nullIfHidden) return null
    const attrs:PageAutoProps = {
      ...attributes, 
      shown
    }
    return h(C, attrs, ...children)
  }
}