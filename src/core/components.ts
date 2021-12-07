
import { API, h, UnmagicalState, UnmagicalActions, UnmagicalAction } from './framework'
export { API, h, UnmagicalActions, UnmagicalAction } from './framework'
import * as X from './errors'
import {VNode, Component, Children, View} from 'hyperapp'
import { Json } from './schema'

/**
 * `oncreate` lifecycle hook.
 * @category Types
 */
export type OnCreateFunc = (el:Element) => void

/**
 * `onremove` lifecycle hook.
 */
export type OnRemoveFunc = (el:Element, done:() => void) => void

/**
 * `ondestroy` lifecycle hook.
 */
export type OnDestroyFunc = (el:Element) => void

/**
 * @category Types
 */
export type UnmagicalComponent<Attributes> = Component<Attributes,any,any>

/**
 * @category Types
 */
export type NodeName<A> = UnmagicalComponent<A> | string

/**
 * @category Types
 */
export type Hoc<A> = (c:NodeName<A>) => UnmagicalComponent<A>

/**
 * @category Types
 */
export {VNode} from 'hyperapp'


/**
 * @category Entries
 */
export const suspendRoot = () => {
  const rootEl = document.documentElement
  const c = +rootEl.dataset.mgSuspendCount
  if (!c || c < 1) {
    rootEl.dataset.mgSuspendCount = "" + 1
    rootEl.style.overflow = "hidden"
  } else {
    rootEl.dataset.mgSuspendCount = "" + (c - 1)
  }
}

/**
 * @category Entries
 */
export const resumeRoot = () => {
  const rootEl = document.documentElement
  const c = +rootEl.dataset.mgSuspendCount
  if (c <= 1) {
    delete rootEl.dataset.mgSuspendCount
    rootEl.style.overflow = null
  } else {
    rootEl.dataset.mgSuspendCount = "" + (c + 1)
  }
}

/**
 * @category Entries
 */
export const prepareToDestroy = (el:Element, anim:Animation, done:() => void) => {
  const tid = setTimeout(() => {
    done()
    anim.onfinish = null
  }, 800)
  anim.onfinish = () => {
    done()
    clearTimeout(tid)
  }
}

/**
 * @category Entries
 */
export const compose = <Attrs>(p1:Hoc<Attrs>, p2:Hoc<Attrs>):Hoc<Attrs> => (C) => {
  return (props, children) => (state, actions) => {
    const more = (props, children) => {
      const i = p1(C)(props, children)
      return (typeof i == 'function') ? i(state, actions) : i
    }
    const i = p2(more)(props, children)
    const x = (typeof i == 'function') ? i(state, actions) : i
    if (x) return x
    const i2 = p1(C)(props, children)
    return (typeof i == 'function') ? i(state, actions) : i
  }
}




/*
The following code is left as it may be used in the future.

export const playSmartControl = (C, map = {}) => {
  map = {...defaultAttributeMap.smartControl, ...map}
  return (props, children) => (state, actions) => {
    const {...attributes} = props
    const path = props['mg-path']
    const mdr = API.getMdr(path, state.env)
    if (! mdr) return null
    attributes[map.onchange] = actions.onSmartControlChange
    addAttr(attributes, map.value, mdr.input)
    addClass(attributes, map.class, map.fixedClass)
    return h(C, attributes, ...children)
  }
}
*/


/**
 * Properties users provide to Textbox component.
 * @category Textbox
 */
export type TextboxExtraProps = {
  /**
   * Json path to the value, which bound to a Textbox.
   */
  path: string
}

/**
 * Properties an implementor of Textbox get.
 * @category Textbox
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
 * Assigns Textbox role to a node.
 * 
 * @param C A component or tagName to which you give the Textbox role
 * @returns A component, which plays the Textbox
 * @category Textbox
 */
