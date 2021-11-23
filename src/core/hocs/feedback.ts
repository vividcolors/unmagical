
import {UnmagicalAction, UnmagicalState, UnmagicalActions, API} from '../framework'
import {NodeName, Children, h, UnmagicalComponent, prepareToDestroy, OnCreateFunc, OnRemoveFunc, DoneFunc} from '../components'


const feedbackOnCreate:Record<string,OnCreateFunc> = {
  fade: (el) => {
    el.animate([
      {opacity: 0}, 
      {opacity: 1}
    ], 200)
    el.scrollIntoView()
  }, 
  zoom: (el) => {
    el.animate([
      {transform: 'scale(0.8)'}, 
      {transform: 'scale(1)'}
    ], 200)
    el.scrollIntoView()
  }, 
  slide: (el) => {
    const r = el.getBoundingClientRect()
    el.animate([
      {offset:0, maxHeight: 0}, 
      {offset:0.999, maxHeight: ((r.height * 1.2) + 30) + 'px'}, 
      {offset:1, maxHeight:'none'}
    ], 200)
    el.scrollIntoView()
  }
}
const feedbackOnRemove:Record<string,OnRemoveFunc> = {
  fade: (el, done) => {
    const anim = el.animate([
      {opacity: 1}, 
      {opacity: 0}
    ], 200)
    prepareToDestroy(el, anim, done)
  }, 
  zoom: (el, done) => {
    const anim = el.animate([
      {transform: 'scale(1)'}, 
      {transform: 'scale(0.8)'}
    ], 200)
    prepareToDestroy(el, anim, done)
  }, 
  slide: (el, done) => {
    const r = el.getBoundingClientRect()
    const anim = el.animate([
      {maxHeight: ((r.height * 1.2) + 30) + 'px'}, 
      {maxHeight: 0}
    ], 200)
    prepareToDestroy(el, anim, done)
  }
}

export type FeedbackExtraProps = {
  name: string, 
  duration: number
}

export type FeedbackAutoProps = {
  name: string, 
  data: any, 
  shown: boolean, 
  oncreate: OnCreateFunc, 
  onremove: OnRemoveFunc
}

// nullIfHidden, transition
export const playFeedback = (transition:"fade"|"zoom"|"slide", nullIfHidden:boolean) => <OtherAttrs extends {}>(C:NodeName<FeedbackAutoProps & OtherAttrs>):UnmagicalComponent<FeedbackExtraProps & OtherAttrs> => {
  return (props, children) => (state, actions) => {
    const {duration, ...attributes} = props
    const name = attributes.name
    const data = API.getFeedback(name, state.env)
    if (nullIfHidden && data === null) return null
    const attrs:FeedbackAutoProps = {
      ...attributes, 
      data: ('code' in data) ? state.normalizeError(data) : data, 
      shown: data !== null, 
      oncreate: feedbackOnCreate[transition], 
      onremove: feedbackOnRemove[transition]
    }
    if (duration > 0) {
      let timeoutId = null
      const oncreate = attrs.oncreate
      attrs.oncreate = (el) => {
        timeoutId = setTimeout(() => actions.onUpdate({update:"closeFeedback", context:[name]}), duration)
        if (oncreate) oncreate(el)
      }
      const onremove = attrs.onremove
      attrs.onremove = (el, done) => {
        if (timeoutId) {
          clearTimeout(timeoutId)
        }
        if (onremove) onremove(el, done)
      }
    }
    return h(C, attrs, ...children)
  }
}