
import {h, API, start, Input, Select, Radio, Checkbox, UpdateButton, Clickable, SettleButton, Field, Dialog, Notification, Progress} from '../../src/bindings/bulma'
import {playSortable} from '../../src/core/hocs/sortable'
import {playListItem} from '../../src/core/hocs/listitem'
import {createRestRepository} from '../../src/core/repository'
import {makeEntityUpdates} from '../../src/core/updates'

const ReorderableList = playSortable(({itemPath = null, group = null, showItem = null, items = null, ...props}, children) => {
  return (
    <div class="reorderableList" {...props}>
      {(showItem && items) ? (
        items.map((item, index) => showItem(item, index, itemPath, group))
      ) : (
        children
      )}
    </div>
  )
})

const todoSchema = {
  type: 'object', 
  properties: {
    id: {type:'integer'}, 
    done: {type:'boolean'}, 
    subject: {type:'string', notEmpty:true}, 
    context: {type:'string', notEmpty:true, enum:['home', 'work']}
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
        method: {type: 'string'}, 
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

const updates = {
  ...makeEntityUpdates(createRestRepository('http://localhost:3000/btopcs'))
}

const TodoItem = playListItem("slide")(({path, editing, env, ...props}) => {
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
            <Checkbox class="px-2 py-1" path={path + '/done'} />
          </div>
        </div>
      </div>
      <div class="media-content">
        <p class="py-2 is-fullwidth">
          <Clickable style={{cursor:'pointer'}} update="editPart" context={[path, '/form']}>{API.extract(path + '/subject', env)} @{API.extract(path + '/context', env)}</Clickable>
        </p>
      </div>
      <div class="media-right">
        <UpdateButton class="is-info is-inverted mx-1" update="copyPart" context={[path, '/nextId', {}]}><span class="icon"><span class="material-icons">content_copy</span></span></UpdateButton>
        <UpdateButton class="is-danger is-inverted mx-1" update="removePart" context={[path, {}]}><span class="icon"><span class="material-icons">delete</span></span></UpdateButton>
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
            <Checkbox class="px-2 py-1" path="/form/data/done" />
          </div>
        </div>
      </div>
      <div class="media-content">
        <div class="columns">
          <div class="column">
            <Field path="/form/data/subject">
              <Input path="/form/data/subject" class="input" type="text" />
            </Field>
          </div>
          <div class="column">
            <Field path="/form/data/context">
              <Select path="/form/data/context">
                <option value="" disabled></option>
                <option value="home">home</option>
                <option value="work">work</option>
              </Select>
            </Field>
          </div>
        </div>
      </div>
      <div class="media-right">
        <UpdateButton class="is-primary is-inverted mx-1" update="commitPart" context={['/form', '/nextId', {}]}><span class="icon"><span class="material-icons">check</span></span></UpdateButton>
        <UpdateButton class="is-danger is-inverted mx-1" update="discardPart" context={['/form']}><span class="icon"><span class="material-icons">clear</span></span></UpdateButton>
      </div>
    </div>
  )
}

const TodoButton = () => {
  return (
    <div class="media" key="add">
      <div class="media-content">
        <UpdateButton class="is-primary" update="createPart" context={['/todos/-', {id:0, done:false, subject:'', context:''}, '/form']}>追加</UpdateButton>
      </div>
    </div>
  )
}

const view = (env) => {
  const form = API.extract('/form', env)
  return (
    <div class="container my-3">
      <ReorderableList name="todos" path="/todos" options={{group:'todos', handle:'.handle'}}>
        {API.extract('/todos', env).map((item, i) => {
          const path = '/todos/' + i
          return (form && form.action == path) ? <TodoForm env={env} /> : <TodoItem path={path} editing={!!form} env={env} />
        })}
      </ReorderableList>
      {(form && form.action.endsWith('-')) ? <TodoForm env={env} /> : <TodoButton />}
      <Dialog name="confirm" title="確認" message="このTODOを削除します。よろしいですか？" hideCancelButton={false} />
    </div>
  )
}

const containerEl = document.getElementById('app')
const {onUpdate} = start({data, schema, view, containerEl, updates})