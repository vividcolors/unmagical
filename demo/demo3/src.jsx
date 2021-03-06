

const {h, API, start, Input, Textarea, Select, Radio, Checkbox, Field, UpdateButton, DeleteButton, Clickable, SettleButton, Dialog, Notification, Progress, Modal, Pagination, DatePicker, ColorPicker, ReorderableList, ListItem, makeRestRepository, makeEntityListUpdates, makeEntityUpdates, validate, defaultRules, defaultCatalog, normalizeError} = unmagical


const zipPattern = '^[0-9]{3}-?[0-9]{4}$'
const schema = {
  type: 'object', 
  properties: {
    date: {type:'string', notEmpty:true}, 
    date2: {type:'string', notEmpty:true}, 
    color: {type:'string', notEmpty:true}, 
    color2: {type:'string', notEmpty:true}, 
    int: {type:'integer'}, 
    email: {
      type: 'object', 
      properties: {
        firstTime: {type:'string', notEmpty:true, pattern:'^([a-zA-Z0-9])+([a-zA-Z0-9\._-])*@([a-zA-Z0-9_-])+([a-zA-Z0-9\._-]+)+$'}, 
        secondTime: {type:'string', notEmpty:true, same:'1/firstTime'}
      }
    }, 
    address: {
      type: 'object', 
      properties: {
        zip: {type:'string', notEmpty:true, pattern:zipPattern}, 
        pref: {type:'string', notEmpty:true}, 
        city: {type:'string', notEmpty:true}, 
        street: {type:'string', notEmpty:true}, 
        bld: {type:'string'}
      }
    }, 
    persons: {
      type: 'array', 
      items: {type:'string'}
    }, 
    members: {
      type: 'array', 
      items: {
        type: 'object', 
        properties: {
          name: {type:'string'}, 
          things: {
            type: 'array', 
            items: {type:'string'}
          }
        }
      }
    }
  }
}

const data = {
  date: '', 
  date2: '', 
  color: '', 
  color2: '', 
  int: null, 
  email: {firstTime:'', secondTime:''}, 
  address: {zip:'', pref:'', city:'', street:'', bld:''}, 
  persons: ['Dad', 'Mam', 'Me', 'Doggy'], 
  members: [
    {name:'Dad', things:['Car', 'Glasses', 'Play Station']}, 
    {name:'Mam', things:['Ring', 'Albums', 'Wear']}, 
    {name:'Me', things:[]}, 
    {name:'Doggy', things:['Kennel', 'Bone']}
  ]
}

const updates = {
  complementAddress: (store) => {
    const {enter, leave} = API.makePortal(store)
    const zipMdr = API.getMdr('/address/zip', store)
    return leave(
      new Promise((fulfill, reject) => {
        new YubinBango.Core(zipMdr.input.replace('-', ''), fulfill)
      }), 
      store
    )
    .then(enter((result, store) => {
      const bld = API.get('/address/bld', store)
      const address = {zip:zipMdr.input, pref:result.region, city:result.locality, street:result.street, bld}
      return API.add('/address', address, store)
    }))
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
      params: []
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

const undroppableStyle = {opacity:0.26}

const render = (store) => {
  console.log('view', store)
  const data = API.get("", store)
  return (
    <div class="block">
      <h2>Comparison of JS-made UI and browser native ones</h2>
      <Field path="/date" label="Flatpickr">
        <div class="field has-addons">
          <div class="control">
            <DatePicker path="/date" class="input" clearerId="datepicker-clearer" />
          </div>
          <div class="control">
            <a class="button is-info" id="datepicker-clearer">Clear</a>
          </div>
        </div>
      </Field>
      <p>value: {data.date}</p>
      <Field path="/date2" label="input type=date">
        <Input type="date" path="/date2" />
      </Field>
      <p>value: {data.date2}</p>
      <Field path="/color" label="Pickr">
        <div class="field has-addons">
          <div class="control">
            <ColorPicker path="/color" class="button" clearerId="colorpicker-clearer" options={pickrOptions} />
          </div>
          <div class="control">
            <a class="button is-info" id="colorpicker-clearer">Clear</a>
          </div>
        </div>
      </Field>
      <p>value: {data.color}</p>
      <Field path="/color2" label="input type=color">
        <Input class="input" type="color" path="/color2" />
      </Field>
      <p>value: {data.color2}</p>
      <hr />
      <h2>Numeric input and validation</h2>
      <Field path="/int" label="Integer">
        <Input path="/int" />
      </Field>
      <hr />
      <h2>Input twice (folding validity of multiple controls)</h2>
      <Field path="/email" foldValidity label="Email address">
        <Input path="/email/firstTime" />
        <Input path="/email/secondTime" placeholder="again" />
      </Field>
      <hr />
      <h2>Address completion (view-defined event handler)</h2>
      <Field path="/address" foldValidity label="Japanese Address">
        <Input path="/address/zip" oncreate={onZipCreated} placeholder="2610023" />
        <Input path="/address/pref" />
        <Input path="/address/city" />
        <Input path="/address/street" />
        <Input path="/address/bld" />
      </Field>
      <hr />
      <h2>Sortable.js -- Basic</h2>
      <div class="menu">
        <ReorderableList tag="ul" class="menu-list" name="reorder" path="/persons" options={{group:'persons'}}>
          {data.persons.map(p => (<li key={p}><a>{p}</a></li>))}
        </ReorderableList>
      </div>
      <hr />
      <h2>Sortable.js -- Nested</h2>
      <div class="menu">
        <ReorderableList tag="ul" class="menu-list" name="reorder" path="/members" options={{group:'members'}} items={data.members} showItem={(item, index, activePath, group) => {
          return (
            <li key={item.name}>
              <a style={group && group != 'members' ? undroppableStyle : {}}>{item.name}</a>
              <ReorderableList tag="ul" name="reorder" path={`/members/${index}/things`} options={{group:'things'}} items={item.things} showItem={(subitem, index, activePath, group) => {
                return (
                  <li key={subitem}><a style={group && group != 'things' ? undroppableStyle : {}}>{subitem}</a></li>
                )
              }} />
            </li>
          )
        }} />
      </div>
    </div>
  )
}


// Translating some texts into japanese.
const catalog = {
  ...defaultCatalog, 
  'value': '?????????????????????', 
  'type.boolean': '"true"???"false"???????????????????????????', 
  'type.boolean?': '"true"???"false"???????????????????????????', 
  'type.integer': '?????????????????????????????????', 
  'type.integer?': '?????????????????????????????????', 
  'type.number': '?????????????????????????????????', 
  'type.number?': '?????????????????????????????????', 
  'rule.enum': '????????????????????????', 
  'rule.const': '????????????????????????',  // param
  'rule.const.nohint': '????????????????????????', 
  'rule.notEmpty': '????????????????????????', 
  'rule.same': '?????????????????????????????????',  // target
  'rule.same.nohint': '?????????????????????????????????', 
  'rule.pattern': '?????????????????????',  // param
}

const containerEl = document.getElementById('app')

const {onUpdate} = start({data, schema, render, catalog, containerEl, updates})