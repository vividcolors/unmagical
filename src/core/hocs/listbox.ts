
import {UnmagicalAction, UnmagicalState, UnmagicalActions, API} from '../framework'
import {NodeName, Children, h, UnmagicalComponent} from '../components'


export type ListboxExtraProps = {
  path: string
}

export type ListboxAutoProps = {
  'data-mg-path': string, 
  'data-mg-value-attribute': string, 
  onchange: UnmagicalAction<Event>, 
  invalid: boolean, 
  message: string, 
  value: string
}

export const playListbox = <OtherAttrs extends {}>(C:NodeName<ListboxAutoProps & OtherAttrs>):NodeName<ListboxExtraProps & OtherAttrs> => {
  return (props, children) => (state, actions) => {
    const {path, ...attributes} = props
    const slot = API.getSlot(path, state.env)
    if (! slot) return null
    const invalid = ((slot.touched || false) && (slot.invalid || false))
    const attrs:ListboxAutoProps = {
      ...attributes, 
      'data-mg-path': path, 
      'data-mg-value-attribute': 'value', 
      onchange: actions.onListboxChange, 
      invalid, 
      message: slot.error ? state.normalizeError(slot.error).message : '', 
      value: slot.input
    }
  }
}