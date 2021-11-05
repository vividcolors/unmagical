
import template from 'string-template'
import * as C from '../core/components'
import {API, start, h} from '../core/framework'
export {API, start, h} from '../core/framework'

const attributeMap = {
  input: {
    oninput: 'onsl-input', 
    onblur: 'onsl-blur', 
    value: 'value', 
    class: 'class', 
    invalidClass: '', 
    invalid: 'invalid', 
    message: 'message'
  }, 
  range: {
    oninput: 'unused-input', 
    onchange: 'onsl-change', 
    value: 'value', 
    class: 'class', 
    invalidClass: '', 
    invalid: 'invalid', 
    message: 'message'
  }, 
  rating: {
    oninput: 'oninput', 
    onchange: 'onsl-change', 
    value: 'value', 
    class: 'class', 
    invalidClass: '', 
    invalid: '', 
    message: ''
  }, 
  select: {
    onchange: 'onsl-change', 
    class: 'class', 
    invalidClass: '', 
    invalid: 'invalid', 
    value: 'value', 
    option: {
      selected: 'checked', 
      value: 'value'
    }, 
    message: 'message'
  }, 
  radio: {
    onchange: 'onsl-change', 
    checked: 'checked', 
    value: 'value', 
    class: 'class', 
    invalidClass: '', 
    invalid: 'invalid', 
    message: ''
  }, 
  checkbox: {
    onchange: 'onsl-change', 
    checked: 'checked', 
    class: 'class', 
    invalidClass: '', 
    invalid: 'invalid', 
    message: ''
  }, 
  colorpicker: {
    oninput: 'unused-input', 
    onchange: 'onsl-change', 
    value: 'value', 
    class: 'class', 
    invalidClass: '', 
    invalid: 'invalid', 
    message: ''
  }, 
  updateButton: {
    onclick: 'onclick', 
    '@nullIfHidden': false, 
    current: '', 
    class: 'class', 
    shown: 'loading', 
    shownClass: ''
  }, 
  settleButton: {
    onclick: 'onclick'
  }, 
  dialog: {
    '@nullIfHidden': false, 
    data: 'data', 
    shown: 'open'
  }, 
  alert: {
    '@nullIfHidden': true, 
    data: 'data', 
    shown: ''
  }, 
  drawer: {
    '@nullIfHidden': false, 
    shown: 'open', 
    shownClass: ''
  }, 
  spinner: {
    '@nullIfHidden': true, 
    current: 'value'
  }
}

export const Input = C.playTextbox(({invalid, message, messageProps = {}, ...props}, children) => {
  return (
    <sl-input invalid={invalid} {...props}>
      {children}
      {(invalid && message) ? (
        <div {...messageProps} slot="help-text">{message}</div>
      ) : null}
    </sl-input>
  )
}, attributeMap.input)

export const Textarea = C.playTextbox(({invalid, message, messageProps = {}, ...props}, children) => {
  return (
    <sl-textarea invalid={invalid} {...props}>
      {children}
      {(invalid && message) ? (
        <div {...messageProps} slot="help-text">{message}</div>
      ) : null}
    </sl-textarea>
  )
}, attributeMap.input)

export const Range = C.playSlider(({invalid, message, messageProps = {}, ...props}, children) => {
  return (
    <sl-range invalid={invalid} {...props}>
      {children}
      {(invalid && message) ? (
        <div {...messageProps} slot="help-text">{message}</div>
      ) : null}
    </sl-range>
  )
}, attributeMap.range)

// This component behaves strangely and should not be used in production.
export const Rating = C.playSlider((props, children) => {
  return (
    <sl-rating {...props}>
      {children}
    </sl-rating>
  )
}, attributeMap.rating)

export const Select = C.playListbox(({invalid, message, messageProps, ...props}, children) => {
  return (
    <sl-select invalid={invalid} {...props}>
      {children}
      {(invalid && message) ? (
        <div {...messageProps} slot="help-text">{message}</div>
      ) : null}
    </sl-select>
  )
}, attributeMap.select)

export const Radio = C.playRadio(({invalid, ...props}, children) => {
  return (
    <sl-radio invalid={invalid} {...props}>
      {children}
    </sl-radio>
  )
}, attributeMap.radio)

export const Checkbox = C.playCheckbox(({invalid, ...props}, children) => {
  return (
    <sl-checkbox invalid={invalid} {...props}>
      {children}
    </sl-checkbox>
  )
}, attributeMap.checkbox)

export const Switch = C.playCheckbox(({invalid, ...props}, children) => {
  return (
    <sl-switch invalid={invalid} {...props}>
      {children}
    </sl-switch>
  )
}, attributeMap.checkbox)

export const ColorPicker = C.playSlider(({invalid, ...props}, children) => {
  return (
    <sl-color-picker invalid={invalid} {...props}>
      {children}
    </sl-color-picker>
  )
}, attributeMap.colorpicker)

export const UpdateButton = C.compose(C.playUpdateButton, C.playProgress)("sl-button", attributeMap.updateButton)

export const UpdateIconButton = C.playUpdateButton("sl-icon-button", attributeMap.updateButton)

export const SettleButton = C.playSettleButton('sl-button', attributeMap.settleButton)

const onDialogCreate = (el) => {
  el.addEventListener('sl-request-close', event => event.preventDefault());
}

export const Dialog = C.playDialog(({'mg-name':name, message, data, hideCancelButton = false, ...props}) => {
  delete props.oncreate
  return (
    <sl-dialog oncreate={onDialogCreate} {...props}>
      {data && template(message, data)}
      <SettleButton mg-name={name} mg-result={true} slot="footer">OK</SettleButton>
      {!hideCancelButton ? (<SettleButton mg-name={name} mg-result={false} slot="footer">キャンセル</SettleButton>) : null}
    </sl-dialog>
  )
}, attributeMap.dialog)

// TODO
export const Alert = C.playDialog(({'mg-name':name, env, message, data, ...props}) => {
  delete props.oncreate
  delete props.open
  const onAlertCreate = (el) => {
    el.toast()
    el.addEventListener('sl-hide', ev => {
      const extra = API.getExtra(name, env)
      if (extra) {
        window.requestAnimationFrame(() => {
          extra.fulfill(true)
        })
      }
    })
  }
  const ondestroy = (el) => {
    console.log('ondestroy')
  }
  return (
    <sl-alert oncreate={onAlertCreate} ondestroy={ondestroy} {...props}>
      {template(message, data)}
    </sl-alert>
  )
}, attributeMap.alert)

export const Drawer = C.playSwitch(({'mg-name':name, onUpdate, ...props}, children) => {
  delete props.oncreate
  const onDrawerCreate = (el) => {
    el.addEventListener('sl-request-close', (ev) => {
      window.requestAnimationFrame(() => onUpdate({update:'setSwitch', context:[name, false]}))
    });
  }
  return (
    <sl-drawer oncreate={onDrawerCreate} {...props}>
      {children}
    </sl-drawer>
  )
}, attributeMap.drawer)

export const Spinner = C.playProgress(({...props}, children) => {
  return (
    <sl-spinner>
      {children}
    </sl-spinner>
  )
}, attributeMap.spinner)