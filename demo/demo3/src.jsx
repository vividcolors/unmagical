

const {h, API, start, Input, Textarea, Select, Radio, Checkbox, Field, UpdateButton, DeleteButton, Clickable, SettleButton, Dialog, Notification, Progress, Modal, Pagination, DatePicker, ColorPicker, ReorderableList, ListItem, createRestRepository, makeEntityListUpdates, makeEntityUpdates, validate, defaultRules, defaultCatalog, normalizeError} = unmagical


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
      const bld = API.extract('/address/bld', store)
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

const view = (store) => {
  console.log('view', store)
  const data = API.extract("", store)
  return (
    <div class="block">
      <h2>UI（拡張とブラウザネイティブ）</h2>
      <Field path="/date" label="カレンダー">
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
      <Field path="/color" label="カラー">
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
      <h2>数値入力とバリデーション</h2>
      <Field path="/int" label="整数">
        <Input path="/int" />
      </Field>
      <hr />
      <h2>同じアドレスを二度入力する</h2>
      <Field path="/email" foldValidity label="メールアドレス">
        <Input path="/email/firstTime" />
        <Input path="/email/secondTime" placeholder="もう一度" />
      </Field>
      <hr />
      <h2>住所の自動補完</h2>
      <Field path="/address" foldValidity label="住所">
        <Input path="/address/zip" oncreate={onZipCreated} />
        <Input path="/address/pref" />
        <Input path="/address/city" />
        <Input path="/address/street" />
        <Input path="/address/bld" />
      </Field>
      <hr />
      <h2>順序の入れ替え（基本）</h2>
      <div class="menu">
        <ReorderableList tag="ul" class="menu-list" name="reorder" path="/persons" options={{group:'persons'}}>
          {data.persons.map(p => (<li key={p}><a>{p}</a></li>))}
        </ReorderableList>
      </div>
      <hr />
      <h2>順序の入れ替え（アドバンスト）</h2>
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


const catalog = {
  ...defaultCatalog, 
  'value': '不正な入力です', 
  'type.boolean': '"true"か"false"と入力してください', 
  'type.boolean?': '"true"か"false"と入力してください', 
  'type.integer': '整数を入力してください', 
  'type.integer?': '整数を入力してください', 
  'type.number': '数値を入力してください', 
  'type.number?': '数値を入力してください', 
  'rule.enum': '選択してください', 
  'rule.const': '選択してください',  // param
  'rule.const.nohint': '選択してください', 
  'rule.notEmpty': '入力してください', 
  'rule.same': '入力内容が違っています',  // target
  'rule.same.nohint': '入力内容が違っています', 
  'rule.pattern': '形式が不正です',  // param
}

const containerEl = document.getElementById('app')

const {onUpdate} = start({data, schema, view, catalog, containerEl, updates})