export const playTextbox = <OtherAttrs extends {}>(C:NodeName<TextboxAutoProps & OtherAttrs>):Component<TextboxExtraProps & OtherAttrs> => {
  return (props, children:Children[]) => (state:UnmagicalState, actions:UnmagicalActions) => {
    const {path, ...attributes} = props
    const mdr = API.getMdr(path, state.env)
    if (! mdr) return null
    const invalid = ((mdr.touched || false) && (mdr.invalid || false))
    const attrs:TextboxAutoProps = {
      ...attributes, 
      'data-mg-path': path, 
      'data-mg-value-attribute': 'value', 
      oninput: actions.onTextboxInput, 
      onblur: actions.onTextboxBlur, 
      value: mdr.input, 
      invalid, 
      message: mdr.error ? state.normalizeError(mdr.error).message : ''
    } 
    return h(C, attrs, ...children) as VNode
  }
}

/**
 * @category Slider
 */
export type SliderExtraProps = {
  path: string
}

/**
 * @category Slider
 */
export type SliderAutoProps = {
  'data-mg-path': string, 
  'data-mg-value-attribute': string, 
  oninput: UnmagicalAction<Event>, 
  onchange: UnmagicalAction<Event>, 
  value: string, 
  invalid: boolean, 
  message: string
}

/**
 * @category Slider
 */
export const playSlider = <OtherAttrs extends {}>(C:NodeName<SliderAutoProps & OtherAttrs>):UnmagicalComponent<SliderExtraProps & OtherAttrs> => {
  return (props, children) => (state, actions) => {
    const {path, ...attributes} = props
    const mdr = API.getMdr(path, state.env)
    if (! mdr) return null
    const invalid = ((mdr.touched || false) && (mdr.invalid || false))
    const attrs:SliderAutoProps = {
      ...attributes, 
      'data-mg-path': path, 
      'data-mg-value-attribute': 'value', 
      oninput: actions.onSliderInput, 
      onchange: actions.onSliderChange, 
      value: mdr.input, 
      invalid, 
      message: mdr.error ? state.normalizeError(mdr.error).message : ''
    } 
    return h(C, attrs, ...children) as VNode
  }
}


/**
 * @category Listbox
 */
export type ListboxExtraProps = {
  path: string
}

/**
 * @category Listbox
 */
export type ListboxAutoProps = {
  'data-mg-path': string, 
  'data-mg-value-attribute': string, 
  onchange: UnmagicalAction<Event>, 
  invalid: boolean, 
  message: string, 
  value: string
}

/**
 * 
 * @param C 
 * @category Listbox
 */
export const playListbox = <OtherAttrs extends {}>(C:NodeName<ListboxAutoProps & OtherAttrs>):UnmagicalComponent<ListboxExtraProps & OtherAttrs> => {
  return (props, children) => (state, actions) => {
    const {path, ...attributes} = props
    const mdr = API.getMdr(path, state.env)
    if (! mdr) return null
    const invalid = ((mdr.touched || false) && (mdr.invalid || false))
    const attrs:ListboxAutoProps = {
      ...attributes, 
      'data-mg-path': path, 
      'data-mg-value-attribute': 'value', 
      onchange: actions.onListboxChange, 
      invalid, 
      message: mdr.error ? state.normalizeError(mdr.error).message : '', 
      value: mdr.input
    }
    return h(C, attrs, ...children) as VNode
  }
}

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
export const playRadio = <OtherAttrs extends {}>(C:NodeName<RadioAutoProps & OtherAttrs>):UnmagicalComponent<RadioExtraProps & OtherAttrs> => {
  return (props, children:Children[]) => (state, actions) => {
    const {path, value, ...attributes} = props
    const mdr = API.getMdr(path, state.env)
    if (! mdr) return null
    const invalid = ((mdr.touched || false) && (mdr.invalid || false))
    const attrs:RadioAutoProps = {
      ...attributes, 
      'data-mg-path': path, 
      'data-mg-value-attribute': 'value', 
      onchange: actions.onRadioChange, 
      checked: value == mdr.value, 
      invalid, 
      message: mdr.error ? state.normalizeError(mdr.error).message : '', 
      value
    }
    return h(C, attrs, ...children) as VNode
  }
}

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
export const playCheckbox = <OtherAttrs extends {}>(C:NodeName<CheckboxAutoProps & OtherAttrs>):UnmagicalComponent<CheckboxExtraProps & OtherAttrs> => {
  return (props, children:Children[]) => (state, actions) => {
    const {path, ...attributes} = props
    const mdr = API.getMdr(path, state.env)
    if (! mdr) return null
    const invalid = ((mdr.touched || false) && (mdr.invalid || false))
    const attrs:CheckboxAutoProps = {
      ...attributes, 
      'data-mg-path': path, 
      'data-mg-checked-attribute': 'checked', 
      onchange: actions.onCheckboxChange, 
      checked: mdr.value as boolean, 
      invalid, 
      message: mdr.error ? state.normalizeError(mdr.error).message : ''
    }
    return h(C, attrs, ...children) as VNode
  }
}

