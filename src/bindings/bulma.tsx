
import template from 'string-template'
import {VNode} from 'hyperapp'
import * as C from '../core/components'
import {h} from '../core/framework'
export {API, start, h} from '../core/framework'

export type AnyAttrs = {
  [key:string]:any 
}


export const Input = C.playTextbox<AnyAttrs>(({invalid, message, class:clazz = '', ...props}) => {
  clazz += " input"
  if (invalid) clazz += " is-danger"
  return (
    <input {...props} class={clazz} />
  )
})

export const Textarea = C.playTextbox<AnyAttrs>(({invalid, message, class:clazz = '', ...props}) => {
  clazz += " textarea"
  if (invalid) clazz += " is-danger"
  return (
    <textarea {...props} class={clazz}></textarea>
  )
})

// bulma has no range-sliders

const setValueToChildren = (value:string, cs:Array<VNode|string>):Array<VNode|string> => {
  return cs.map(o => {
    if (typeof o != 'object') return o
    const children = (o.children && o.children.length) ? setValueToChildren(value, o.children) : o.children
    if ('value' in o.attributes) {
      return {...o, selected: (o as VNode<{value:string}>).attributes.value == value, children}
    } else {
      return {...o, children}
    }
  })
}

export const Select = C.playListbox<{inputProps?: object, disabled?: boolean} & AnyAttrs>(({onchange, 'data-mg-path':dataMgPath, 'data-mg-value-attribute':dataMgValueAttribute, invalid, message, value, disabled = false, class:clazz = '', inputProps = {}, ...props}, children) => {
  clazz += " select"
  if (invalid) clazz += " is-danger"
  return (
    <div {...props} class={clazz}>
      <select {...inputProps} onchange={onchange} data-mg-path={dataMgPath} data-mg-value-attribute={dataMgValueAttribute} disabled={disabled}>
        {setValueToChildren(value, children)}
      </select>
    </div>
  )
})

export const Radio = C.playRadio<{inputProps?: object, name?: string, disabled?: boolean} & AnyAttrs>(({checked, onchange, 'data-mg-path':dataMgPath, 'data-mg-value-attribute':dataMgValueAttribute, invalid, message, value, disabled = false, name = null, inputProps = {}, class:clazz = '', ...props}, children) => {
  clazz += ' radio'
  if (name === null) name = dataMgPath
  return (
    <label {...props} disabled={disabled} class={clazz}>
      <input {...inputProps} type="radio" onchange={onchange} data-mg-path={dataMgPath} data-mg-value-attribute={dataMgValueAttribute} name={name} disabled={disabled} checked={checked} value={value} />
      {children}
    </label>
  )
})

export const Checkbox = C.playCheckbox<{disabled?: boolean, inputProps?: object} & AnyAttrs>(({checked, onchange, 'data-mg-path':dataMgPath, 'data-mg-checked-attribute':dataMgCheckedAttribute, invalid, message, disabled = false, inputProps = {}, class:clazz = '', ...props}, children) => {
  clazz += ' checkbox'
  return (
    <label {...props} disabled={disabled} class={clazz}>
      <input {...inputProps} type="checkbox" onchange={onchange} data-mg-path={dataMgPath} data-mg-checked-attribute={dataMgCheckedAttribute} disabled={disabled} checked={checked} />
      {children}
    </label>
  )
})

export const Field = C.playField<{label?: string} & AnyAttrs>(({invalid, message, label = '', class:clazz = '', ...props}, children) => {
  clazz += ' field'
  return (
    <div {...props} class={clazz}>
      {label ? (<label class="label">{label}</label>) : null}
      {children}
      {invalid && message ? (
        <p class="help is-danger">{message}</p>
      ) : null}
    </div>
  )
})

export const UpdateButton = C.compose<AnyAttrs>(C.playUpdateButton, C.playProgress(false))(({shown, class:clazz = '', ...props}, children) => {
  clazz += ' button'
  if (shown) clazz += ' is-loading'
  return (
    <button {...props} class={clazz}>{children}</button>
  )
})

export const DeleteButton = C.playUpdateButton<AnyAttrs>(({class:clazz = '', ...props}, children) => {
  clazz += ' delete'
  return (
    <button {...props} class={clazz}>{children}</button>
  )
})

export const Clickable = C.playUpdateButton<AnyAttrs>("a")

export const SettleButton = C.playSettleButton<AnyAttrs>(({class:clazz = '', ...props}, children) => {
  clazz += ' button'
  return (
    <button {...props} class={clazz}>{children}</button>
  )
})

