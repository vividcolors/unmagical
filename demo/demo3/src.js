
import {h, API, start, Textbox, Listbox, Radio, Checkbox, UpdateButton, SettleButton, Field, Dialog, Notification, Progress} from '../../bindings/bulma'
import {playSmartControl} from '../../src/components'

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
  path, 
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
  path, 
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


const schema = {
  type: 'object', 
  properties: {
    date: {type:'string', minLength:1}, 
    color: {type:'string', minLength:1}
  }
}

const data = {
  date: '2021-11-03', 
  color: ''
}

const view = (env) => {
  const data = API.extract("", env)
  console.log('view', data)
  return (
    <div class="block">
      <Field path="/date" env={env} class="field">
        <label class="label">カレンダー</label>
        <DatePicker path="/date" mg-path="/date" class="input" clearable />
      </Field>
      <Field path="/color" env={env} class="field">
        <label class="label">カラー</label>
        <ColorPicker path="/color" mg-path="/color" class="button" />
      </Field>
      <dl>
        <dt>カレンダー</dt>
        <dd>{data.date}</dd>
        <dt>カラー</dt>
        <dd>{data.color}</dd>
      </dl>
    </div>
  )
}

const containerEl = document.getElementById('app')

start({data, schema, view, containerEl})