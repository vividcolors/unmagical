
import { API, h } from './framework'

export const defaultBindingMap = {
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
    invalid: 'data-mg-invalid'
  }, 
  option: {
    selected: 'selected', 
    value: 'value'
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
  feedback: {
    message: 'message'
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
  console.log('addClass', attributes, attr, clazz)
  if (! attributes.hasOwnProperty(attr)) attributes[attr] = ''
  attributes[attr] += ' ' + clazz
}

const resolveBindingMap = (map) => {
  return map || defaultBindingMap
}

export const playTextbox = (C, map = null) => {
  map = resolveBindingMap(map)
  return (props, children) => (state, actions) => {
    const {'mg-path':path, ...attributes} = props
    const slot = API.getSlot(path, state.env)
    attributes['data-mg-path'] = path
    attributes[map.textbox.oninput] = actions.onTextInput
    attributes[map.textbox.onblur] = actions.onTextBlur
    attributes[map.textbox.value] = slot.input
    if ((slot.touched || false) && (slot.invalid || false)) {
      addClass(attributes, map.textbox.class, map.textbox.invalidClass)
      attributes[map.textbox.invalid] = true
    }
    return h(C, attributes, ...children)
  }
}

export const Textbox = playTextbox("input")

export const playListbox = (C, map = null) => {
  map = resolveBindingMap(map)
  return (props, children) => (state, actions) => {
    const {'mg-path':path, ...attributes} = props
    const slot = API.getSlot(path, state.env)
    attributes['data-mg-path'] = path
    attributes[map.listbox.onchange] = actions.onSelectChange
    if ((slot.touched || false) && (slot.invalid || false)) {
      addClass(attributes, map.listbox.class, map.listbox.invalidClass)
      attributes[map.listbox.invalid] = true
    }
    children.forEach((o) => {
      o.attributes[map.option.selected] = o.attributes[map.option.value] == slot['@value']
    })
    return h(C, attributes, ...children)
  }
}

export const Listbox = playListbox("select")

export const playRadio = (C, map = null) => {
  map = resolveBindingMap(map)
  return (props, children) => (state, actions) => {
    const {'mg-path':path, ...attributes} = props
    console.log('playRadio', path)
    const slot = API.getSlot(path, state.env)
    attributes['data-mg-path'] = path
    attributes[map.radio.onchange] = actions.onSelectChange
    attributes[map.radio.checked] = attributes[map.radio.value] == slot['@value']
    if ((slot.touched || false) && (slot.invalid || false)) {
      addClass(attributes, map.radio.class, map.radio.invalidClass)
      attributes[map.radio.invalid] = true
    }
    return h(C, attributes, ...children)
  }
}

export const Radio = playRadio("input")

export const playCheckbox = (C, map = null) => {
  map = resolveBindingMap(map)
  return (props, children) => (state, actions) => {
    const {'mg-path':path, ...attributes} = props
    const slot = API.getSlot(path, state.env)
    attributes['data-mg-path'] = path
    attributes[map.checkbox.onchange] = actions.onToggleChange
    attributes[map.checkbox.checked] = slot['@value']
    if ((slot.touched || false) && (slot.invalid || false)) {
      addClass(attributes, map.checkbox.class, map.checkbox.invalidClass)
      attributes[map.checkbox.invalid] = true
    }
    return h(C, attributes, ...children)
  }
}

export const Checkbox = playCheckbox("input")

// TODO: file, number, date, color, range, ...

export const playButton = (C, map = null) => {
  map = resolveBindingMap(map)
  return (props, children) => (state, actions) => {
    if ('mg-update' in props) {
      const {'mg-update':update, 'mg-context':context, ...attributes} = props
      attributes[map.button.update] = update
      attributes[map.button.context] = JSON.stringify(typeof context == "undefined" ? null : context)
      attributes[map.button.onclick] = actions.onUpdate
      return h(C, attributes, ...children)
    } else {
      const {'mg-name':name, 'mg-result':result, ...attributes} = props
      attributes[map.button.name] = name
      attributes[map.button.result] = JSON.stringify(typeof result == "undefined" ? null : result)
      attributes[map.button.onclick] = actions.onFulfill
      return h(C, attributes, ...children)
    }
  }
}

export const Button = playButton("button")

export const playFeedback = (C, map = null) => {
  map = resolveBindingMap(map)
  return (props, children) => (state, actions) => {
    const {...attributes} = props
    const name = attributes['mg-name']
    const data = API.getExtra(name, state.env)
    if (! data) return null
    attributes[map.feedback.message] = data.message
    return h(C, attributes, ...children)
  }
}

export const playDialog = (C, map = null) => {
  map = resolveBindingMap(map)
  return (props, children) => (state, actions) => {
    const {...attributes} = props
    const name = attributes['mg-name']
    const data = API.getExtra(name, state.env)
    if (! data) return null
    attributes[map.dialog.message] = data.message
    return h(C, attributes, ...children)
  }
}

export const playLoader = (C, map = null) => {
  map = resolveBindingMap(map)
  return (props, children) => (state, actions) => {
    const {...attributes} = props
    const name = attributes['mg-name']
    const data = API.getExtra(name, state.env)
    if (! data) return null
    return h(C, attributes, ...children)
  }
}

// TODO: tab, tabpanel