/**
 * @category UpdateButton
 */
export type UpdateButtonExtraProps = {
  update: string, 
  context: Json
}

/**
 * @category UpdateButton
 */
export type UpdateButtonAutoProps = {
  'data-mg-update': string, 
  'data-mg-context': string, 
  onclick: UnmagicalAction<Event>
}

/**
 * @category UpdateButton
 */
export const playUpdateButton = <OtherAttrs extends {}>(C:NodeName<UpdateButtonAutoProps & OtherAttrs>):UnmagicalComponent<UpdateButtonExtraProps & OtherAttrs> => {
  return (props, children) => (state, actions) => {
    const {update, context, ...attributes} = props
    const attrs:UpdateButtonAutoProps = {
      ...attributes, 
      'data-mg-update': update, 
      'data-mg-context': JSON.stringify(typeof context == "undefined" ? null : context), 
      onclick: actions.onUpdate
    }
    return h(C, attrs, ...children) as VNode
  }
}

/**
 * @category SettleButton
 */
export type SettleButtonExtraProps = {
  name: string, 
  result: Json
}

/**
 * @category SettleButton
 */
export type SettleButtonAutoProps = {
  'data-mg-name': string, 
  'data-mg-result': string, 
  onclick: UnmagicalAction<Event>
}

/**
 * @category SettleButton
 */
export const playSettleButton = <OtherAttrs extends {}>(C:NodeName<SettleButtonAutoProps & OtherAttrs>):UnmagicalComponent<SettleButtonExtraProps & OtherAttrs> => {
  return (props, children) => (state, actions) => {
    const {name, result, ...attributes} = props
    const attrs:SettleButtonAutoProps = {
      ...attributes, 
      'data-mg-name': name, 
      'data-mg-result': JSON.stringify(typeof result == "undefined" ? null : result), 
      onclick: actions.onPromiseSettle
    }
    return h(C, attrs, ...children) as VNode
  }
}

/**
 * @category Field
 */
export type FieldExtraProps = {
  path: string, 
  foldValidity?: boolean
}

/**
 * @category Field
 */
export type FieldAutoProps = {
  invalid: boolean, 
  message: string
}

/**
 * 
 * @param C 
 * @category Field
 */
export const playField = <OtherAttrs extends {}>(C:NodeName<FieldAutoProps & OtherAttrs>):UnmagicalComponent<FieldExtraProps & OtherAttrs> => {
  return (props, children) => (state, actions) => {
    const {path, foldValidity = false, ...attributes} = props
    if (! API.test(path, state.env)) return null
    const mdr = API.getMdr(path, state.env)
    const {invalid, error} = foldValidity ? API.foldValidity(path, state.env) : {invalid:mdr.invalid && mdr.touched, error:mdr.error}
    const attrs:FieldAutoProps = {
      ...attributes, 
      invalid, 
      message: error ? state.normalizeError(error).message : ''
    }
    return h(C, attrs, ...children) as VNode
  }
}

