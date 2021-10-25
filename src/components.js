
import { API, h } from './framework'

export const defaultAttributeMap = {
  textbox: {
    oninput: 'oninput', 
    onblur: 'onblur', 
    value: 'value', 
    class: 'class', 
    invalidClass: 'mg-invalid', 
    invalid: ''
  }, 
  slider: {
    oninput: 'oninput', 
    onchange: 'onchange', 
    value: 'value', 
    class: 'class', 
    invalidClass: 'mg-invalid', 
    invalid: ''
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
    }
  }, 
  radio: {
    onchange: 'onchange', 
    checked: 'checked', 
    value: 'value', 
    class: 'class', 
    invalidClass: 'mg-invalid', 
    invalid: ''
  }, 
  checkbox: {
    onchange: 'onchange', 
    checked: 'checked', 
    class: 'class', 
    invalidClass: 'mg-invalid', 
    invalid: ''
  }, 
  updateButton: {
    onclick: 'onclick'
  }, 
  settleButton: {
    onclick: 'onclick'
  }, 
  dialog: {
    '@nullIfHidden': true, 
    message: 'message', 
    class: 'class', 
    shown: 'shown', 
    shownClass: 'mg-shown'
  }, 
  progress: {
    '@nullIfHidden': true, 
    current: 'current', 
    class: 'class', 
    shown: 'shown', 
    shownClass: 'mg-shown'
  }, 
  page: {
    '@nullIfHidden': true, 
    class: 'class', 
    shown: 'shown', 
    shownClass: 'mg-shown'
  }, 
  'switch': {
    '@nullIfHidden': true, 
    class: 'class', 
    shown: 'shown', 
    shownClass: 'mg-shown'
  }, 
  smartControl: {
    onchange: 'onchange', 
    value: ''
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

export const playTextbox = (C, map = null) => {
  map = map || defaultAttributeMap.textbox
  return (props, children) => (state, actions) => {
    const {'mg-path':path, ...attributes} = props
    const slot = API.getSlot(path, state.env)
    attributes['data-mg-path'] = path
    attributes['data-mg-value-attribute'] = map.value
    attributes[map.oninput] = actions.onTextboxInput
    attributes[map.onblur] = actions.onTextboxBlur
    attributes[map.value] = slot.input
    const invalid = ((slot.touched || false) && (slot.invalid || false))
    addAttr(attributes, map.invalid, invalid)
    addClass(attributes, map.class, invalid ? map.invalidClass : "")
    return h(C, attributes, ...children)
  }
}

export const Textbox = playTextbox("input")

export const playSlider = (C, map = null) => {
  map = map || defaultAttributeMap.slider
  return (props, children) => (state, actions) => {
    const {'mg-path':path, ...attributes} = props
    const slot = API.getSlot(path, state.env)
    attributes['data-mg-path'] = path
    attributes['data-mg-value-attribute'] = map.value
    attributes[map.oninput] = actions.onSliderInput
    attributes[map.onchange] = actions.onSliderChange
    attributes[map.value] = slot.input
    const invalid = ((slot.touched || false) && (slot.invalid || false))
    addAttr(attributes, map.invalid, invalid)
    addClass(attributes, map.class, invalid ? map.invalidClass : "")
    return h(C, attributes, ...children)
  }
}

export const Slider = playSlider("input")

export const playListbox = (C, map = null) => {
  map = map || defaultAttributeMap.listbox
  return (props, children) => (state, actions) => {
    const {'mg-path':path, ...attributes} = props
    const slot = API.getSlot(path, state.env)
    attributes['data-mg-path'] = path
    attributes['data-mg-value-attribute'] = map.value
    attributes[map.onchange] = actions.onListboxChange
    const invalid = ((slot.touched || false) && (slot.invalid || false))
    addAttr(attributes, map.invalid, invalid)
    addClass(attributes, map.class, invalid ? map.invalidClass : "")
    children.forEach((o) => {
      o.attributes[map.option.selected] = o.attributes[map.option.value] == slot['@value']
    })
    return h(C, attributes, ...children)
  }
}

export const Listbox = playListbox("select")

export const playRadio = (C, map = null) => {
  map = map || defaultAttributeMap.radio
  return (props, children) => (state, actions) => {
    const {'mg-path':path, ...attributes} = props
    const slot = API.getSlot(path, state.env)
    attributes['data-mg-path'] = path
    attributes['data-mg-value-attribute'] = map.value
    attributes[map.onchange] = actions.onRadioChange
    attributes[map.checked] = attributes[map.value] == slot['@value']
    const invalid = ((slot.touched || false) && (slot.invalid || false))
    addAttr(attributes, map.invalid, invalid)
    addClass(attributes, map.class, invalid ? map.invalidClass : "")
    return h(C, attributes, ...children)
  }
}

export const Radio = playRadio("input")

export const playCheckbox = (C, map = null) => {
  map = map || defaultAttributeMap.checkbox
  return (props, children) => (state, actions) => {
    const {'mg-path':path, ...attributes} = props
    const slot = API.getSlot(path, state.env)
    attributes['data-mg-path'] = path
    attributes['data-mg-checked-attribute'] = map.checked
    attributes[map.onchange] = actions.onCheckboxChange
    attributes[map.checked] = slot['@value']
    const invalid = ((slot.touched || false) && (slot.invalid || false))
    addAttr(attributes, map.invalid, invalid)
    addClass(attributes, map.class, invalid ? map.invalidClass : "")
    return h(C, attributes, ...children)
  }
}

export const Checkbox = playCheckbox("input")

// TODO: file, number, date, color, range, ...

export const playSmartControl = (C, map = null) => {
  map = map || defaultAttributeMap.smartControl
  return (props, children) => (state, actions) => {
    const {...attributes} = props
    const path = props['mg-path']
    const slot = API.getSlot(path, state.env)
    attributes[map.onchange] = actions.onSmartControlChange
    addAttr(attributes, map.value, slot.input)
    return h(C, attributes, ...children)
  }
}

export const playUpdateButton = (C, map = null) => {
  map = map || defaultAttributeMap.button
  return (props, children) => (state, actions) => {
    const {'mg-update':update, 'mg-context':context, ...attributes} = props
    attributes['data-mg-update'] = update
    attributes['data-mg-context'] = JSON.stringify(typeof context == "undefined" ? null : context)
    attributes[map.onclick] = actions.onUpdate
    return h(C, attributes, ...children)
  }
}

export const UpdateButton = playUpdateButton("button")

export const playSettleButton = (C, map = null) => {
  map = map || defaultAttributeMap.button
  return (props, children) => (state, actions) => {
    const {'mg-name':name, 'mg-result':result, ...attributes} = props
    attributes['data-mg-name'] = name
    attributes['data-mg-result'] = JSON.stringify(typeof result == "undefined" ? null : result)
    attributes[map.onclick] = actions.onPromiseSettle
    return h(C, attributes, ...children)
  }
}

export const SettleButton = playSettleButton("button")

export const playDialog = (C, map = null) => {
  map = map || defaultAttributeMap.dialog
  return (props, children) => (state, actions) => {
    const {...attributes} = props
    const name = attributes['mg-name']
    const message = API.getDialog(name, state.env)
    if (message === null && map['@nullIfHidden']) return null
    attributes[map.message] = message
    addAttr(attributes, map.shown, (message !== null))
    addClass(attributes, map.class, message !== null ? map.shownClass : "")
    return h(C, attributes, ...children)
  }
}

export const playProgress = (C, map = null) => {
  map = map || defaultAttributeMap.progress
  return (props, children) => (state, actions) => {
    const {...attributes} = props
    const name = attributes['mg-name']
    const current = API.getProgress(name, state.env)
    if (current === null && map['@nullIfHidden']) return null
    if (current !== null && current != -1) addAttr(attributes, map.current, current)
    addAttr(attributes, map.shown, current !== null)
    addClass(attributes, map.class, current !== null ? map.shownClass : "")
    return h(C, attributes, ...children)
  }
}

export const playPage = (C, map = null) => {
  map = map || defaultAttributeMap.page
  return (props, children) => (state, actions) => {
    const {...attributes} = props
    const index = attributes['mg-index']
    const name = attributes['mg-name']
    const current = API.getPage(name, state.env)
    const shown = (index == current)
    if (! shown && map['@nullIfHidden']) return null
    addAttr(attributes, map.shown, shown)
    addClass(attributes, map.class, shown ? map.shownClass : "")
    return h(C, attributes, ...children)
  }
}

export const playSwitch = (C, map = null) => {
  map = map || defaultAttributeMap.switch
  return (props, children) => (state, actions) => {
    const {...attributes} = props
    const name = attributes['mg-name']
    const shown = API.getSwitch(name, state.env)
    if (! shown && map['@nullIfHidden']) return null
    addAttr(attributes, map.shown, shown)
    addClass(attributes, map.class, shown ? map.shownClass : "")
    return h(C, attributes, ...children)
  }
}
