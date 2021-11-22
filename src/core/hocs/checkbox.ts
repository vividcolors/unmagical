
import {UnmagicalAction, UnmagicalState, UnmagicalActions, API} from '../framework'
import {NodeName, Children, h, UnmagicalComponent} from '../components'

/**
 * @category Checkbox
 */
export type CheckboxExtraProps = {
  path: string
}

/**
 * @category Checkbox
 */
export type CheckboxAutoProps = {
  'data-mg-path': string, 
  'data-mg-checked-attribute': string, 
  onchange: UnmagicalAction<Event>, 
  checked: boolean, 
  invalid: boolean, 
  message: string
}

/**
 * @category Checkbox
 * @param C 
 */
export const playCheckbox = <OtherAttrs extends {}>(C:NodeName<CheckboxAutoProps & OtherAttrs>):NodeName<CheckboxExtraProps & OtherAttrs> => {
  return (props, children:Children[]) => (state, actions) => {
    const {path, ...attributes} = props
    const slot = API.getSlot(path, state.env)
    if (! slot) return null
    const invalid = ((slot.touched || false) && (slot.invalid || false))
    const attrs:CheckboxAutoProps = {
      ...attributes, 
      'data-mg-path': path, 
      'data-mg-checked-attribute': 'checked', 
      onchange: actions.onCheckboxChange, 
      checked: slot.value as boolean, 
      invalid, 
      message: slot.error ? state.normalizeError(slot.error).message : ''
    }
    return h(C, attrs, ...children)
  }
}