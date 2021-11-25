export as namespace hyperapp

/** @namespace [VDOM] */

/** The VDOM representation of an Element.
 *
 * @memberOf [VDOM]
 */
export interface VNode<Attributes = {}> {
  nodeName: string
  attributes?: Attributes
  children: Array<VNode | string>
  key: string | number | null
}

/** A Component is a function that returns a custom VNode or View.
 * 
 * @remark
 * In unmagical, we added `ToAttributes` type parameter.
 *
 * @memberOf [VDOM]
 */
export interface Component<Attributes = {}, State = {}, Actions = {}, ToAttributes = {}> {
  (attributes: Attributes, children: Array<VNode | string>):
    | VNode<ToAttributes>
    | View<State, Actions>
}

/**
 * Possibles children types
 */
export type Children = VNode | string | number | null

/** The soft way to create a VNode.
 * @param name      An element name or a Component function
 * @param attributes     Any valid HTML atributes, events, styles, and meta data
 * @param children  The children of the VNode
 * @returns A VNode tree.
 * 
 * @remarks
 * In unmagical, we added `ToAttributes` type parameter.
 * Also we changed Element type from: 
 * ```
 * interface Element extends VNode<any> {}
 * ```
 * to: 
 * ```
 * type Element = VNode<any> | View<any, any>;
 * ```
 *
 * @memberOf [VDOM]
 */
export function h<Attributes,ToAttributes>(
  nodeName: Component<Attributes, any, any, ToAttributes> | string,
  attributes?: Attributes,
  ...children: Array<Children | Children[]>
): VNode<ToAttributes>

/** @namespace [App] */

/** The result of an action.
 *
 * @memberOf [App]
 */
export type ActionResult<State> = Partial<State> | Promise<any> | null | void

/** The interface for a single action implementation.
 *
 * @memberOf [App]
 */
export type ActionType<Data, State, Actions> = (
  data?: Data
) =>
  | ((state: State, actions: Actions) => ActionResult<State>)
  | ActionResult<State>

/** The interface for the actions tree implementation.
 *
 * @memberOf [App]
 */
export type ActionsType<State, Actions> = {
  [P in keyof Actions]:
    | ActionType<any, State, Actions>
    | ActionsType<any, Actions[P]>
}

/** The view function describes the application UI as a tree of VNodes.
 * @returns A VNode tree.
 * @memberOf [App]
 */
export interface View<State, Actions> {
  (state: State, actions: Actions): VNode<object> | null
}

/** The app() call creates and renders a new application.
 *
 * @param state The state object.
 * @param actions The actions object implementation.
 * @param view The view function.
 * @param container The DOM element where the app will be rendered to.
 * @returns The actions wired to the application.
 * @memberOf [App]
 */
export function app<State, Actions>(
  state: State,
  actions: ActionsType<State, Actions>,
  view: View<State, Actions>,
  container: Element | null
): Actions

/** @namespace [JSX] */

declare global {
  namespace JSX {
    //interface Element extends VNode<any> {}
    type Element = VNode<any> | View<any, any>;
    interface IntrinsicElements {
      [elemName: string]: any
    }
  }
}
