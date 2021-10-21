
import * as C from '../src/components'
import {API, start, h} from '../src/framework'
export {API, start, h} from '../src/framework'

const attributeMap = {
  textbox: {
    oninput: 'oninput', 
    onblur: 'onblur', 
    value: 'value', 
    class: 'class', 
    invalidClass: '', 
    invalid: 'invalid'
  }, 
  listbox: {
    onchange: 'onchange', 
    class: 'class', 
    invalidClass: '', 
    invalid: 'invalid', 
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
    invalid: 'invalid'
  }, 
  checkbox: {
    onchange: 'onchange', 
    checked: 'checked', 
    class: 'class', 
    invalidClass: '', 
    invalid: 'invalid'
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

export const Textbox = C.playTextbox(({invalid, class:clazz, ...props}, children) => {
  clazz = "bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"  // initialize clazz
  if (invalid) clazz += " bg-red-500 bg-opacity-50"
  return (
    <input type="text" class={clazz} {...props} />
  )
}, attributeMap.textbox)

export const Listbox = C.playListbox(({invalid, class:clazz, ...props}, children) => {
  clazz = "bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"  // initialize clazz
  if (invalid) clazz += " bg-red-500 bg-opacity-50"
  return (
    <select class={clazz} {...props}>{children}</select>
  )
}, attributeMap.listbox)

// We call playRadio() for label element to get `invalid' property.
// Given `invalid' is used to compose class names.
// Other radio-specific properties are located and moved to `input' child.
export const Radio = C.playRadio(({invalid, checked, onchange, label, 'data-mg-path':path, 'data-mg-value-attribute':valueAttr, class:clazz, inputProps={}, spanProps={}, ...props}, children) => {
  clazz = " inline-flex"  // initialize clazz
  if (invalid) clazz += " bg-red-500 bg-opacity-50"
  return (
    <label class={clazz} {...props}>
      <input type="radio" data-mg-path={path} data-mg-value-attribute={valueAttr} checked={checked} onchange={onchange} {...inputProps} />
      <span {...spanProps}>{label}</span>
    </label>
  )
}, attributeMap.radio)

export const Checkbox = C.playCheckbox(({invalid, checked, onchange, label, 'data-mg-path':path, 'data-mg-checked-attribute':checkedAttr, class:clazz, inputProps={}, spanProps={}, ...props}, children) => {
  clazz = " inline-flex"  // initialize clazz
  if (invalid) clazz += " bg-red-500 bg-opacity-50"
  return (
    <label class={clazz} {...props}>
      <input type="checkbox" data-mg-path={path} data-mg-checked-attribute={checkedAttr} checked={checked} onchange={onchange} {...inputProps} />
      <span {...spanProps}>{label}</span>
    </label>
  )
}, attributeMap.checkbox)

const ButtonProto = ({primary = false, class:clazz, ...props}, children) => {
  clazz = primary 
    ? "text-white bg-blue-700 hover:bg-blue-800"
    : "text-black bg-gray-300 hover:bg-gray-400"
  clazz = " focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
  return (
    <button class={clazz} {...props}>{children}</button>
  )
}

export const UpdateButton = C.playUpdateButton(ButtonProto, attributeMap.updateButton)

export const SettleButton = C.playSettleButton(ButtonProto, attributeMap.settleButton)

export const Field = ({path, env, title, class:clazz, ...props}, children) => {
  if (! API.test(path, env)) return null
  clazz = "mb-6"
  const slot = API.getSlot(path, env)
  const invalid = slot.touched && slot.invalid
  return (
    <div class={clazz} {...props}>
      {title ? (
        <div class="text-sm font-medium text-gray-900 block mb-2">{title}</div>
      ) : null}
      {children}
      {invalid && slot.message ? (
        <small class="text-sm text-red-500">{slot.message}</small>
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
  const el2 = el.querySelector('.modal-frame')
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

export const Dialog = C.playDialog(({'mg-name':name, class:clazz, hideCancelButton = false, message, ...props}) => {
  clazz = 'flex items-center justify-center fixed left-0 bottom-0 w-full h-full bg-gray-800'
  return (
    <div class={clazz} key={name} {...props} oncreate={onDialogCreated} onremove={onDialogRemoved}>
      <div class="modal-frame bg-white rounded-lg w-1/2">
        <div class="flex flex-col items-start p-4">
          <p>{message}</p>
          <hr />
          <div class="ml-auto">
            <SettleButton primary mg-name={name} mg-result={true}>OK</SettleButton>
            {! hideCancelButton ? (<SettleButton mg-name={name} mg-result={false}>キャンセル</SettleButton>) : null}
          </div>
        </div>
      </div>
    </div>
  )
}, attributeMap.dialog)

const onNotificationCreated = (el) => {
  el.animate([
    {maxHeight: 0}, 
    {maxHeight: '300px'}
  ], 200)
}

const onNotificationRemoved = (el, done) => {
  const anim = el.animate([
    {maxHeight: '300px'}, 
    {maxHeight: 0}
  ], 200)
  C.prepareToDestroy(el, anim, done)
}

export const Notification = C.playDialog(({'mg-name':name, message, class:clazz, ...props}) => {
  clazz = 'fixed inset-0 shadow-md p-4 flex'
  return (
    <div class={clazz} key={name} {...props} oncreate={onNotificationCreated} onremove={onNotificationRemoved}>
      <p>{message}</p>
      <SettleButton mg-name={name} mg-result={true}>OK</SettleButton>
    </div>
  )
}, attributeMap.notification)


