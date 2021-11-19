
import { API, h } from './framework'
import * as X from './errors'

export const defaultAttributeMap = {
  textbox: {
    oninput: 'oninput', 
    onblur: 'onblur', 
    value: 'value', 
    class: 'class', 
    invalidClass: 'mg-invalid', 
    invalid: '', 
    message: '', 
    fixedClass: ''
  }, 
  slider: {
    oninput: 'oninput', 
    onchange: 'onchange', 
    value: 'value', 
    class: 'class', 
    invalidClass: 'mg-invalid', 
    invalid: '', 
    message: '', 
    fixedClass: ''
  }, 
  listbox: {
    onchange: 'onchange', 
    class: 'class', 
    invalidClass: 'mg-invalid', 
    invalid: '', 
    value: 'value', 
    option: {
      selected: 'selected', 
      value: 'value'
    }, 
    message: '', 
    fixedClass: ''
  }, 
  radio: {
    onchange: 'onchange', 
    checked: 'checked', 
    value: 'value', 
    class: 'class', 
    invalidClass: 'mg-invalid', 
    invalid: '', 
    message: '', 
    fixedClass: ''
  }, 
  checkbox: {
    onchange: 'onchange', 
    checked: 'checked', 
    class: 'class', 
    invalidClass: 'mg-invalid', 
    invalid: '', 
    message: '', 
    fixedClass: ''
  }, 
  smartControl: {
    onchange: 'onchange', 
    value: '', 
    class: 'class', 
    fixedClass: ''
    // TODO: follow standard
  }, 
  field: {
    class: 'class', 
    invalidClass: '', 
    invalid: 'invalid', 
    message: 'message', 
    fixedClass: ''
  }, 
  updateButton: {
    onclick: 'onclick', 
    class: 'class', 
    fixedClass: ''
  }, 
  settleButton: {
    onclick: 'onclick', 
    class: 'class', 
    fixedClass: ''
  }, 
  dialog: {
    '@nullIfHidden': true, 
    data: 'data', 
    class: 'class', 
    shown: 'shown', 
    shownClass: 'mg-shown', 
    fixedClass: '', 
    '@transition': 'fade'
  }, 
  feedback: {
    '@nullIfHidden': true, 
    data: 'data', 
    class: 'class', 
    shown: 'shown', 
    shownClass: 'mg-shown', 
    fixedClass: '', 
    '@transition': 'slide'
  }, 
  progress: {
    '@nullIfHidden': true, 
    current: 'current', 
    class: 'class', 
    shown: 'shown', 
    shownClass: 'mg-shown', 
    fixedClass: ''
  }, 
  page: {
    '@nullIfHidden': true, 
    class: 'class', 
    shown: 'shown', 
    shownClass: 'mg-shown', 
    fixedClass: ''
  }, 
  'switch': {
    '@nullIfHidden': true, 
    class: 'class', 
    shown: 'shown', 
    shownClass: 'mg-shown', 
    fixedClass: ''
  }, 
  pagination: {
    current: 'current', 
    prev: 'prev', 
    next: 'next', 
    first: 'first', 
    last: 'last', 
    siblings: 'siblings', 
    fixedClass: ''
  }, 
  listItem: {
    '@transition': 'slide'
  }, 
  modal: {
    '@nullIfHidden': true, 
    class: 'class', 
    shown: 'shown', 
    shownClass: 'mg-shown', 
    fixedClass: '', 
    '@transition': 'fade'
  }, 
  flatpickr: {
    invalid: '', 
    class: 'class', 
    invalidClass: 'mg-invalid', 
    message: '', 
    fixedClass: ''
  }, 
  pickr: {
    value: 'value', 
    invalid: '', 
    class: 'class', 
    invalidClass: 'mg-invalid', 
    message: '', 
    fixedClass: ''
  }, 
  sortable: {
    active: 'active', 
    activeClass: 'mg-active', 
    itemPath: 'itemPath', 
    group: 'group', 
    fixedClass: ''
  }
}

