
import {UnmagicalAction, UnmagicalState, UnmagicalActions, API} from '../framework'
import {NodeName, Children, h, UnmagicalComponent} from '../components'

export type ProgressExtraProps = {
  name: string
}

export type ProgressAutoProps = {
  name: string, 
  shown: boolean, 
  current: number|undefined
}

export const playProgress = (nullIfHidden:boolean) => <OtherAttrs extends {}>(C:NodeName<ProgressAutoProps & OtherAttrs>):UnmagicalComponent<ProgressExtraProps & OtherAttrs> => {
  return (props, children) => (state, actions) => {
    const attributes = props
    const name = attributes.name
    const current = API.getProgress(name, state.env)
    if (current === null && nullIfHidden) return null
    const attrs = {
      ...attributes, 
      shown: current !== null, 
      current: (current === null) ? undefined : current
    }
    return h(C, attrs, ...children)
  }
}