const dialogOnCreate:Record<string,OnCreateFunc> = {
  fade: (el:Element):void => {
    suspendRoot()
    el.animate([
      {opacity: 0}, 
      {opacity: 1}
    ], 200)
  }, 
  scale: (el:Element):void => {
    suspendRoot()
    el.animate([
      {transform: 'scale(0.8)'}, 
      {transform: 'scale(1)'}
    ])
  }
}

const dialogOnRemove:Record<string,OnRemoveFunc> = {
  fade: (el:Element, done:() => void):void => {
    resumeRoot()
    const anim = el.animate([
      {opacity: 1}, 
      {opacity: 0}
    ], 200)
    prepareToDestroy(el, anim, done)
  }, 
  scale: (el:Element, done:() => void):void => {
    resumeRoot()
    const anim = el.animate([
      {transform: 'scale(1)'}, 
      {transform: 'scale(0.8)'}
    ], 200)
    prepareToDestroy(el, anim, done)
  }
}

/**
 * @category Dialog
 */
export type DialogExtraProps = {
  name: string
}

/**
 * @category Dialog
 */
export type DialogAutoProps = {
  name: string, 
  data: any, 
  oncreate: OnCreateFunc, 
  onremove: OnRemoveFunc, 
  shown: boolean
}

/**
 * @category Dialog
 */
export const playDialog = (transition:"fade"|"scale", nullIfHidden:boolean) => <OtherAttrs extends {}>(C:NodeName<DialogAutoProps & OtherAttrs>):UnmagicalComponent<DialogExtraProps & OtherAttrs> => {
  return (props, children) => (state, actions) => {
    const attributes = props
    const name = attributes.name
    const data = API.getDialog(name, state.env)
    if (nullIfHidden && data === null) return null
    const attrs:DialogAutoProps = {
      ...attributes, 
      data, 
      oncreate: dialogOnCreate[transition], 
      onremove: dialogOnRemove[transition], 
      shown: (data !== null)
    }
    return h(C, attrs, ...children) as VNode
  }
}

const feedbackOnCreate:Record<string,OnCreateFunc> = {
  fade: (el) => {
    el.animate([
      {opacity: 0}, 
      {opacity: 1}
    ], 200)
    el.scrollIntoView()
  }, 
  zoom: (el) => {
    el.animate([
      {transform: 'scale(0.8)'}, 
      {transform: 'scale(1)'}
    ], 200)
    el.scrollIntoView()
  }, 
  slide: (el) => {
    const r = el.getBoundingClientRect()
    el.animate([
      {offset:0, maxHeight: 0}, 
      {offset:0.999, maxHeight: ((r.height * 1.2) + 30) + 'px'}, 
      {offset:1, maxHeight:'none'}
    ], 200)
    el.scrollIntoView()
  }
}
const feedbackOnRemove:Record<string,OnRemoveFunc> = {
  fade: (el, done) => {
    const anim = el.animate([
      {opacity: 1}, 
      {opacity: 0}
    ], 200)
    prepareToDestroy(el, anim, done)
  }, 
  zoom: (el, done) => {
    const anim = el.animate([
      {transform: 'scale(1)'}, 
      {transform: 'scale(0.8)'}
    ], 200)
    prepareToDestroy(el, anim, done)
  }, 
  slide: (el, done) => {
    const r = el.getBoundingClientRect()
    const anim = el.animate([
      {maxHeight: ((r.height * 1.2) + 30) + 'px'}, 
      {maxHeight: 0}
    ], 200)
    prepareToDestroy(el, anim, done)
  }
}

/**
 * @category Feedback
 */
export type FeedbackExtraProps = {
  name: string, 
  duration?: number
}

/**
 * @category Feedback
 */
export type FeedbackAutoProps = {
  name: string, 
  data: any, 
  shown: boolean, 
  oncreate: OnCreateFunc, 
  onremove: OnRemoveFunc
}

/**
 * @category Feedback
 */
