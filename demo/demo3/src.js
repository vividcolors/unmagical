
import {h, API, start, Input, Listbox, Radio, Checkbox, UpdateButton, SettleButton, Field, Dialog, Notification, Progress, DatePicker, ColorPicker} from '../../src/bindings/bulma'
import {playSmartControl, playReorderable} from '../../src/core/components'


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

const pickrOptions = {
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
      clear: false,
      save: true
    }
  }
}

const view = (env) => {
  console.log('view', env)
  const data = API.extract("", env)
  return (
    <div class="block">
      <Field mg-path="/date" label="カレンダー">
        <div class="field has-addons">
          <div class="control">
            <DatePicker mg-path="/date" class="input" clearerId="datepicker-clearer" />
          </div>
          <div class="control">
            <a class="button is-info" id="datepicker-clearer">Clear</a>
          </div>
        </div>
      </Field>
      <p>value: {data.date}</p>
      <Field mg-path="/date2" label="input type=date">
        <Input type="date" mg-path="/date2" />
      </Field>
      <p>value: {data.date2}</p>
      <Field mg-path="/color" label="カラー">
        <div class="field has-addons">
          <div class="control">
            <ColorPicker mg-path="/color" class="button" clearerId="colorpicker-clearer" options={pickrOptions} />
          </div>
          <div class="control">
            <a class="button is-info" id="colorpicker-clearer">Clear</a>
          </div>
        </div>
      </Field>
      <p>value: {data.color}</p>
      <Field mg-path="/color2" label="input type=color">
        <Input class="input" type="color" mg-path="/color2" />
      </Field>
      <p>value: {data.color2}</p>
      {/*<Field mg-path="/email" class="field" foldValidity>
        <label class="label">メールアドレス</label>
        <Textbox class="input" mg-path="/email/firstTime" />
        <Textbox class="input" mg-path="/email/secondTime" />
      </Field>
      <Field mg0path="/address" class="field" foldValidity>
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
  </ReorderableMenu> */}
    </div>
  )
}

const containerEl = document.getElementById('app')

const {onUpdate} = start({data, schema, view, containerEl, updates})