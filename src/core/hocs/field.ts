
import {UnmagicalAction, UnmagicalState, UnmagicalActions, API} from '../framework'
import {NodeName, Children, h, UnmagicalComponent} from '../components'

export type FieldExtraProps = {
  path: string, 
  foldValidity: boolean
}

export type FieldAutoProps = {
  invalid: boolean, 
  message: string
}

export const playField = <OtherAttrs extends {}>(C:NodeName<FieldAutoProps & OtherAttrs>):NodeName<FieldExtraProps & OtherAttrs> => {
  return (props, children) => (state, actions) => {
    const {path, foldValidity, ...attributes} = props
    if (! API.test(path, state.env)) return null
    const slot = API.getSlot(path, state.env)
    const {invalid, error} = foldValidity ? API.foldValidity(path, state.env) : {invalid:slot.invalid && slot.touched, error:slot.error}
    const attrs:FieldAutoProps = {
      ...attributes, 
      invalid, 
      message: error ? state.normalizeError(error).message : ''
    }
    return h(C, attrs, ...children)
  }
}