
import * as C from '../src/components'
import {API, start, h} from '../src/framework'
export {API, start, h} from '../src/framework'

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
    message: 'message'
  }, 
  notification: {
    '@nullIfHidden': true, 
    message: 'message'
  }, 
  progress: {
    '@nullIfHidden': true, 
    current: 'value'
  }
}

export const Textbox = C.playTextbox('input', attributeMap.textbox)
export const Listbox = C.playListbox('select', attributeMap.listbox)
export const Radio = C.playRadio('input', attributeMap.radio)
export const Checkbox = C.playCheckbox('input', attributeMap.checkbox)
export const UpdateButton = C.compose(C.playUpdateButton, C.playProgress)("button", attributeMap.updateButton)
export const SettleButton = C.playSettleButton('button', attributeMap.settleButton)

export const Field = ({path, env, ...props}, children) => {
  if (! API.test(path, env)) return null
  const slot = API.getSlot(path, env)
  const invalid = slot.touched && slot.invalid
  return (
    <div {...props}>
      {children}
      {invalid && slot.message ? (
        <p class="help is-danger">{slot.message}</p>
      ) : null}
    </div>
  )
}

const fadeIn = (el) => {
  C.suspendRoot()
  el.animate([
    {opacity: 0}, 
    {opacity: 1}
  ], 200)
}

const fadeOut = (el, done) => {
  C.resumeRoot()
  const anim = el.animate([
    {opacity: 1}, 
    {opacity: 0}
  ], 200)
  C.prepareToDestroy(el, anim, done)
}

export const Dialog = C.playDialog(({'mg-name':name, class:clazz = '', message, ...props}) => {
  clazz += ' modal is-active'
  return (
    <div class={clazz} key={name} {...props} oncreate={fadeIn} onremove={fadeOut}>
      <div class="modal-background"></div>
      <div class="modal-card">
        <section class="modal-card-body">
          <p>{message}</p>
        </section>
        <footer class="modal-card-foot">
          <SettleButton class="button is-success" mg-name={name} mg-result={true}>OK</SettleButton>
          <SettleButton class="button" mg-name={name} mg-result={false}>キャンセル</SettleButton>
        </footer>
      </div>
    </div>
  )
}, attributeMap.dialog)

export const Notification = C.playDialog(({'mg-name':name, message, class:clazz = '', ...props}) => {
  // add simple layout
  const style = {
    boxSizing: 'border-box', 
    opacity: 1, 
    position: 'fixed', 
    right: '10px', 
    bottom: '10px'
  }
  clazz += ' notification is-primary'
  return (
    <div class={clazz} key={name} style={style} {...props} oncreate={fadeIn} onremove={fadeOut}>
      <SettleButton class="delete" mg-name={name} mg-result={true}></SettleButton>
      <p>{message}</p>
    </div>
  )
}, attributeMap.notification)

export const Progress = C.playProgress(({class:clazz, ...props}) => {
  clazz += ' progress'
  return (
    <progress class={clazz} {...props}>indeterminated</progress>
  )
}, attributeMap.progress)



/**
 * Bulma doesn't have Spinner, then we define simple one.
 */
/*export const Spinner = C.playSpinner(({'mg-name':name, ...props}) => {
  const style = {
    position:"fixed",
    boxSizing: 'border-box', 
    top:0,
    right: 0, 
    bottom:0,
    left:0,
    backgroundColor:'rgba(0,0,0,0.5)'
  }
  return (
    <div key={name} style={style} {...props} oncreate={fadeIn} onremove={fadeOut}>
      <div style={{color:"#FFFFFF"}}>Loading...</div>
    </div>
  )
}, attributeMap)*/