export const playFeedback = (transition:"fade"|"zoom"|"slide", nullIfHidden:boolean) => <OtherAttrs extends {}>(C:NodeName<FeedbackAutoProps & OtherAttrs>):UnmagicalComponent<FeedbackExtraProps & OtherAttrs> => {
  return (props, children) => (state, actions) => {
    const {duration = 0, ...attributes} = props
    const name = attributes.name
    const data = API.getFeedback(name, state.env)
    if (nullIfHidden && data === null) return null
    const attrs:FeedbackAutoProps = {
      ...attributes, 
      data: ('code' in data) ? state.normalizeError(data) : data, 
      shown: data !== null, 
      oncreate: feedbackOnCreate[transition], 
      onremove: feedbackOnRemove[transition]
    }
    if (duration > 0) {
      let timeoutId = null
      const oncreate = attrs.oncreate
      attrs.oncreate = (el) => {
        timeoutId = setTimeout(() => actions.onUpdate({update:"closeFeedback", context:[name]}), duration)
        if (oncreate) oncreate(el)
      }
      const onremove = attrs.onremove
      attrs.onremove = (el, done) => {
        if (timeoutId) {
          clearTimeout(timeoutId)
        }
        if (onremove) onremove(el, done)
      }
    }
    return h(C, attrs, ...children) as VNode
  }
}

/**
 * @category Modal
 */
export type ModalExtraProps = {
  shown: boolean
}

/**
 * @category Modal
 */
export type ModalAutoProps = {
  shown: boolean, 
  oncreate: OnCreateFunc, 
  onremove: OnRemoveFunc
}

/**
 * @category Modal
 */
export const playModal = (transition:"fade"|"scale", nullIfHidden:boolean) => <OtherAttrs extends {}>(C:NodeName<ModalAutoProps & OtherAttrs>):UnmagicalComponent<ModalExtraProps & OtherAttrs> => {
  return (props, children) => (state, actions) => {
    const attributes = props
    if (! attributes.shown && nullIfHidden) return null
    const attrs:ModalAutoProps = {
      ...attributes, 
      oncreate: dialogOnCreate[transition], 
      onremove: dialogOnRemove[transition]
    }
    return h(C, attrs, ...children) as VNode
  }
}

/**
 * @category Progress
 */
export type ProgressExtraProps = {
  name: string
}

/**
 * @category Progress
 */
export type ProgressAutoProps = {
  name: string, 
  shown: boolean, 
  current: number|undefined
}

/**
 * @category Progress
 */
export const playProgress = (nullIfHidden:boolean) => <OtherAttrs extends {}>(C:NodeName<ProgressAutoProps & OtherAttrs>):UnmagicalComponent<ProgressExtraProps & OtherAttrs> => {
  return (props, children) => (state, actions) => {
    const attributes = props
    const name = attributes.name
    const current = API.getProgress(name, state.env)
    if (current === null && nullIfHidden) return null
    const attrs = {
      ...attributes, 
      shown: current !== null, 
      current: (current === null) ? undefined : current
    }
    return h(C, attrs, ...children) as VNode
  }
}

/**
 * @category Page
 */
export type PageExtraProps = {
  index: number, 
  name: string
}

/**
 * @category Page
 */
export type PageAutoProps = {
  index: number, 
  name: string, 
  shown: boolean
}

/**
 * @category Page
 */
export const playPage = (nullIfHidden:boolean) => <OtherAttrs extends {}>(C:NodeName<PageAutoProps & OtherAttrs>):UnmagicalComponent<PageExtraProps & OtherAttrs> => {
  return (props, children) => (state, actions) => {
    const attributes = props
    const index = attributes.index
    const name = attributes.name
    const current = API.getPage(name, state.env)
    const shown = (index == current)
    if (! shown && nullIfHidden) return null
    const attrs:PageAutoProps = {
      ...attributes, 
      shown
    }
    return h(C, attrs, ...children) as VNode
  }
}

