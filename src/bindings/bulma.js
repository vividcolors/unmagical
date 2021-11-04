
import template from 'string-template'
import * as C from '../core/components'
import {API, start, h} from '../core/framework'
export {API, start, h} from '../core/framework'

const attributeMap = {
  textbox: {
    oninput: 'oninput', 
    onblur: 'onblur', 
    value: 'value', 
    class: 'class', 
    invalidClass: 'is-danger', 
    invalid: ''
  }, 
  listbox: {
    onchange: 'onchange', 
    class: 'class', 
    invalidClass: 'is-danger', 
    invalid: '', 
    value: 'value', 
    option: {
      selected: 'selected', 
      value: 'value'
    }
  }, 
  radio: {
    onchange: 'onchange', 
    checked: 'checked', 
    value: 'value', 
    class: 'class', 
    invalidClass: '', 
    invalid: ''
  }, 
  checkbox: {
    onchange: 'onchange', 
    checked: 'checked', 
    class: 'class', 
    invalidClass: '', 
    invalid: ''
  }, 
  updateButton: {
    onclick: 'onclick', 
    '@nullIfHidden': false, 
    current: '', 
    class: 'class', 
    shown: '', 
    shownClass: 'is-loading'
  }, 
  settleButton: {
    onclick: 'onclick'
  }, 
  dialog: {
    '@nullIfHidden': true, 
    data: 'data'
  }, 
  notification: {
    '@nullIfHidden': true, 
    data: 'data'
  }, 
  progress: {
    '@nullIfHidden': true, 
    current: 'value'
  }
}

export const Textbox = C.playTextbox('input', attributeMap.textbox)
export const Textarea = C.playTextbox('textarea', attributeMap.textbox)
export const Listbox = C.playListbox('select', attributeMap.listbox)
export const Radio = C.playRadio('input', attributeMap.radio)
export const Checkbox = C.playCheckbox('input', attributeMap.checkbox)
export const UpdateButton = C.compose(C.playUpdateButton, C.playProgress)("button", attributeMap.updateButton)
export const SettleButton = C.playSettleButton('button', attributeMap.settleButton)

export const Field = ({path, env, foldValidity = false, ...props}, children) => {
  if (! API.test(path, env)) return null
  const slot = API.getSlot(path, env)
  const {invalid, message} = foldValidity ? API.foldValidity(path, env) : {invalid:slot.invalid && slot.touched, message:slot.message}
  return (
    <div {...props}>
      {children}
      {invalid && message ? (
        <p class="help is-danger">{message}</p>
      ) : null}
    </div>
  )
}

const onDialogCreated = (el) => {
  C.suspendRoot()
  el.animate([
    {opacity: 0}, 
    {opacity: 1}
  ], 200)
  const el2 = el.querySelector('.modal-card')
  el2.animate([
    {transform: 'translateY(5vh)'}, 
    {transform: 'translateY(0)'}
  ], 200)
}

const onDialogRemoved = (el, done) => {
  C.resumeRoot()
  const anim = el.animate([
    {opacity: 1}, 
    {opacity: 0}
  ], 200)
  C.prepareToDestroy(el, anim, done)
}

export const Dialog = C.playDialog(({'mg-name':name, class:clazz = '', title, message, hideCancelButton = false, data, ...props}) => {
  clazz += ' modal is-active'
  return (
    <div class={clazz} key={name} {...props} oncreate={onDialogCreated} onremove={onDialogRemoved}>
      <div class="modal-background"></div>
      <div class="modal-card">
        <header class="modal-card-head">
          <p class="modal-card-title">{template(title, data)}</p>
        </header>
        <section class="modal-card-body">
          <p>{template(message, data)}</p>
        </section>
        <footer class="modal-card-foot">
          <SettleButton class="button is-success" mg-name={name} mg-result={true}>OK</SettleButton>
          {! hideCancelButton ? (<SettleButton class="button" mg-name={name} mg-result={false}>キャンセル</SettleButton>) : null}
        </footer>
      </div>
    </div>
  )
}, attributeMap.dialog)

const onNotificationCreated = (el) => {
  const r = el.getBoundingClientRect()
  el.animate([
    {offset:0, maxHeight: 0}, 
    {offset:0.999, maxHeight: ((r.height * 1.2) + 30) + 'px'}, 
    {offset:1, maxHeight:'none'}
  ], 150)
  el.scrollIntoView()
}

const onNotificationRemoved = (el, done) => {
  const r = el.getBoundingClientRect()
  const anim = el.animate([
    {maxHeight: ((r.height * 1.2) + 30) + 'px'}, 
    {maxHeight: 0}
  ], 150)
  C.prepareToDestroy(el, anim, done)
}

export const Notification = C.playDialog(({'mg-name':name, data, message, class:clazz = '', ...props}) => {
  clazz += ' notification'
  return (
    <div class={clazz} key={name} {...props} oncreate={onNotificationCreated} onremove={onNotificationRemoved}>
      <SettleButton class="delete" mg-name={name} mg-result={true}></SettleButton>
      <p>{template(message, data)}</p>
    </div>
  )
}, attributeMap.notification)

export const Progress = C.playProgress(({class:clazz, ...props}) => {
  clazz += ' progress'
  return (
    <progress class={clazz} {...props}>indeterminated</progress>
  )
}, attributeMap.progress)