export const suspendRoot = () => {
  const rootEl = document.documentElement
  const c = rootEl.dataset.mgSuspendCount
  if (!c || c < 1) {
    rootEl.dataset.mgSuspendCount = 1
    rootEl.style.overflow = "hidden"
  } else {
    rootEl.dataset.mgSuspendCount = c - 1
  }
}

export const resumeRoot = () => {
  const rootEl = document.documentElement
  const c = rootEl.dataset.mgSuspendCount
  if (c <= 1) {
    delete rootEl.dataset.mgSuspendCount
    rootEl.style.overflow = null
  } else {
    rootEl.dataset.mgSuspendCount = c + 1
  }
}

export const prepareToDestroy = (el, anim, done) => {
  const tid = setTimeout(() => {
    done()
    anim.onfinish = null
  }, 800)
  anim.onfinish = () => {
    done()
    clearTimeout(tid)
  }
}

export const compose = (p1, p2) => (C, map = null) => {
  return (props, children) => (state, actions) => {
    const more = (props, children) => {
      return p1(C, map)(props, children)(state, actions)
    }
    const x = p2(more, map)(props, children)(state, actions)
    return x || p1(C, map)(props, children)(state, actions)
  }
}

const addClass = (attributes, attr, clazz) => {
  if (! clazz) return
  if (! attributes.hasOwnProperty(attr)) attributes[attr] = ''
  attributes[attr] += ' ' + clazz
}

const addAttr = (attributes, attr, value) => {
  if (! attr) return
  attributes[attr] = value
}

const addMessageAttr = (attributes, attr, error, normalize) => {
  if (! attr) return
  if (! error) return
  attributes[attr] = normalize(error).message
}

export const playTextbox = (C, map = {}) => {
  map = {...defaultAttributeMap.textbox, ...map}
  return (props, children) => (state, actions) => {
    const {'mg-path':path, ...attributes} = props
    const slot = API.getSlot(path, state.env)
    if (! slot) return null
    attributes['data-mg-path'] = path
    attributes['data-mg-value-attribute'] = map.value
    attributes[map.oninput] = actions.onTextboxInput
    attributes[map.onblur] = actions.onTextboxBlur
    attributes[map.value] = slot.input
    const invalid = ((slot.touched || false) && (slot.invalid || false))
    addAttr(attributes, map.invalid, invalid)
    addClass(attributes, map.class, invalid ? map.invalidClass : "")
    addMessageAttr(attributes, map.message, slot.error, state.normalizeError)
    addClass(attributes, map.class, map.fixedClass)
    return h(C, attributes, ...children)
  }
}

export const Textbox = playTextbox("input")

export const playSlider = (C, map = {}) => {
  map = {...defaultAttributeMap.slider, ...map}
  return (props, children) => (state, actions) => {
    const {'mg-path':path, ...attributes} = props
    const slot = API.getSlot(path, state.env)
    if (! slot) return null
    attributes['data-mg-path'] = path
    attributes['data-mg-value-attribute'] = map.value
    attributes[map.oninput] = actions.onSliderInput
    attributes[map.onchange] = actions.onSliderChange
    attributes[map.value] = slot.input
    const invalid = ((slot.touched || false) && (slot.invalid || false))
    addAttr(attributes, map.invalid, invalid)
    addClass(attributes, map.class, invalid ? map.invalidClass : "")
    addMessageAttr(attributes, map.message, slot.error, state.normalizeError)
    addClass(attributes, map.class, map.fixedClass)
    return h(C, attributes, ...children)
  }
}

export const Slider = playSlider("input")

const convertChildren = (input, selectedAttr, valueAttr, children) => {
  const inner = (children) => {
    children.forEach(c => {
      if (typeof c != 'object') return
      if (valueAttr in c.attributes) {
        c.attributes[selectedAttr] = c.attributes[valueAttr] == input
      }
      if (c.children) {
        inner(c.children)
      }
    })
  }
  inner(children)
}

