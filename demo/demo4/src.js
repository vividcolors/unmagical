
import {h, API, start, Input, Select, Radio, Checkbox, UpdateButton, Clickable, SettleButton, Field, Dialog, Notification, Progress} from '../../src/bindings/bulma'
import {playReorderable, playListItem} from '../../src/core/components'

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
      instance = Sortable.create(el, effectiveOptions)
    }, 
    ondestroy: () => {
      if (instance) {
        instance.destroy()
        instance = null
      }
    }
  }
}
const ReorderableList = playReorderable((
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
    <div class="reorderableList" oncreate={oncreate} ondestroy={ondestroy} {...props} data-mg-path={path}>
      {children}
    </div>
  )
}, {
  active: "active", 
  activeClass: "", 
  onstart: "onstart", 
  onend: "onend"
})

const todoSchema = {
  type: 'object', 
  properties: {
    id: {type:'integer'}, 
    done: {type:'boolean'}, 
    subject: {type:'string', minLength:1}, 
    context: {type:'string', enum:['home', 'work']}
  }
}

const schema = {
  type: 'object', 
  properties: {
    todos: {
      type: 'array', 
      items: todoSchema
    }, 
    form: {
      type: 'object?', 
      properties: {
        action: {type: 'string'}, 
        data: todoSchema
      }
    }, 
    nextId: {type: 'integer'}
  }
}

const data = {
  todos: [
    {id:1, done:false, subject:'牛乳を買う', context:'home'}, 
    {id:2, done:false, subject:'お金をおろす', context:'work'}
  ], 
  form: null, 
  nextId: 3
}

const onTodoItemCreate = (el) => {
  const r = el.getBoundingClientRect()
  el.animate([
    {offset:0, maxHeight: 0}, 
    {offset:0.999, maxHeight: ((r.height * 1.2) + 30) + 'px'}, 
    {offset:1, maxHeight:'none'}
  ], 150)
}

const onTodoItemRemove = (el, done) => {
  const r = el.getBoundingClientRect()
  const anim = el.animate([
    {maxHeight: ((r.height * 1.2) + 30) + 'px'}, 
    {maxHeight: 0}
  ], 150)
  prepareToDestroy(el, anim, done)
}

const showError = ({name, message}) => `エラーが発生しました（${name}: ${message}）`

const TodoItem = playListItem(({path, editing, env, ...props}) => {
  const id = API.extract(path + '/id', env)
  const handleStyle = editing ? {pointerEvents:'none', opacity:0.26} : {}
  return (
    <div class="media" key={'item-'+id} id={id} {...props}>
      <div class="media-left">
        <div class="columns is-gapless is-vcentered is-mobile">
          <div class="column">
            <span class={`icon is-medium my-1 ${editing ? '' : 'handle'}`}><span class="material-icons" style={handleStyle}>drag_handle</span></span>
          </div>
          <div class="column">
            <Checkbox class="px-2 py-1" mg-path={path + '/done'} />
          </div>
        </div>
      </div>
      <div class="media-content">
        <p class="py-2 is-fullwidth">
          <Clickable style={{cursor:'pointer'}} mg-update="editPart" mg-context={[path, '/form']}>{API.extract(path + '/subject', env)} @{API.extract(path + '/context', env)}</Clickable>
        </p>
      </div>
      <div class="media-right">
        <UpdateButton class="is-info is-inverted mx-1" mg-update="copyPart" mg-context={[path, '/nextId', {}]}><span class="icon"><span class="material-icons">content_copy</span></span></UpdateButton>
        <UpdateButton class="is-danger is-inverted mx-1" mg-update="removePart" mg-context={[path, {}]}><span class="icon"><span class="material-icons">delete</span></span></UpdateButton>
      </div>
    </div>
  )
})

const TodoForm = ({env}) => {
  const id = API.extract('/form/data/id', env)
  return (
    <div class="media" key={`item-${id}`} id={id}>
      <div class="media-left">
        <div class="columns is-gapless is-vcentered is-mobile">
          <div class="column">
            <span class="icon is-medium my-1"><span class="material-icons" style={{pointerEvents:'none', opacity:0.26}}>drag_handle</span></span>
          </div>
          <div class="column">
            <Checkbox class="px-2 py-1" mg-path="/form/data/done" />
          </div>
        </div>
      </div>
      <div class="media-content">
        <div class="columns">
          <div class="column">
            <Field mg-path="/form/data/subject">
              <Input mg-path="/form/data/subject" class="input" type="text" />
            </Field>
          </div>
          <div class="column">
            <Field mg-path="/form/data/context">
              <Select mg-path="/form/data/context">
                <option value="" disabled></option>
                <option value="home">home</option>
                <option value="work">work</option>
              </Select>
            </Field>
          </div>
        </div>
      </div>
      <div class="media-right">
        <UpdateButton class="is-primary is-inverted mx-1" mg-update="commitPart" mg-context={['/form', '/nextId', {}]}><span class="icon"><span class="material-icons">check</span></span></UpdateButton>
        <UpdateButton class="is-danger is-inverted mx-1" mg-update="discardPart" mg-context={['/form']}><span class="icon"><span class="material-icons">clear</span></span></UpdateButton>
      </div>
    </div>
  )
}

const TodoButton = () => {
  return (
    <div class="media" key="add">
      <div class="media-content">
        <UpdateButton class="is-primary" mg-update="createPart" mg-context={['/todos/-', {id:0, done:false, subject:'', context:''}, '/form']}>追加</UpdateButton>
      </div>
    </div>
  )
}

const view = (env) => {
  const form = API.extract('/form', env)
  return (
    <div class="container my-3">
      <ReorderableList mg-name="todos" path="/todos" options={{group:'todos', handle:'.handle'}}>
        {API.extract('/todos', env).map((item, i) => {
          const path = '/todos/' + i
          return (form && form.action == path) ? <TodoForm env={env} /> : <TodoItem path={path} editing={!!form} env={env} />
        })}
        {(form && form.action.endsWith('-')) ? <TodoForm env={env} /> : <TodoButton />}
      </ReorderableList>
      <Dialog mg-name="confirm" title="確認" message="このTODOを削除します。よろしいですか？" hideCancelButton={false} />
    </div>
  )
}

const containerEl = document.getElementById('app')
const {onUpdate} = start({data, schema, view, containerEl})