
import {UnmagicalAction, UnmagicalState, UnmagicalActions, API} from '../framework'
import {NodeName, Children, h, UnmagicalComponent} from '../components'


export type SwitchExtraProps = {
  name: string
}

export type SwitchAutoProps = {
  name: string, 
  shown: boolean
}

export const playSwitch = (nullIfHidden:boolean) => <OtherAttrs extends {}>(C:NodeName<SwitchAutoProps & OtherAttrs>):NodeName<SwitchExtraProps & OtherAttrs> => {
  return (props, children) => (state, actions) => {
    const attributes = props
    const name = attributes.name
    const shown = API.getSwitch(name, state.env)
    if (! shown && nullIfHidden) return null
    const attrs = {
      ...attributes, 
      shown
    }
    return h(C, attrs, ...children)
  }
}