export const playListbox = (C, map = {}) => {
  map = {...defaultAttributeMap.listbox, ...map}
  return (props, children) => (state, actions) => {
    const {'mg-path':path, ...attributes} = props
    const slot = API.getSlot(path, state.env)
    if (! slot) return null
    attributes['data-mg-path'] = path
    attributes['data-mg-value-attribute'] = map.value
    attributes[map.onchange] = actions.onListboxChange
    const invalid = ((slot.touched || false) && (slot.invalid || false))
    addAttr(attributes, map.invalid, invalid)
    addClass(attributes, map.class, invalid ? map.invalidClass : "")
    convertChildren(slot.input, map.option.selected, map.option.value, children)
    addMessageAttr(attributes, map.message, slot.error, state.normalizeError)
    addClass(attributes, map.class, map.fixedClass)
    return h(C, attributes, ...children)
  }
}

export const Listbox = playListbox("select")

export const playRadio = (C, map = {}) => {
  map = {...defaultAttributeMap.radio, ...map}
  return (props, children) => (state, actions) => {
    const {'mg-path':path, ...attributes} = props
    const slot = API.getSlot(path, state.env)
    if (! slot) return null
    attributes['data-mg-path'] = path
    attributes['data-mg-value-attribute'] = map.value
    attributes[map.onchange] = actions.onRadioChange
    attributes[map.checked] = attributes[map.value] == slot.value
    const invalid = ((slot.touched || false) && (slot.invalid || false))
    addAttr(attributes, map.invalid, invalid)
    addClass(attributes, map.class, invalid ? map.invalidClass : "")
    addMessageAttr(attributes, map.message, slot.error, state.normalizeError)
    addClass(attributes, map.class, map.fixedClass)
    return h(C, attributes, ...children)
  }
}

export const Radio = playRadio("input")

export const playCheckbox = (C, map = {}) => {
  map = {...defaultAttributeMap.checkbox, ...map}
  return (props, children) => (state, actions) => {
    const {'mg-path':path, ...attributes} = props
    const slot = API.getSlot(path, state.env)
    if (! slot) return null
    attributes['data-mg-path'] = path
    attributes['data-mg-checked-attribute'] = map.checked
    attributes[map.onchange] = actions.onCheckboxChange
    attributes[map.checked] = slot.value
    const invalid = ((slot.touched || false) && (slot.invalid || false))
    addAttr(attributes, map.invalid, invalid)
    addClass(attributes, map.class, invalid ? map.invalidClass : "")
    addMessageAttr(attributes, map.message, slot.error, state.normalizeError)
    addClass(attributes, map.class, map.fixedClass)
    return h(C, attributes, ...children)
  }
}

export const Checkbox = playCheckbox("input")

// TODO: file, number, date, color, range, ...

export const playSmartControl = (C, map = {}) => {
  map = {...defaultAttributeMap.smartControl, ...map}
  return (props, children) => (state, actions) => {
    const {...attributes} = props
    const path = props['mg-path']
    const slot = API.getSlot(path, state.env)
    if (! slot) return null
    attributes[map.onchange] = actions.onSmartControlChange
    addAttr(attributes, map.value, slot.input)
    addClass(attributes, map.class, map.fixedClass)
    return h(C, attributes, ...children)
  }
}

export const playField = (C, map = {}) => {
  map = {...defaultAttributeMap.field, ...map}
  return (props, children) => (state, actions) => {
    const {'mg-path':path, 'mg-fold-validity':foldValidity, ...attributes} = props
    if (! API.test(path, state.env)) return null
    const slot = API.getSlot(path, state.env)
    const {invalid, error} = foldValidity ? API.foldValidity(path, state.env) : {invalid:slot.invalid && slot.touched, error:slot.error}
    addAttr(attributes, map.invalid, invalid)
    addClass(attributes, map.class, invalid ? map.invalidClass : "")
    addMessageAttr(attributes, map.message, error, state.normalizeError)
    addClass(attributes, map.class, map.fixedClass)
    return h(C, attributes, ...children)
  }
}

