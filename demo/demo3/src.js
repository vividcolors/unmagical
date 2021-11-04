
import {h, API, start, Textbox, Listbox, Radio, Checkbox, UpdateButton, SettleButton, Field, Dialog, Notification, Progress} from '../../src/bindings/bulma'
import {playSmartControl, playReorderable} from '../../src/core/components'

const createFlatpickr = (path, onchange, defaultValue, config0) => {
  let instance = null
  return {
    oncreate: (el) => {
      const config = {
        ...config0, 
        defaultDate: defaultValue || null
      }
      const target = el.querySelector('input[type="text"]')
      instance = flatpickr(target, config)
      instance.config.onChange.push((selectedDates, dateStr) => {
        onchange({path, input:dateStr})
      })
      const clearer = el.querySelector('button')
      if (clearer) {
        clearer.onclick = instance.clear
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
const DatePicker = playSmartControl(({
  'mg-path':path, 
  onchange, 
  value, 
  clearable = false, 
  config = {}, 
  ...props
}) => {
  const {oncreate, ondestroy} = createFlatpickr(path, onchange, value, config)
  if (clearable) {
    return (
      <div class="field has-addons" oncreate={oncreate} ondestroy={ondestroy}>
        <div class="control">
          <input type="text" readonly {...props} />
        </div>
        <div class="control">
          <button type="button" class="button">Clear</button>
        </div>
      </div>
    )
  } else {
    return (
      <div class="control">
        <input type="text" oncreate={oncreate} ondestroy={ondestroy} readonly {...props} />
      </div>
    )
  }
}, {
  onchange: 'onchange', 
  value: 'value'
})

const createPickr = (path, onchange, defaultValue, options0) => {
  let instance = null
  return {
    oncreate: (el) => {
      const options = {
        ...options0, 
        useAsButton: true, 
        default: defaultValue || null, 
        el
      }
      instance = Pickr.create(options)
      instance.on('clear', () => {
        onchange({path, input:''})
      }).on('save', (color) => {
        const input = color ? color.toHEXA().toString() : null
        instance.hide()
        onchange({path, input})
      })
    }, 
    ondestroy: (el) => {
      if (instance) {
        instance.destroy()
      }
    }
  }
}
const ColorPicker = playSmartControl(({
  'mg-path':path, 
  onchange, 
  value, 
  options = {
    components: {
        // Main components
        preview: true,
        opacity: true,
        hue: true,

        // Input / output Options
        interaction: {
            hex: true,
            rgba: true,
            hsla: true,
            hsva: true,
            cmyk: true,
            input: true,
            clear: true,
            save: true
        }
    }
  }, 
  ...props
}) => {
  const {oncreate, ondestroy} = createPickr(path, onchange, value, options)
  return (
    <div class="control">
      <button type="button" oncreate={oncreate} ondestroy={ondestroy} {...props}>
        <span class="icon"><i class="material-icons" style={{color:value}}>palette</i></span>
      </button>
    </div>
  )
}, {
  onchange: 'onchange', 
  value: 'value'
})

const instantiateSortable = (name, path, onStart, onEnd, options) => {
  var instance = null;
  var marker = null;
  const effectiveOptions = {
    ...options, 
    onStart: (ev) => {
      marker = ev.item.nextElementSibling
      onStart({
        update: 'reorder', 
        context: [name, path + '/' + ev.oldIndex]
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
      instance = Sortable.create(el.firstChild, effectiveOptions)
    }, 
    ondestroy: () => {
      if (instance) {
        instance.destroy()
        instance = null
      }
    }
  }
}
const ReorderableMenu = playReorderable((
  {
    'mg-name':name, 
    path, 
    active, 
    onstart, 
    onend, 
    options = {}, 
    ...props
  }, children) => {
  const {oncreate, ondestroy} = instantiateSortable(name, path, onstart, onend, options)
  return (
    <div class="menu" oncreate={oncreate} ondestroy={ondestroy} {...props}>
      <ul class="menu-list" data-mg-path={path}>
        {children}
      </ul>
    </div>
  )
}, {
  active: "active", 
  activeClass: "", 
  onstart: "onstart", 
  onend: "onend"
})

const zipPattern = '^[0-9]{3}-?[0-9]{4}$'
const schema = {
  type: 'object', 
  properties: {
    date: {type:'string', minLength:1}, 
    date2: {type:'string', minLength:1}, 
    color: {type:'string', minLength:1}, 
    color2: {type:'string', minLength:1}, 
    email: {
      type: 'object', 
      properties: {
        firstTime: {type:'string', pattern:'^([a-zA-Z0-9])+([a-zA-Z0-9\._-])*@([a-zA-Z0-9_-])+([a-zA-Z0-9\._-]+)+$'}, 
        secondTime: {type:'string', same:'1/firstTime'}
      }
    }, 
    address: {
      type: 'object', 
      properties: {
        zip: {type:'string', pattern:zipPattern}, 
        pref: {type:'string', minLength:1}, 
        city: {type:'string', minLength:1}, 
        street: {type:'string', minLength:1}, 
        bld: {type:'string'}
      }
    }, 
    persons: {
      type: 'array', 
      items: {type:'string'}
    }
  }
}

const data = {
  date: '', 
  date2: '', 
  color: '', 
  color2: '', 
  email: {firstTime:'', secondTime:''}, 
  address: {zip:'', pref:'', city:'', street:'', bld:''}, 
  persons: ['Dad', 'Mam', 'Me', 'Doggy']
}

const updates = {
  complementAddress: (env) => {
    const zipSlot = API.getSlot('/address/zip', env)
    return API.withEnv(null, 
      new Promise((fulfill, reject) => {
        new YubinBango.Core(zipSlot.input.replace('-', ''), fulfill)
      }).then(API.wrap(([result, env]) => {
        const bld = API.extract('/address/bld', env)
        const address = {zip:zipSlot.input, pref:result.region, city:result.locality, street:result.street, bld}
        return API.add('/address', address, env)
      }))
    )
  }
}

const onZipCreated = (el) => {
  el.addEventListener('input', maybeComplementAddress)
}
const maybeComplementAddress = (ev) => {
  const zip = ev.currentTarget.value
  if (zip.match(new RegExp(zipPattern))) {
    onUpdate({
      update:'complementAddress', 
      context: []
    })
  }
}

const view = (env) => {
  const data = API.extract("", env)
  return (
    <div class="block">
      <Field path="/date" env={env} class="field">
        <label class="label">カレンダー</label>
        <DatePicker mg-path="/date" class="input" clearable />
        <p>value: {data.date}</p>
      </Field>
      <Field path="/date2" env={env} class="field">
        <label class="label">input type="date"</label>
        <Textbox class="input" type="date" mg-path="/date2" />
        <p>value: {data.date2}</p>
      </Field>
      <Field path="/color" env={env} class="field">
        <label class="label">カラー</label>
        <ColorPicker mg-path="/color" class="button" />
        <p>value: {data.color}</p>
      </Field>
      <Field path="/color2" env={env} class="field">
        <label class="label">input type="color"</label>
        <Textbox class="input" type="color" mg-path="/color2" />
        <p>value: {data.color2}</p>
      </Field>
      <Field path="/email" env={env} class="field" foldValidity>
        <label class="label">メールアドレス</label>
        <Textbox class="input" mg-path="/email/firstTime" />
        <Textbox class="input" mg-path="/email/secondTime" />
      </Field>
      <Field path="/address" env={env} class="field" foldValidity>
        <label class="label">住所</label>
        <Textbox class="input" mg-path="/address/zip" oncreate={onZipCreated} />
        <Textbox class="input" mg-path="/address/pref" />
        <Textbox class="input" mg-path="/address/city" />
        <Textbox class="input" mg-path="/address/street" />
        <Textbox class="input" mg-path="/address/bld" />
      </Field>
      <hr />
      <ReorderableMenu mg-name="persons" path="/persons">
        {data.persons.map(p => (<li key={p}><a>{p}</a></li>))}
      </ReorderableMenu>
    </div>
  )
}

const containerEl = document.getElementById('app')

const {onUpdate} = start({data, schema, view, containerEl, updates})