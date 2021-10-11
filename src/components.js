
import { API, h } from './framework'

export const defaultAttributeMap = {
  textbox: {
    oninput: 'oninput', 
    onblur: 'onblur', 
    value: 'value', 
    class: 'class', 
    invalidClass: 'mg-invalid', 
    invalid: 'data-mg-invalid'
  }, 
  listbox: {
    onchange: 'onchange', 
    class: 'class', 
    invalidClass: 'mg-invalid', 
    invalid: 'data-mg-invalid', 
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
    invalid: 'data-mg-invalid'
  }, 
  checkbox: {
    onchange: 'onchange', 
    checked: 'checked', 
    class: 'class', 
    invalidClass: 'mg-invalid', 
    invalid: 'data-mg-invalid'
  }, 
  button: {
    onclick: 'onclick', 
    update: 'data-mg-update', 
    context: 'data-mg-context', 
    name: 'data-mg-name', 
    result: 'data-mg-result'
  }, 
  dialog: {
    message: 'message'
  }, 
  progress: {
    current: 'current'
  }, 
  page: {
    current: 'data-mg-current', 
    currentClass: 'mg-current'
  }, 
  'switch': {
    shown: 'data-mg-shown', 
    shownClass: 'mg-shown'
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

const addClass = (attributes, attr, clazz) => {
  if (! attributes.hasOwnProperty(attr)) attributes[attr] = ''
  attributes[attr] += ' ' + clazz
}

export const playTextbox = (C, map = null) => {
  map = map || defaultAttributeMap.textbox
  return (props, children) => (state, actions) => {
    const {'mg-path':path, ...attributes} = props
    const slot = API.getSlot(path, state.env)
    attributes['data-mg-path'] = path
    attributes[map.oninput] = actions.onTextInput
    attributes[map.onblur] = actions.onTextBlur
    attributes[map.value] = slot.input
    if ((slot.touched || false) && (slot.invalid || false)) {
      addClass(attributes, map.class, map.invalidClass)
      attributes[map.invalid] = true
    }
    return h(C, attributes, ...children)
  }
}

export const Textbox = playTextbox("input")

export const playListbox = (C, map = null) => {
  map = map || defaultAttributeMap.listbox
  return (props, children) => (state, actions) => {
    const {'mg-path':path, ...attributes} = props
    const slot = API.getSlot(path, state.env)
    attributes['data-mg-path'] = path
    attributes[map.onchange] = actions.onSelectChange
    if ((slot.touched || false) && (slot.invalid || false)) {
      addClass(attributes, map.class, map.invalidClass)
      attributes[map.invalid] = true
    }
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
    attributes[map.onchange] = actions.onSelectChange
    attributes[map.checked] = attributes[map.value] == slot['@value']
    if ((slot.touched || false) && (slot.invalid || false)) {
      addClass(attributes, map.class, map.invalidClass)
      attributes[map.invalid] = true
    }
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
    attributes[map.onchange] = actions.onToggleChange
    attributes[map.checked] = slot['@value']
    if ((slot.touched || false) && (slot.invalid || false)) {
      addClass(attributes, map.class, map.invalidClass)
      attributes[map.invalid] = true
    }
    return h(C, attributes, ...children)
  }
}

export const Checkbox = playCheckbox("input")

// TODO: file, number, date, color, range, ...

export const playButton = (C, map = null) => {
  map = map || defaultAttributeMap.button
  return (props, children) => (state, actions) => {
    if ('mg-update' in props) {
      const {'mg-update':update, 'mg-context':context, ...attributes} = props
      attributes[map.update] = update
      attributes[map.context] = JSON.stringify(typeof context == "undefined" ? null : context)
      attributes[map.onclick] = actions.onUpdate
      return h(C, attributes, ...children)
    } else {
      const {'mg-name':name, 'mg-result':result, ...attributes} = props
      attributes[map.name] = name
      attributes[map.result] = JSON.stringify(typeof result == "undefined" ? null : result)
      attributes[map.onclick] = actions.onFulfill
      return h(C, attributes, ...children)
    }
  }
}

export const Button = playButton("button")

export const playDialog = (C, map = null) => {
  map = map || defaultAttributeMap.dialog
  return (props, children) => (state, actions) => {
    const {...attributes} = props
    const name = attributes['mg-name']
    const message = API.getDialog(name, state.env)
    if (message === null) return null
    attributes[map.message] = message
    return h(C, attributes, ...children)
  }
}

export const playProgress = (C, map = null) => {
  map = map || defaultAttributeMap.progress
  return (props, children) => (state, actions) => {
    const {...attributes} = props
    const name = attributes['mg-name']
    const current = API.getProgress(name, state.env)
    if (current === null) return null
    if (current != -1) attributes[map.current] = current
    return h(C, attributes, ...children)
  }
}

export const playPage = (C, map = null) => {
  map = map || defaultAttributeMap.page
  return (props, children) => (state, actions) => {
    const {'mg-index':index, ...attributes} = props
    const name = attributes['mg-name']
    let current = API.getPage(name, state.env)
    if (index != current) return null
    addClass(attributes, map.class, map.currentClass)
    attributes[map.current] = true
    return h(C, attributes, ...children)
  }
}

export const playSwitch = (C, map = null) => {
  map = map || defaultAttributeMap.switch
  return (props, children) => (state, actions) => {
    const {...attributes} = props
    const name = attributes['mg-name']
    let current = API.getSwitch(name, state.env)
    if (! current) return null
    addClass(attributes, map.class, map.shownClass)
    attributes[map.shown] = true
    return h(C, attributes, ...children)
  }
}