export const playUpdateButton = (C, map = {}) => {
  map = {...defaultAttributeMap.updateButton, ...map}
  return (props, children) => (state, actions) => {
    const {'mg-update':update, 'mg-context':context, ...attributes} = props
    attributes['data-mg-update'] = update
    attributes['data-mg-context'] = JSON.stringify(typeof context == "undefined" ? null : context)
    attributes[map.onclick] = actions.onUpdate
    addClass(attributes, map.class, map.fixedClass)
    return h(C, attributes, ...children)
  }
}

export const UpdateButton = playUpdateButton("button")

export const playSettleButton = (C, map = {}) => {
  map = {...defaultAttributeMap.settleButton, ...map}
  return (props, children) => (state, actions) => {
    const {'mg-name':name, 'mg-result':result, ...attributes} = props
    attributes['data-mg-name'] = name
    attributes['data-mg-result'] = JSON.stringify(typeof result == "undefined" ? null : result)
    attributes[map.onclick] = actions.onPromiseSettle
    addClass(attributes, map.class, map.fixedClass)
    return h(C, attributes, ...children)
  }
}

export const SettleButton = playSettleButton("button")

const dialogOnCreate = {
  fade: (el) => {
    suspendRoot()
    el.animate([
      {opacity: 0}, 
      {opacity: 1}
    ], 200)
  }, 
  scale: (el) => {
    suspendRoot()
    el.animate([
      {transform: 'scale(0.8)'}, 
      {transform: 'scale(1)'}
    ])
  }
}
const dialogOnRemove = {
  fade: (el, done) => {
    resumeRoot()
    const anim = el.animate([
      {opacity: 1}, 
      {opacity: 0}
    ], 200)
    prepareToDestroy(el, anim, done)
  }, 
  scale: (el, done) => {
    resumeRoot()
    const anim = el.animate([
      {transform: 'scale(1)'}, 
      {transform: 'scale(0.8)'}
    ], 200)
    prepareToDestroy(el, anim, done)
  }
}

export const playDialog = (C, map = {}) => {
  map = {...defaultAttributeMap.dialog, ...map}
  return (props, children) => (state, actions) => {
    const {...attributes} = props
    const name = attributes['mg-name']
    const data = API.getDialog(name, state.env)
    if (data === null && map['@nullIfHidden']) return null
    attributes[map.data] = data
    attributes.oncreate = dialogOnCreate[map['@transition']]
    attributes.onremove = dialogOnRemove[map['@transition']]
    addAttr(attributes, map.shown, (data !== null))
    addClass(attributes, map.class, data !== null ? map.shownClass : "")
    addClass(attributes, map.class, map.fixedClass)
    return h(C, attributes, ...children)
  }
}

