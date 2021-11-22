
import {UnmagicalAction, UnmagicalState, UnmagicalActions, API} from '../framework'
import {NodeName, Children, h, UnmagicalComponent, OnCreateFunc, OnDestroyFunc} from '../components'

interface SortableEvent {
  from: HTMLElement, 
  to: HTMLElement, 
  item: HTMLElement, 
  oldIndex: number, 
  newIndex: number
}

const instantiateSortable = (name:string, onStart:UnmagicalAction<{update:string,context:any[]}>, onEnd:UnmagicalAction<{name:string,result:any}>, options:object):{oncreate:OnCreateFunc, ondestroy:OnDestroyFunc} => {
  var instance = null;
  var marker = null;
  var group = null;
  const effectiveOptions = {
    ...options, 
    onStart: (ev:SortableEvent) => {
      const fromPath = ev.from.dataset.mgPath
      marker = ev.item.nextElementSibling
      onStart({
        update: 'reorder', 
        context: [name, fromPath + '/' + ev.oldIndex, group]
      })
    }, 
    onEnd: (ev:SortableEvent) => {
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
      // @ts-ignore
      instance = Sortable.create(el, effectiveOptions)
      group = instance.option('group').name
    }, 
    ondestroy: () => {
      if (instance) {
        instance.destroy()
        instance = null
      }
    }
  }
}

export type SortableExtraProps = {
  name: string, 
  path: string, 
  options: object
}

export type SortableAutoProps = {
  'data-mg-path': string, 
  active: boolean, 
  itemPath: string, 
  group: string, 
  oncreate: OnCreateFunc, 
  ondestroy: OnDestroyFunc
}

export const playSortable = <OtherAttrs extends {}>(C:NodeName<SortableAutoProps & OtherAttrs>):NodeName<SortableExtraProps & OtherAttrs> => {
  return (props, children) => (state, actions) => {
    const {name, path, options = {}, ...attributes} = props
    const extra = API.getExtra(name, state.env) as {itemPath:string, group:string}
    const active = !!extra
    const {oncreate, ondestroy} = instantiateSortable(name, actions.onUpdate, actions.onPromiseSettle, options)
    const attrs:SortableAutoProps = {
      'data-mg-path': path, 
      active, 
      itemPath: extra ? extra.itemPath : "", 
      group: extra ? extra.group : "", 
      oncreate, 
      ondestroy
    }
    return h(C, attrs, ...children)
  }
}