const listItemOnCreate:Record<string,OnCreateFunc> = {
  fade: (el) => {
    el.animate([
      {opacity: 0}, 
      {opacity: 1}
    ], 200)
    el.scrollIntoView()
  }, 
  slide: (el) => {
    const r = el.getBoundingClientRect()
    el.animate([
      {offset:0, maxHeight: 0}, 
      {offset:0.999, maxHeight: ((r.height * 1.2) + 30) + 'px'}, 
      {offset:1, maxHeight:'none'}
    ], 200)
    el.scrollIntoView()
  }
}
const listItemOnRemove:Record<string,OnRemoveFunc> = {
  fade: (el, done) => {
    const anim = el.animate([
      {opacity: 1}, 
      {opacity: 0}
    ], 200)
    prepareToDestroy(el, anim, done)
  }, 
  slide: (el, done) => {
    const r = el.getBoundingClientRect()
    const anim = el.animate([
      {maxHeight: ((r.height * 1.2) + 30) + 'px'}, 
      {maxHeight: 0}
    ], 200)
    prepareToDestroy(el, anim, done)
  }
}

/**
 * @category Switch
 */
export type SwitchExtraProps = {
  name: string
}

/**
 * @category Switch
 */
export type SwitchAutoProps = {
  name: string, 
  shown: boolean
}

/**
 * @category Switch
 */
export const playSwitch = (nullIfHidden:boolean) => <OtherAttrs extends {}>(C:NodeName<SwitchAutoProps & OtherAttrs>):UnmagicalComponent<SwitchExtraProps & OtherAttrs> => {
  return (props, children) => (state, actions) => {
    const attributes = props
    const name = attributes.name
    const shown = API.getSwitch(name, state.env)
    if (! shown && nullIfHidden) return null
    const attrs = {
      ...attributes, 
      shown
    }
    return h(C, attrs, ...children) as VNode
  }
}

/**
 * @category ListItem
 */
export type ListItemExtraProps = {}

/**
 * @category ListItem
 */
export type ListItemAutoProps = {
  oncreate: OnCreateFunc, 
  onremove: OnRemoveFunc
}

/**
 * @category ListItem
 */
export const playListItem = (transition:"fade"|"slide") => <OtherAttrs extends {}>(C:NodeName<ListItemAutoProps & OtherAttrs>):UnmagicalComponent<ListItemExtraProps & OtherAttrs> => {
  return (props, children) => (state, actions) => {
    const attributes = props
    const attrs:ListItemAutoProps = {
      ...attributes, 
      oncreate: listItemOnCreate[transition], 
      onremove: listItemOnRemove[transition]
    }
    return h(C, attrs, ...children) as VNode
  }
}

const getSiblings = (pageNo:number, width:number, firstPageNo:number, lastPageNo:number):number[] => {
  const rv = []
  for (let i = pageNo - width; i <= pageNo + width; i++) {
    if (i < firstPageNo) continue
    if (i > lastPageNo) continue
    rv.push(i)
  }
  return rv
}

/**
 * @category Pagination
 */
export type PaginationExtraProps = {
  listPath: string, 
  width?: number, 
  pageProperty?: string, 
  limitProperty?: string
}

/**
 * @category Pagination
 */
export type PaginationAutoProps = {
  listPath: string, 
  current: number|null, 
  prev: number|null, 
  next: number|null, 
  first: number|null, 
  last: number|null, 
  siblings: number[]
}

/**
 * @category Pagination
 */
