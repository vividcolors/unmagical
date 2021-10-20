
const schema = {
  type: 'record', 
  fields: {
    todos: {
      type: 'list', 
      items: {
        type: 'record', 
        fields: {
          done: {type:'boolean'}, 
          subject: {type:'string', minLength:1}
        }, 
      }
    }, 
    form: {
      type: 'record?', 
      fields: {
        done: {type:'boolean'}, 
        subject: {type:'string', minLength:1}
      }
    }, 
    target: {type:'string'}
  }
}

const data = {
  todos: [], 
  form: null, 
  target: ''
}

const hooks = {
  evolve: (env, API) => env, 
  open: (env, path, API) => {
    env = API.add('/target', path, API.validate, env)
    env = API.add('/form', API.lookup(path, env), API.validate, env)
    return env
  }, 
  openToAdd: (env, path, API) => {
    env = API.add('/target', '/todos/-', API.validate, env)
    env = API.add('/form', {done:false, subject:''}, API.validate, env)
    return env
  }, 
  commit: (env, path, API) => {
    env = API.touchAll('/form', env)
    if (API.countValidationErrors('/form', env)) {
      window.setTimeout(() => {
        const modalEl = document.querySelector('.mg-Modal')
        const targetEl = modalEl.querySelector('.mg-invalid')
        targetEl.scrollIntoView()
      }, 100)
      return env
    }
    const target = API.lookup('/target', env)
    const form = API.lookup('/form', env)
    env = API.add(target, form, API.validate, env)
    env = API.add('/target', '', API.validate, env)
    env = API.add('/form', null, API.validate, env)
    return env
  }, 
  cancel: (env, path, API) => {
    env = API.add('/target', '', API.validate, env)
    env = API.add('/form', null, API.validate, env)
    return env
  }, 
  remove: (env, path, API) => {
    if (window.confirm('削除します。よろしいですか？')) {
      env = API.remove(path, API.validate, env)
    }
    return env
  }
}

const view = 
['div', {}, 
  ['div', {showIf:'/todos|empty'}, 
    ['p', {}, 'TODOはまだありません。']
  ], 
  ['div', {showIf:'/todos|empty|not'}, 
    ['List', {path:'/todos'}, 
      ['ListItem', {}, 
        ['Checkbox', {path:'0/done', label:''}], 
        ['Text', {path:'0/subject'}], 
        ['Button', {path:'0', label:'開く', hook:'open'}], 
        ['Button', {path:'0', label:'削除', hook:'remove'}], 
      ]
    ]
  ], 
  ['Button', {label:'新規追加', hook:'openToAdd'}], 
  ['Modal', {path:'/form'}, 
    ['Field', {path:'0/subject', label:'件名'}, 
      ['TextInput', {}]
    ], 
    ['InputGroup', {class:'mg-alignRight'}, 
      ['Button', {label:'キャンセル', hook:'cancel'}], 
      ['Button', {label:'確定', hook:'commit'}]
    ]
  ]
]

const container = document.getElementById('app')

window.unmagical(data, schema, hooks, view, container)