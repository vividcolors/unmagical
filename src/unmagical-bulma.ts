

export {h, API, start, once} from './core/framework'
export {Input, Textarea, Select, Radio, Checkbox, Field, UpdateButton, DeleteButton, Clickable, SettleButton, Dialog, Notification, Progress, Modal, Pagination, DatePicker, ColorPicker, ShowItemFunc, ReorderableList, ListItem} from './bindings/bulma'
export {makeRestRepository, makeSingularRestRepository} from './core/rest'
export {makeStorageRepository} from './core/storage'
import * as Updates from './core/updates'
export {Updates}
export {makeEntityListUpdates, makeEntityUpdates} from './core/updates'
export {validate, defaultRules, coerce} from './core/schema'
export {normalizeError, defaultCatalog} from './core/errors'

export {StartParameter, Store} from './core/framework'
export {AnyAttrs} from './bindings/bulma'

/** @ts-ignore */
if (Babel && Babel.registerPreset) {
  /** @ts-ignore */
  Babel.registerPreset("env-unmagical", {
    /** @ts-ignore */
    presets: [Babel.availablePresets["env"], Babel.availablePresets["react"]],
    /** @ts-ignore */
    plugins: [[Babel.availablePlugins["transform-react-jsx"], {"pragma": "h"}],],
  });
}