export const playPagination = <OtherAttrs extends {}>(C:NodeName<PaginationAutoProps & OtherAttrs>):UnmagicalComponent<PaginationExtraProps & OtherAttrs> => {
  return (props, children) => (state, actions) => {
    const {listPath, width = 2, pageProperty = 'page', limitProperty = 'limit', ...attributes} = props
    const query = API.extract(listPath + '/query', state.env)
    const totalCount = +API.extract(listPath + '/totalCount', state.env)
    const page = query[pageProperty]
    if (totalCount > 0) {
      const first = 1
      const last = Math.ceil(totalCount / query[limitProperty])
      const siblings = getSiblings(page, width, first, last)
      const attrs:PaginationAutoProps = {
        ...attributes, 
        listPath, 
        current: page, 
        prev: first < page ? page - 1 : null, 
        next: page < last ? page + 1 : null, 
        first: first < page - width ? first : null, 
        last: page + width < last ? last : null, 
        siblings
      }
      return h(C, attrs, ...children) as VNode
    } else {
      const attrs:PaginationAutoProps = {
        ...attributes, 
        listPath, 
        current: null, 
        prev: null, 
        next: null, 
        first: null, 
        last: null, 
        siblings: []
      }
      return h(C, attrs, ...children) as VNode
    }
  }
}

const instantiateFlatpickr = (path:string, onchange:UnmagicalAction<{path:string,input:string}|[{path:string,input:string}]>, defaultValue:string, clearerId:string, config:object):{oncreate:OnCreateFunc,ondestroy:OnDestroyFunc} => {
  let instance = null
  return {
    oncreate: (el) => {
      const cfg = {
        ...config, 
        defaultDate: defaultValue || null
      }
      // @ts-ignore
      instance = flatpickr(el, cfg)
      instance.config.onChange.push((selectedDates, dateStr:string) => {
        onchange({path, input:dateStr})
      })
      if (clearerId) {
        const clearer = document.getElementById(clearerId)
        if (clearer) {
          clearer.onclick = instance.clear
        }
      }
    }, 
    ondestroy: (el) => {
      if (instance) {
        instance.destroy()
        instance = null
      }
    }
  }
}

/**
 * @category Flatpickr
 */
export type FlatpickrExtraProps = {
  path: string, 
  clearerId: string|null, 
  config: object
}

/**
 * @category Flatpickr
 */
export type FlatpickrAutoProps = {
  invalid: boolean, 
  message: string, 
  oncreate: OnCreateFunc, 
  ondestroy: OnDestroyFunc
}

/**
 * @category Flatpickr
 */
export const playFlatpickr = <OtherAttrs extends {}>(C:NodeName<FlatpickrAutoProps & OtherAttrs>):UnmagicalComponent<FlatpickrExtraProps & OtherAttrs> => {
  return (props, children) => (state, actions) => {
    const {path, clearerId = null, config = {}, ...attributes} = props
    const mdr = API.getMdr(path, state.env)
    if (! mdr) return null
    const {oncreate, ondestroy} = instantiateFlatpickr(path, actions.onSmartControlChange, mdr.input, clearerId, config)
    const invalid = ((mdr.touched || false) && (mdr.invalid || false))
    const attrs:FlatpickrAutoProps = {
      ...attributes, 
      invalid, 
      message: mdr.error ? state.normalizeError(mdr.error).message : '', 
      oncreate, 
      ondestroy
    }
    return h(C, attrs, ...children) as VNode
  }
}

const instantiatePickr = (path:string, onchange:UnmagicalAction<{path:string,input:string}|[{path:string,input:string}]>, defaultValue:string, clearerId:string, options:object):{oncreate:OnCreateFunc, ondestroy:OnDestroyFunc} => {
  let instance = null
  return {
    oncreate: (el) => {
      const opts = {
        ...options, 
        useAsButton: true, 
        default: defaultValue || null, 
        el
      }
      // @ts-ignore
      instance = Pickr.create(opts)
      instance.on('clear', () => {
        onchange({path, input:''})
      }).on('save', (color) => {
        const input = color ? color.toHEXA().toString() : null
        instance.hide()
        onchange({path, input})
      })
      if (clearerId) {
        const clearer = document.getElementById(clearerId)
        if (clearer) {
          clearer.onclick = (ev) => {
            instance.setColor(null)
          }
        }
      }
    }, 
    ondestroy: (el) => {
      if (instance) {
        instance.destroy()
        instance = null
      }
    }
  }
}

