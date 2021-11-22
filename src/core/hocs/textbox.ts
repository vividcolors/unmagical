
import {UnmagicalAction, UnmagicalState, UnmagicalActions, API} from '../framework'
import {NodeName, Children, h, UnmagicalComponent} from '../components'

/**
 * Properties users provide to Textbox component.
 */
export type TextboxExtraProps = {
  /**
   * Json path to the value, which bound to a Textbox.
   */
  path: string
}

/**
 * Properties an implementor of Textbox get.
 */
export type TextboxAutoProps = {
  /**
   * Unmagical will use this property. Please render as is.
   */
  'data-mg-path' :string, 
  /**
   * Unmagical will use this property. Please render as is.
   */
  'data-mg-value-attribute' :string, 
  /**
   * Unmagical will use this property. Please render as is.
   */
  oninput :UnmagicalAction<Event>, 
  /**
   * Unmagical will use this property. Please render as is.
   */
  onblur :UnmagicalAction<Event>, 
  /**
   * Unmagical will use this property. Please render as is.
   */
  value :string, 
  /**
   * True if the validation of an input string failed.
   */ 
  invalid :boolean, 
  /**
   * An error message of the validation. An empty string if the validation succeeded.
   */
  message :string
}

/**
 * 
 * @param C A component or tagName to which you give the Textbox role
 * @returns A component, which plays the Textbox
 */
export const playTextbox = <OtherAttrs extends {}>(C:NodeName<TextboxAutoProps & OtherAttrs>):NodeName<TextboxExtraProps & OtherAttrs> => {
  return (props, children:Children[]) => (state:UnmagicalState, actions:UnmagicalActions) => {
    const {path, ...attributes} = props
    const slot = API.getSlot(path, state.env)
    if (! slot) return null
    const invalid = ((slot.touched || false) && (slot.invalid || false))
    const attrs:TextboxAutoProps = {
      ...attributes, 
      'data-mg-path': path, 
      'data-mg-value-attribute': 'value', 
      oninput: actions.onTextboxInput, 
      onblur: actions.onTextboxBlur, 
      value: slot.input, 
      invalid, 
      message: slot.error ? state.normalizeError(slot.error).message : ''
    } 
    return h(C, attrs, ...children)
  }
}
