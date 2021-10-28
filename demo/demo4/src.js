
import {h, API, start, Textbox, Listbox, Radio, Checkbox, UpdateButton, SettleButton, Field, Dialog, Notification, Progress} from '../../bindings/bulma'
import {playReorderable, playUpdateButton, prepareToDestroy} from '../../src/components'

const ClickableText = playUpdateButton("p", {onclick:'onclick'})

const instantiateSortable = (name, path, onStart, onEnd, options) => {
  var instance = null;
  var marker = null;
  console.log('instantiateSortable', options)
  const effectiveOptions = {
    ...options, 
    onStart: (ev) => {
      marker = ev.item.nextElementSibling
      onStart({
        update: 'reorder', 
        context: {
          name, 
          fromPath: path + '/' + ev.oldIndex
        }
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

const itemProps = {
  id: {type:'integer'}, 
  done: {type:'boolean'}, 
  subject: {type:'string', minLength:1}
}

const schema = {
  type: 'object', 
  properties: {
    todos: {
      type: 'array', 
      items: {type:'object', properties:itemProps}
    }, 
    activePath: {type: 'string'}, 
    activeItem: {type:'object?', properties:itemProps}, 
    nextId: {type: 'integer'}
  }
}

const data = {
  todos: [
    {id:1, done:false, subject:'牛乳を買う'}, 
    {id:2, done:false, subject:'お金をおろす'}
  ], 
  activePath: '', 
  activeItem: null, 
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

const TodoItem = ({path, activePath, env}) => {
  const id = API.extract(path + '/id', env)
  const handleStyle = activePath ? {pointerEvents:'none', opacity:0.26} : {}
  return (
    <div class="media" key={'item-'+id} id={id} oncreate={onTodoItemCreate} onremove={onTodoItemRemove}>
      <div class="media-left">
        <div class="columns is-gapless is-vcentered is-mobile">
          <div class="column">
            <span class={`icon is-medium my-1 ${activePath ? '' : 'handle'}`}><span class="material-icons" style={handleStyle}>drag_handle</span></span>
          </div>
          <div class="column">
            <label class="checkbox px-2 py-1">
              <Checkbox type="checkbox" mg-path={path + '/done'} />
            </label>
          </div>
        </div>
      </div>
      <div class="media-content">
        <ClickableText class="py-2 is-fullwidth " style={{cursor:'pointer'}} mg-update="editPart" mg-context={{path, pointerPath:'/activePath', formPath:'/activeItem'}}>{API.extract(path + '/subject', env)}</ClickableText>
      </div>
      <div class="media-right">
        <UpdateButton class="button is-info is-inverted mx-1" mg-update="copyPart" mg-context={{path, pathToAdd:'/todos/-', options:{nextIdPath:'/nextId', idProperty:'id'}}}><span class="icon"><span class="material-icons">content_copy</span></span></UpdateButton>
        <UpdateButton class="button is-danger is-inverted mx-1" mg-update="removePart" mg-context={{path, options:{confirmationMessage:'このTODOを削除します。よろしいですか？'}}}><span class="icon"><span class="material-icons">delete</span></span></UpdateButton>
      </div>
    </div>
  )
}

const TodoForm = ({path, activePath, env}) => {
  const id = API.extract('/activeItem/id', env)
  return (
    <div class="media" key={'item-'+id} id={id}>
      <div class="media-left">
        <div class="columns is-gapless is-vcentered is-mobile">
          <div class="column">
            <span class="icon is-medium my-1"><span class="material-icons" style={{pointerEvents:'none', opacity:0.26}}>drag_handle</span></span>
          </div>
          <div class="column">
            <label class="checkbox px-2 py-1">
              <Checkbox type="checkbox" mg-path="/activeItem/done" />
            </label>
          </div>
        </div>
      </div>
      <div class="media-content">
        <Field path="/activeItem/subject" env={env}>
          <Textbox mg-path="/activeItem/subject" class="input" type="text" />
        </Field>
      </div>
      <div class="media-right">
        <UpdateButton class="button is-primary is-inverted mx-1" mg-update="commitPart" mg-context={{pointerPath:'/activePath', formPath:'/activeItem', options:{nextIdPath:'/nextId'}}}><span class="icon"><span class="material-icons">check</span></span></UpdateButton>
        <UpdateButton class="button is-danger is-inverted mx-1" mg-update="discardPart" mg-context={{pointerPath:'/activePath', formPath:'/activeItem'}}><span class="icon"><span class="material-icons">clear</span></span></UpdateButton>
      </div>
    </div>
  )
}

const TodoButton = ({nextId}) => {
  return (
    <div class="media" key="add">
      <div class="media-content">
        <UpdateButton class="button is-primary" mg-update="createPart" mg-context={{pathToAdd:'/todos/-', data:{id:nextId, done:false, subject:''}, pointerPath:'/activePath', formPath:'/activeItem'}}>追加</UpdateButton>
      </div>
    </div>
  )
}

const view = (env) => {
  const activePath = API.extract('/activePath', env)
  const nextId = API.extract('/nextId', env)
  return (
    <div class="container my-3">
      <ReorderableList mg-name="todos" path="/todos" options={{group:'todos', handle:'.handle'}}>
        {API.extract('/todos', env).map((item, i) => {
          const path = '/todos/' + i
          return (path == activePath) ? <TodoForm path={path} activePath={activePath} env={env} /> : <TodoItem path={path} activePath={activePath} env={env} />
        })}
        {activePath.endsWith('-') ? <TodoForm path={activePath} activePath={activePath} env={env} /> : <TodoButton nextId={nextId} />}
      </ReorderableList>
      <Dialog mg-name="confirm" title="確認" hideCancelButton={false} />
    </div>
  )
}

const containerEl = document.getElementById('app')
const {onUpdate} = start({data, schema, view, containerEl})