/**
 * @category Pickr
 */
export type PickrExtraProps = {
  path: string, 
  clearerId: string, 
  options: object
}

/**
 * @category Pickr
 */
export type PickrAutoProps = {
  value: string, 
  invalid: boolean, 
  message: string, 
  oncreate: OnCreateFunc, 
  ondestroy: OnDestroyFunc
}

/**
 * @category Pickr
 */
export const playPickr = <OtherAttrs extends {}>(C:NodeName<PickrAutoProps & OtherAttrs>):UnmagicalComponent<PickrExtraProps & OtherAttrs> => {
  return (props, children) => (state, actions) => {
    const {path, clearerId = null, options = {}, ...attributes} = props
    const mdr = API.getMdr(path, state.env)
    if (! mdr) return null
    const {oncreate, ondestroy} = instantiatePickr(path, actions.onSmartControlChange, mdr.input, clearerId, options)
    const invalid = ((mdr.touched || false) && (mdr.invalid || false))
    const attrs:PickrAutoProps = {
      ...attributes, 
      value: mdr.input, 
      invalid, 
      message: mdr.error ? state.normalizeError(mdr.error).message : '', 
      oncreate, 
      ondestroy
    }
    return h(C, attrs, ...children) as VNode
  }
}
interface SortableEvent {
  from: HTMLElement, 
  to: HTMLElement, 
  item: HTMLElement, 
  oldIndex: number, 
  newIndex: number
}

const instantiateSortable = (name:string, onStart:UnmagicalAction<{update:string,context:any[]}>, onEnd:UnmagicalAction<{name:string,result:any}>, options:object):{oncreate:OnCreateFunc, ondestroy:OnDestroyFunc} => {
  var instance = null;
  var marker = null;
  var group = null;
  const effectiveOptions = {
    ...options, 
    onStart: (ev:SortableEvent) => {
      const fromPath = ev.from.dataset.mgPath
      marker = ev.item.nextElementSibling
      onStart({
        update: 'reorder', 
        context: [name, fromPath + '/' + ev.oldIndex, group]
      })
    }, 
    onEnd: (ev:SortableEvent) => {
      setTimeout(function() {
        ev.from.insertBefore(ev.item, marker)
        marker = null
      }, 0)
      const toPath = ev.to.dataset.mgPath
      onEnd({
        name, 
        result: {
          path: toPath + '/' + ev.newIndex
        }
      })
    }
  }
  return {
    oncreate: (el) => {
      // @ts-ignore
      instance = Sortable.create(el, effectiveOptions)
      group = instance.option('group').name
    }, 
    ondestroy: () => {
      if (instance) {
        instance.destroy()
        instance = null
      }
    }
  }
}

/**
 * @category Sortable
 */
export type SortableExtraProps = {
  name: string, 
  path: string, 
  options: object
}

/**
 * @category Sortable
 */
export type SortableAutoProps = {
  'data-mg-path': string, 
  active: boolean, 
  itemPath: string, 
  group: string, 
  oncreate: OnCreateFunc, 
  ondestroy: OnDestroyFunc
}

/**
 * @category Sortable
 */
export const playSortable = <OtherAttrs extends {}>(C:NodeName<SortableAutoProps & OtherAttrs>):UnmagicalComponent<SortableExtraProps & OtherAttrs> => {
  return (props, children) => (state, actions) => {
    const {name, path, options = {}, ...attributes} = props
    const extra = API.getExtra(name, state.env) as {itemPath:string, group:string}
    const active = !!extra
    const {oncreate, ondestroy} = instantiateSortable(name, actions.onUpdate, actions.onPromiseSettle, options)
    const attrs:SortableAutoProps = {
      ...attributes, 
      'data-mg-path': path, 
      active, 
      itemPath: extra ? extra.itemPath : "", 
      group: extra ? extra.group : "", 
      oncreate, 
      ondestroy
    }
    return h(C, attrs, ...children) as VNode
  }
}



