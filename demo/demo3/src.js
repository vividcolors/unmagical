
import {h, API, start, Input, Listbox, Radio, Checkbox, UpdateButton, SettleButton, Field, Dialog, Notification, Progress, DatePicker, ColorPicker, ReorderableMenuList} from '../../src/bindings/bulma'
import {playSmartControl, playReorderable} from '../../src/core/components'


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
  complementAddress: (env) => {
    const {enter, leave} = API.makePortal(env)
    const zipSlot = API.getSlot('/address/zip', env)
    return leave(
      new Promise((fulfill, reject) => {
        new YubinBango.Core(zipSlot.input.replace('-', ''), fulfill)
      }), 
      env
    )
    .then(enter((result, env) => {
      const bld = API.extract('/address/bld', env)
      const address = {zip:zipSlot.input, pref:result.region, city:result.locality, street:result.street, bld}
      return API.add('/address', address, env)
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

const undroppableStyle = {opacity:0.26}

const view = (env) => {
  console.log('view', env)
  const data = API.extract("", env)
  return (
    <div class="block">
      <h2>UI（拡張とブラウザネイティブ）</h2>
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
      <hr />
      <h2>数値入力とバリデーション</h2>
      <Field mg-path="/int" label="整数">
        <Input mg-path="/int" type="number" />
      </Field>
      <hr />
      <h2>同じアドレスを二度入力する</h2>
      <Field mg-path="/email" mg-fold-validity label="メールアドレス">
        <Input mg-path="/email/firstTime" />
        <Input mg-path="/email/secondTime" placeholder="もう一度" />
      </Field>
      <hr />
      <h2>住所の自動補完</h2>
      <Field mg-path="/address" mg-fold-validity label="住所">
        <Input mg-path="/address/zip" oncreate={onZipCreated} />
        <Input mg-path="/address/pref" />
        <Input mg-path="/address/city" />
        <Input mg-path="/address/street" />
        <Input mg-path="/address/bld" />
      </Field>
      <hr />
      <h2>順序の入れ替え（基本）</h2>
      <div class="menu">
        <ReorderableMenuList class="menu-list" mg-name="reorder" mg-path="/persons" options={{group:'persons'}}>
          {data.persons.map(p => (<li key={p}><a>{p}</a></li>))}
        </ReorderableMenuList>
      </div>
      <hr />
      <h2>順序の入れ替え（アドバンスト）</h2>
      <div class="menu">
        <ReorderableMenuList class="menu-list" mg-name="reorder" mg-path="/members" options={{group:'members'}} items={data.members} showItem={(item, index, activePath, group) => {
          return (
            <li key={item.name}>
              <a style={group && group != 'members' ? undroppableStyle : {}}>{item.name}</a>
              <ReorderableMenuList mg-name="reorder" mg-path={`/members/${index}/things`} options={{group:'things'}} items={item.things} showItem={(subitem, index, activePath, group) => {
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

const containerEl = document.getElementById('app')

const {onUpdate} = start({data, schema, view, containerEl, updates})