const feedbackOnCreate = {
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
const feedbackOnRemove = {
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

export const playFeedback = (C, map = {}) => {
  map = {...defaultAttributeMap.feedback, ...map}
  return (props, children) => (state, actions) => {
    const {...attributes} = props
    const name = attributes['mg-name']
    const duration = attributes['mg-duration']
    const data = API.getFeedback(name, state.env)
    if (data === null && map['@nullIfHidden']) return null
    attributes[map.data] = X.isError(data) ? state.normalizeError(data) : data
    attributes.oncreate = feedbackOnCreate[map['@transition']]
    attributes.onremove = feedbackOnRemove[map['@transition']]
    addAttr(attributes, map.shown, (data !== null))
    addClass(attributes, map.class, data !== null ? map.shownClass : "")
    if (duration && duration > 0) {
      let timeoutId = null
      const oncreate = attributes.oncreate
      addAttr(attributes, 'oncreate', (el) => {
        timeoutId = setTimeout(() => actions.onUpdate({update:"closeFeedback", context:[name]}), duration)
        if (oncreate) oncreate(el)
      })
      const onremove = attributes.onremove
      addAttr(attributes, 'onremove', (el, done) => {
        if (timeoutId) {
          clearTimeout(timeoutId)
        }
        if (onremove) onremove(el, done)
      })
    }
    addClass(attributes, map.class, map.fixedClass)
    return h(C, attributes, ...children)
  }
}

export const playProgress = (C, map = {}) => {
  map = {...defaultAttributeMap.progress, ...map}
  return (props, children) => (state, actions) => {
    const {...attributes} = props
    const name = attributes['mg-name']
    const current = API.getProgress(name, state.env)
    if (current === null && map['@nullIfHidden']) return null
    if (current !== null && current != -1) addAttr(attributes, map.current, current)
    addAttr(attributes, map.shown, current !== null)
    addClass(attributes, map.class, current !== null ? map.shownClass : "")
    addClass(attributes, map.class, map.fixedClass)
    return h(C, attributes, ...children)
  }
}

export const playPage = (C, map = {}) => {
  map = {...defaultAttributeMap.page, ...map}
  return (props, children) => (state, actions) => {
    const {...attributes} = props
    const index = attributes['mg-index']
    const name = attributes['mg-name']
    const current = API.getPage(name, state.env)
    const shown = (index == current)
    if (! shown && map['@nullIfHidden']) return null
    addAttr(attributes, map.shown, shown)
    addClass(attributes, map.class, shown ? map.shownClass : "")
    addClass(attributes, map.class, map.fixedClass)
    return h(C, attributes, ...children)
  }
}

export const playSwitch = (C, map = {}) => {
  map = {...defaultAttributeMap.switch, ...map}
  return (props, children) => (state, actions) => {
    const {...attributes} = props
    const name = attributes['mg-name']
    const shown = API.getSwitch(name, state.env)
    if (! shown && map['@nullIfHidden']) return null
    addAttr(attributes, map.shown, shown)
    addClass(attributes, map.class, shown ? map.shownClass : "")
    addClass(attributes, map.class, map.fixedClass)
    return h(C, attributes, ...children)
  }
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

// width, pageProperty, limitProperty, listPath
// prev:number, next:number, first:number, last:number, siblings:number[]
export const playPagination = (C, map = {}) => {
  map = {...defaultAttributeMap.pagination, ...map}
  return (props, children) => (state, actions) => {
    const {'mg-width':width = 2, 'mg-page-property':pageProperty, 'mg-limit-property':limitProperty, ...attributes} = props
    const listPath = attributes['mg-list-path']
    const query = API.extract(listPath + '/query', state.env)
    const totalCount = API.extract(listPath + '/totalCount', state.env)
    const page = query[pageProperty]
    if (totalCount) {
      const first = 1
      const last = Math.ceil(totalCount / query[limitProperty])
      const siblings = getSiblings(page, width, first, last)
      attributes[map.current] = page
      attributes[map.prev] = first < page ? page - 1 : null
      attributes[map.next] = page < last ? page + 1 : null
      attributes[map.first] = first < page - width ? first : null
      attributes[map.last] = page + width < last ? last : null
      attributes[map.siblings] = siblings
    } else {
      attributes[map.current] = null
      attributes[map.prev] = null
      attributes[map.next] = null
      attributes[map.first] = null
      attributes[map.last] = null
      attributes[map.siblings] = []
    }
    addClass(attributes, map.class, map.fixedClass)
    return h(C, attributes, ...children)
  }
}


const listItemOnCreate = {
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
const listItemOnRemove = {
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
export const playListItem = (C, map = {}) => {
  map = {...defaultAttributeMap.listItem, ...map}
  return (props, children) => (state, actions) => {
    const {...attributes} = props
    attributes.oncreate = listItemOnCreate[map['@transition']]
    attributes.onremove = listItemOnRemove[map['@transition']]
    return h(C, attributes, ...children)
  }
}

export const playModal = (C, map = {}) => {
  map = {...defaultAttributeMap.modal, ...map}
  return (props, children) => (state, actions) => {
    const {'mg-shown':shown = false, ...attributes} = props
    if (! shown && map['@nullIfHidden']) return null
    attributes.oncreate = dialogOnCreate[map['@transition']]
    attributes.onremove = dialogOnRemove[map['@transition']]
    addAttr(attributes, map.shown, shown)
    addClass(attributes, map.class, shown ? map.shownClass : "")
    addClass(attributes, map.class, map.fixedClass)
    return h(C, attributes, ...children)
  }
}

const instantiateFlatpickr = (path, onchange, defaultValue, clearerId, config) => {
  let instance = null
  return {
    oncreate: (el) => {
      const cfg = {
        ...config, 
        defaultDate: defaultValue || null
      }
      instance = flatpickr(el, cfg)
      instance.config.onChange.push((selectedDates, dateStr) => {
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
export const playFlatpickr = (C, map = {}) => {
  map = {...defaultAttributeMap.flatpickr, ...map}
  return (props, children) => (state, actions) => {
    const {'mg-path':path, clearerId = null, config = {}, ...attributes} = props
    const slot = API.getSlot(path, state.env)
    if (! slot) return null
    const {oncreate, ondestroy} = instantiateFlatpickr(path, actions.onSmartControlChange, slot.input, clearerId, config)
    attributes.oncreate = oncreate
    attributes.ondestroy = ondestroy
    const invalid = ((slot.touched || false) && (slot.invalid || false))
    addAttr(attributes, map.invalid, invalid)
    addClass(attributes, map.class, invalid ? map.invalidClass : "")
    addMessageAttr(attributes, map.message, slot.error, state.normalizeError)
    addClass(attributes, map.class, map.fixedClass)
    return h(C, attributes, ...children)
  }
}

const instantiatePickr = (path, onchange, defaultValue, clearerId, options) => {
  let instance = null
  return {
    oncreate: (el) => {
      const opts = {
        ...options, 
        useAsButton: true, 
        default: defaultValue || null, 
        el
      }
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
export const playPickr = (C, map = {}) => {
  map = {...defaultAttributeMap.pickr, ...map}
  return (props, children) => (state, actions) => {
    const {'mg-path':path, clearerId = null, options = {}, ...attributes} = props
    const slot = API.getSlot(path, state.env)
    if (! slot) return null
    const {oncreate, ondestroy} = instantiatePickr(path, actions.onSmartControlChange, slot.input, clearerId, options)
    attributes.oncreate = oncreate
    attributes.ondestroy = ondestroy
    const invalid = ((slot.touched || false) && (slot.invalid || false))
    addAttr(attributes, map.value, slot.input)
    addAttr(attributes, map.invalid, invalid)
    addClass(attributes, map.class, invalid ? map.invalidClass : "")
    addMessageAttr(attributes, map.message, slot.error, state.normalizeError)
    addClass(attributes, map.class, map.fixedClass)
    return h(C, attributes, ...children)
  }
}

const instantiateSortable = (name, onStart, onEnd, options) => {
  var instance = null;
  var marker = null;
  var group = null;
  const effectiveOptions = {
    ...options, 
    onStart: (ev) => {
      const fromPath = ev.from.dataset.mgPath
      marker = ev.item.nextElementSibling
      onStart({
        update: 'reorder', 
        context: [name, fromPath + '/' + ev.oldIndex, group]
      })
    }, 
    onEnd: (ev) => {
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
export const playSortable = (C, map = {}) => {
  map = {...defaultAttributeMap.sortable, ...map}
  return (props, children) => (state, actions) => {
    const {'mg-name':name, 'mg-path':path, options = {}, ...attributes} = props
    const extra = API.getExtra(name, state.env)
    const active = !!extra
    const {oncreate, ondestroy} = instantiateSortable(name, actions.onUpdate, actions.onPromiseSettle, options)
    attributes.oncreate = oncreate
    attributes.ondestroy = ondestroy
    attributes['data-mg-path'] = path
    addAttr(attributes, map.active, active)
    addClass(attributes, map.activeClass, active ? map.activeClass : "")
    addClass(attributes, map.class, map.fixedClass)
    addAttr(attributes, map.itemPath, extra ? extra.itemPath : "")
    addAttr(attributes, map.group, extra ? extra.group : "")
    return h(C, attributes, ...children)
  }
}
