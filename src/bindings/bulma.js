
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
  clickable: {
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
export const Clickable = C.playUpdateButton("a", {onclick:'onclick'})

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

export const Dialog = C.playDialog(({'mg-name':name, class:clazz = '', title, createMessage = null, message = null, hideCancelButton = false, data, ...props}) => {
  clazz += ' modal is-active'
  message = createMessage ? createMessage(data) : message
  return (
    <div class={clazz} key={name} {...props} oncreate={onDialogCreated} onremove={onDialogRemoved}>
      <div class="modal-background"></div>
      <div class="modal-card">
        <header class="modal-card-head">
          <p class="modal-card-title">{title}</p>
        </header>
        <section class="modal-card-body">
          <p>{message}</p>
        </section>
        <footer class="modal-card-foot">
          <SettleButton class="button is-success" mg-name={name} mg-result={true}>OK</SettleButton>
          {! hideCancelButton ? (<SettleButton class="button" mg-name={name} mg-result={false}>キャンセル</SettleButton>) : null}
        </footer>
      </div>
    </div>
  )
}, attributeMap.dialog)

const onNotificationCreate = (el) => {
  const r = el.getBoundingClientRect()
  el.animate([
    {offset:0, maxHeight: 0}, 
    {offset:0.999, maxHeight: ((r.height * 1.2) + 30) + 'px'}, 
    {offset:1, maxHeight:'none'}
  ], 150)
  el.scrollIntoView()
}

const onNotificationRemove = (el, done) => {
  const r = el.getBoundingClientRect()
  const anim = el.animate([
    {maxHeight: ((r.height * 1.2) + 30) + 'px'}, 
    {maxHeight: 0}
  ], 150)
  C.prepareToDestroy(el, anim, done)
}

const withDuration = (duration, name, onUpdate) => {
  let timeoutId = null
  return [
    (el) => {
      timeoutId = setTimeout(() => onUpdate({update:"closeFeedback", context:[name]}), duration)
      onNotificationCreate(el)
    }, 
    (el, done) => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
      onNotificationRemove(el, done)
    }
  ]
}

export const Notification = C.playFeedback(({'mg-name':name, data, createMessage = null, message = null, duration = 0, class:clazz = '', onUpdate, ...props}) => {
  clazz += ' notification'
  const [oncreate, onremove] = duration ? withDuration(duration, name, onUpdate) : [onNotificationCreate, onNotificationRemove]
  message = createMessage ? createMessage(data) : message
  return (
    <div class={clazz} key={name} {...props} oncreate={oncreate} onremove={onremove}>
      <UpdateButton class="delete" mg-update="closeFeedback" mg-context={[name]}></UpdateButton>
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

export const Modal = ({class:clazz, ...props}, children) => {
  clazz += ' modal is-active'
  return (
    <div class={clazz} {...props} oncreate={onDialogCreated} onremove={onDialogRemoved}>
      <div class="modal-background"></div>
      {children}
    </div>
  )
}

const getSiblings = (pageNo, width, firstPageNo, lastPageNo) => {
  const rv = []
  for (let i = pageNo - width; i <= pageNo + width; i++) {
    if (i < firstPageNo) continue
    if (i > lastPageNo) continue
    rv.push(i)
  }
  return rv
}

export const Pagination = ({width, pageProperty, limitProperty, listPath, env, loadItemsOptions, ...props}) => {
  const query = API.extract(listPath + '/query', env)
  const totalCount = API.extract(listPath + '/totalCount', env)
  const pageNo = query[pageProperty]
  const firstPageNo = totalCount == 0 ? 9999 : 1
  const lastPageNo = totalCount == 0 ? 0 : Math.ceil(totalCount / query[limitProperty])
  const siblings = getSiblings(pageNo, width, firstPageNo, lastPageNo)
  if (! ('pagePropery' in loadItemsOptions)) {
    loadItemsOptions = {...loadItemsOptions, pageProperty}
  }
  return (
    <nav class="pagination" role="navigation" aria-label="pagination">
      <Clickable class="pagination-previous" mg-update="loadItems" mg-context={[listPath, {...loadItemsOptions, page:pageNo - 1}]} disabled={firstPageNo >= pageNo}>Previous</Clickable>
      <Clickable class="pagination-next" mg-update="loadItems" mg-context={[listPath, {...loadItemsOptions, page:pageNo + 1}]} disabled={lastPageNo <= pageNo}>Next</Clickable>
      <ul class="pagination-list">
        {firstPageNo < pageNo - width ? (<li><Clickable class="pagination-link" mg-update="loadItems" mg-context={[listPath, {...loadItemsOptions, page:firstPageNo}]}>{firstPageNo}</Clickable></li>) : null}
        {firstPageNo < pageNo - width ? (<li><span class="pagination-ellipsis">&hellip;</span></li>) : null}
        {siblings.map(pno => (<li><Clickable class={`pagination-link ${pno == pageNo ? 'is-current' : ''}`} mg-update="loadItems" mg-context={[listPath, {...loadItemsOptions, page:pno}]}>{pno}</Clickable></li>))}
        {lastPageNo > pageNo + width ? (<li><span class="pagination-ellipsis">&hellip;</span></li>) : null}
        {lastPageNo > pageNo + width ? (<li><Clickable class="pagination-link" mg-update="loadItems" mg-context={[listPath, {...loadItemsOptions, page:lastPageNo}]}>{lastPageNo}</Clickable></li>) : null}
      </ul>
    </nav>
  )
}
