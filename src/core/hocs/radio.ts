
import {UnmagicalAction, UnmagicalState, UnmagicalActions, API} from '../framework'
import {NodeName, Children, h, UnmagicalComponent} from '../components'

/**
 * @category Radio
 */
export type RadioExtraProps = {
  path: string, 
  value: string
}

/**
 * @category Radio
 */
export type RadioAutoProps = {
  'data-mg-path': string, 
  'data-mg-value-attribute': string, 
  onchange: UnmagicalAction<Event>, 
  checked: boolean, 
  invalid: boolean, 
  message: string, 
  value: string
}

/**
 * @category Radio
 * @param C 
 */
export const playRadio = <OtherAttrs extends {}>(C:NodeName<RadioAutoProps & OtherAttrs>):NodeName<RadioExtraProps & OtherAttrs> => {
  return (props, children:Children[]) => (state, actions) => {
    const {path, value, ...attributes} = props
    const slot = API.getSlot(path, state.env)
    if (! slot) return null
    const invalid = ((slot.touched || false) && (slot.invalid || false))
    const attrs:RadioAutoProps = {
      ...attributes, 
      'data-mg-path': path, 
      'data-mg-value-attribute': 'value', 
      onchange: actions.onRadioChange, 
      checked: value == slot.value, 
      invalid, 
      message: slot.error ? state.normalizeError(slot.error).message : '', 
      value
    }
    return h(C, attrs, ...children)
  }
}