export const Dialog = C.playDialog("fade", true)<{title: string, message: string, hideCancelButton?: boolean, okLabel?: string, cancelLabel?: string} & AnyAttrs>(({data, name, shown, title, message, hideCancelButton = false, okLabel = 'OK', cancelLabel = 'Cancel', class:clazz = '', ...props}) => {
  const effectiveMessage = template(message, data)
  clazz += ' modal is-active'
  console.log('Dialog', name, props)
  return (
    <div {...props} key={name} class={clazz}>
      <div class="modal-background"></div>
      <div class="modal-card">
        <header class="modal-card-head">
          <p class="modal-card-title">{title}</p>
        </header>
        <section class="modal-card-body">
          <p>{effectiveMessage}</p>
        </section>
        <footer class="modal-card-foot">
          <SettleButton class="button is-success" name={name} result={true}>{okLabel}</SettleButton>
          {! hideCancelButton ? (<SettleButton class="button" name={name} result={false}>{cancelLabel}</SettleButton>) : null}
        </footer>
      </div>
    </div>
  )
})

export const Notification = C.playFeedback("slide", true)<{message: string} & AnyAttrs>(({name, data, shown, message, class:clazz = '', ...props}) => {
  const effectiveMessage = template(message, data)
  clazz += ' notification'
  return (
    <div {...props} key={name} class={clazz}>
      <DeleteButton update="closeFeedback" context={[name]}></DeleteButton>
      <p>{effectiveMessage}</p>
    </div>
  )
})

export const Progress = C.playProgress(true)<AnyAttrs>(({current, name, shown, class:clazz = '', ...props}) => {
  clazz += ' pregress'
  return (
    <progress {...props} class={clazz} value={current}>indeterminated</progress>
  )
})

export const Modal = C.playModal("fade", true)<AnyAttrs>(({class:clazz = '', ...props}, children) => {
  clazz += ' modal is-active'
  return (
    <div {...props} class={clazz}>
      <div class="modal-background"></div>
      {children}
    </div>
  )
})

export const Pagination = C.playPagination<{prevLabel?: string, nextLabel?: string, loadItemsOptions?: object} & AnyAttrs>(({current, prev, next, first, last, siblings, listPath, prevLabel = 'Previous', nextLabel = 'Next', loadItemsOptions = {}, ...props}) => {
  return (
    <nav {...props} class="pagination" role="navigation" aria-label="pagination">
      <Clickable class="pagination-previous" update="loadItems" context={[listPath, {...loadItemsOptions, page:prev}]} disabled={! prev}>{prevLabel}</Clickable>
      <Clickable class="pagination-next" update="loadItems" context={[listPath, {...loadItemsOptions, page:next}]} disabled={! next}>{nextLabel}</Clickable>
      <ul class="pagination-list">
        {first ? (<li><Clickable class="pagination-link" update="loadItems" context={[listPath, {...loadItemsOptions, page:first}]}>{first}</Clickable></li>) : null}
        {first ? (<li><span class="pagination-ellipsis">&hellip;</span></li>) : null}
        {siblings.map(pno => (<li><Clickable class={`pagination-link ${pno == current ? 'is-current' : ''}`} update="loadItems" context={[listPath, {...loadItemsOptions, page:pno}]}>{pno}</Clickable></li>))}
        {last ? (<li><span class="pagination-ellipsis">&hellip;</span></li>) : null}
        {last ? (<li><Clickable class="pagination-link" update="loadItems" context={[listPath, {...loadItemsOptions, page:last}]}>{last}</Clickable></li>) : null}
      </ul>
    </nav>
  )
})

export const DatePicker = C.playFlatpickr<AnyAttrs>(({invalid, message, class:clazz = '', ...props}) => {
  clazz += ' input'
  if (invalid) clazz += ' is-danger'
  return (
    <input {...props} type="text" class={clazz} />
  )
})

export const ColorPicker = C.playPickr<{iconClass?: string, iconText?: string} & AnyAttrs>(({invalid, message, value, iconClass = 'material-icons', iconText = 'palette', class:clazz = '', ...props}) => {
  clazz += ' button'
  return (
    <button {...props} type="button" class={clazz}>
      <span class="icon"><i class={iconClass} style={{color:value}}>{iconText}</i></span>
    </button>
  )
})

export type ShowItemFunc = (item:any, index:number, itemPath:string, group:string) => VNode<any>

export const ReorderableMenuList = C.playSortable<{showItem?: ShowItemFunc, items?: any[]} & AnyAttrs>(({active, itemPath, group, showItem = null, items = null, ...props}, children) => {
  console.log('ReorderableMenuList', showItem, items)
  return (
    <ul {...props}>
      {(showItem && items) ? (
        items.map((item, index) => showItem(item, index, itemPath, group))
      ) : (
        children
      )}
    </ul>
  )
})