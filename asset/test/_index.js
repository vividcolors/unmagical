parcelRequire=function(e,r,t,n){var i,o="function"==typeof parcelRequire&&parcelRequire,u="function"==typeof require&&require;function f(t,n){if(!r[t]){if(!e[t]){var i="function"==typeof parcelRequire&&parcelRequire;if(!n&&i)return i(t,!0);if(o)return o(t,!0);if(u&&"string"==typeof t)return u(t);var c=new Error("Cannot find module '"+t+"'");throw c.code="MODULE_NOT_FOUND",c}p.resolve=function(r){return e[t][1][r]||r},p.cache={};var l=r[t]=new f.Module(t);e[t][0].call(l.exports,p,l,l.exports,this)}return r[t].exports;function p(e){return f(p.resolve(e))}}f.isParcelRequire=!0,f.Module=function(e){this.id=e,this.bundle=f,this.exports={}},f.modules=e,f.cache=r,f.parent=o,f.register=function(r,t){e[r]=[function(e,r){r.exports=t},{}]};for(var c=0;c<t.length;c++)try{f(t[c])}catch(e){i||(i=e)}if(t.length){var l=f(t[t.length-1]);"object"==typeof exports&&"undefined"!=typeof module?module.exports=l:"function"==typeof define&&define.amd?define(function(){return l}):n&&(this[n]=l)}if(parcelRequire=f,i)throw i;return f}({"Q81S":[function(require,module,exports) {
"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.typeOf=exports.pathToArray=exports.normalizePathArray=exports.normalizePath=exports.isJsonValue=exports.isIntStr=exports.emptyObject=exports.emptyArray=exports.commonPath=exports.appendPath=void 0;const t=t=>{const e=+t;return e%1==0&&t===""+e};exports.isIntStr=t;const e=e=>{const r=e.split("/");for(let o=1;o<r.length;o++)t(r[o])&&(r[o]="*");return r.join("/")};exports.normalizePath=e;const r=(t,e)=>{if(""==e.charAt(0)||"/"==e.charAt(0))return e;if("0"===e)return t;const r=s(t);let o=e.split("/"),n=[],p=+o[0];return p>(n=r).length&&(p=n.length),n.splice(n.length-p,p),o.shift(),0==o.length&&0==n.length?"":"/"+n.concat(o).join("/")};exports.appendPath=r;const o=e=>{let r="";for(let o=0;o<e.length;o++)"number"==typeof e[o]||t(e[o])?r+="/*":r+="/"+e[o];return r};exports.normalizePathArray=o;const s=e=>{const r=e.split("/"),o=[];for(let s=1;s<r.length;s++)o.push(t(r[s])?+r[s]:r[s]);return o};exports.pathToArray=s;const n=t=>null===t?"null":Array.isArray(t)?"array":typeof t;exports.typeOf=n;const p={};exports.emptyObject=p;const a=[];exports.emptyArray=a;const l=t=>{switch(n(t)){case"null":case"number":case"boolean":case"string":case"object":case"array":return!0;default:return!1}};exports.isJsonValue=l;const c=(t,e)=>{const r=t.split("/"),o=e.split("/"),s=[];for(let n=0;n<r.length&&!(o.length<=n)&&r[n]==o[n];n++)s.push(r[n]);return s.join("/")};exports.commonPath=c;
},{}],"FOZT":[function(require,module,exports) {
"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.run=void 0;var e=a(require("../src/core/utils"));function t(e){if("function"!=typeof WeakMap)return null;var a=new WeakMap,r=new WeakMap;return(t=function(e){return e?r:a})(e)}function a(e,a){if(!a&&e&&e.__esModule)return e;if(null===e||"object"!=typeof e&&"function"!=typeof e)return{default:e};var r=t(a);if(r&&r.has(e))return r.get(e);var n={},o=Object.defineProperty&&Object.getOwnPropertyDescriptor;for(var c in e)if("default"!==c&&Object.prototype.hasOwnProperty.call(e,c)){var p=o?Object.getOwnPropertyDescriptor(e,c):null;p&&(p.get||p.set)?Object.defineProperty(n,c,p):n[c]=e[c]}return n.default=e,r&&r.set(e,n),n}const r=(t,a,r)=>{t(1,()=>e.appendPath("/a/b","0/c/d"),"/a/b/c/d"),t(1.1,()=>e.appendPath("","0/c"),"/c"),t(1.2,()=>e.appendPath("/a/b","/x/y"),"/x/y"),t(1.3,()=>e.appendPath("/a/b/c","1/d/e"),"/a/b/d/e"),t(1.4,()=>e.appendPath("/a","3/z"),"/z"),t(1.5,()=>e.appendPath("/a/b","1"),"/a"),t(1.6,()=>e.appendPath("/a/b/c","3"),""),t(2,()=>e.commonPath("/a/b/c","/a/b/c"),"/a/b/c"),t(2.1,()=>e.commonPath("/a/b/c","/a/b/d"),"/a/b"),t(2.2,()=>e.commonPath("/a/b/c","/a"),"/a"),t(2.3,()=>e.commonPath("/a/b/c",""),"")};exports.run=r;
},{"../src/core/utils":"Q81S"}],"JBrm":[function(require,module,exports) {
"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.validate=exports.test=exports.setSlot=exports.setRet=exports.setExtra=exports.replace=exports.remove=exports.reduceDeep=exports.move=exports.mapDeep=exports.makeEnv=exports.isSame=exports.isEnv=exports.getSlot=exports.getExtra=exports.extract=exports.doReturn=exports.copy=exports.add=void 0;var e=require("./utils"),t=require("ramda");const r=["ret"];function o(e,t){if(null==e)return{};var r,o,a=n(e,t);if(Object.getOwnPropertySymbols){var s=Object.getOwnPropertySymbols(e);for(o=0;o<s.length;o++)r=s[o],t.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(e,r)&&(a[r]=e[r])}return a}function n(e,t){if(null==e)return{};var r,o,n={},a=Object.keys(e);for(o=0;o<a.length;o++)r=a[o],t.indexOf(r)>=0||(n[r]=e[r]);return n}function a(e){var t=s(e,"string");return"symbol"==typeof t?t:String(t)}function s(e,t){if("object"!=typeof e||null===e)return e;var r=e[Symbol.toPrimitive];if(void 0!==r){var o=r.call(e,t||"default");if("object"!=typeof o)return o;throw new TypeError("@@toPrimitive must return a primitive value.")}return("string"===t?String:Number)(e)}function c(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);t&&(o=o.filter(function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable})),r.push.apply(r,o)}return r}function i(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?c(Object(r),!0).forEach(function(t){u(e,t,r[t])}):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):c(Object(r)).forEach(function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))})}return e}function u(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}const l=(e,r)=>!e.length||(0,t.hasPath)(e,r),p=e=>(0,t.init)((0,t.init)(e)),f=t=>{const r={"@value":t,invalid:!1,message:""};switch((0,e.typeOf)(t)){case"object":case"array":break;case"number":case"integer":r.input=""+t,r.touched=!1;break;case"boolean":r.input=t?"true":"false",r.touched=!1;break;case"null":r.input="",r.touched=!1;break;case"string":r.input=t,r.touched=!1}return r},d=t=>{const r=t=>{switch((0,e.typeOf)(t)){case"array":const o=[];for(let e=0;e<t.length;e++)o[e]=r(t[e]);return f(o);case"object":const n={};for(let e in t)n[e]=r(t[e]);return f(n);default:return f(t)}};return r(t)},h=t=>{const r=t["@value"];switch((0,e.typeOf)(r)){case"array":const t=[];for(let e=0;e<r.length;e++)t[e]=h(r[e]);return t;case"object":const o={};for(let e in r)o[e]=h(r[e]);return o;default:return r}},v=(e,t,r)=>{return{tree:d(e),validationNeeded:!0,schemaDb:t,validate:r,extra:{}}};exports.makeEnv=v;const x=(e,t)=>e.tree===t.tree&&e.extra===t.extra&&e.validationNeeded===t.validationNeeded;exports.isSame=x;const y=t=>{const r=t.split("/"),o=[];for(let n=1;n<r.length;n++)o.push("@value"),o.push((0,e.isIntStr)(r[n])?+r[n]:r[n]);return o},b=(e,t)=>l(y(e),t.tree);exports.test=b;const w=(e,r)=>{const o=y(e),n=(0,t.path)(o,r.tree);if(!n)throw new Error("extract/1: not found: "+e);return h(n)};exports.extract=w;const m=(e,r)=>{const o=y(e),n=(0,t.path)(o,r.tree);if(!n)throw new Error("getSlot/1: not found: "+e);return n};exports.getSlot=m;const g=(e,r,o)=>{const n=y(e);(0,t.path)(n,o.tree);if(!r)throw new Error("setSlot/1: not found: "+e);const a=(0,t.assocPath)(n,r,o.tree);return i(i({},o),{},{tree:a})};exports.setSlot=g;const O=(r,o,n)=>{const a=y(r),s=p(a),c=(0,t.last)(a),u=(0,t.path)(s,n.tree),l=(0,e.typeOf)(u["@value"]);if("object"!=l&&"array"!=l)throw new Error("add/1 neither an object nor an array: "+r);if("array"==l){const e="-"===c?u["@value"].length:c;if("number"!=typeof e||e%1!=0)throw new Error("add/2 invalid index: "+r);if(e<0||e>u["@value"].length)throw new Error("add/3 index out of range: "+r);const a=d(o),l=(0,t.insert)(e,a,u["@value"]),p=f(l),h=(0,t.assocPath)(s,p,n.tree);return i(i({},n),{},{tree:h,validationNeeded:!0})}{if("string"!=typeof c)throw new Error("add/4 invalid name: "+r);const e=d(o),a=i(i({},u["@value"]),{},{[c]:e}),l=f(a),p=(0,t.assocPath)(s,l,n.tree);return i(i({},n),{},{tree:p,validationNeeded:!0})}};exports.add=O;const j=(r,o)=>{const n=y(r),a=p(n),s=(0,t.last)(n),c=(0,t.path)(a,o.tree),u=(0,e.typeOf)(c["@value"]);if("object"!=u&&"array"!=u)throw new Error("remove/1 neither an object nor an array: "+r);if("array"==u){if("number"!=typeof s||s%1!=0)throw new Error("remove/2 invalid index: "+r);if(s<0||s>=c["@value"].length)throw new Error("remove/3 out of range: "+r);const e=(0,t.remove)(s,1,c["@value"]),n=f(e),u=(0,t.assocPath)(a,n,o.tree);return i(i({},o),{},{tree:u,validationNeeded:!0})}{if(!c["@value"].hasOwnProperty(s))throw new Error("remove/4: property not found: "+r);const e=(0,t.dissoc)(s,c["@value"]),n=f(e),u=(0,t.assocPath)(a,n,o.tree);return i(i({},o),{},{tree:u,validationNeeded:!0})}};exports.remove=j;const E=(r,o,n)=>{const a=y(r);if(0==a.length){const e=d(o);return i(i({},n),{},{tree:e,validationNeeded:!0})}const s=p(a),c=(0,t.last)(a),u=(0,t.path)(s,n.tree),l=(0,e.typeOf)(u["@value"]);if("object"!=l&&"array"!=l)throw new Error("replace/1 neither an object nor an array: "+r);if("array"==l){if("number"!=typeof c||c%1!=0)throw new Error("replace/2 invalid index: "+r);if(c<0||c>=u["@value"].length)throw new Error("replace/3 out of range: "+r);const e=d(o),a=(0,t.update)(c,e,u["@value"]),l=f(a),p=(0,t.assocPath)(s,l,n.tree);return i(i({},n),{},{tree:p,validationNeeded:!0})}{if("string"!=typeof c)throw new Error("replace/4 invalid name: "+r);const e=d(o),a=i(i({},u["@value"]),{},{[c]:e}),l=f(a),p=(0,t.assocPath)(s,l,n.tree);return i(i({},n),{},{tree:p,validationNeeded:!0})}};exports.replace=E;const P=(e,t,r)=>{const o=w(e,r);return r=j(e,r),r=O(t,o,r)};exports.move=P;const S=(e,t,r)=>{const o=w(e,r);return r=O(t,o,r)};exports.copy=S;const D=(r,o)=>{let n=null;const a=t=>{const r=(0,e.appendPath)(n,t);return w(r,o)},s=(t,r,c)=>{const i=t["@value"];switch((0,e.typeOf)(i)){case"array":const u=[];for(let e=0;e<i.length;e++)u[e]=s(i[e],r+"/*",c+"/"+e);return n=c,o.validate(u,t,o.schemaDb[r],a);case"object":const l={};for(let e in i)l[e]=s(i[e],r+"/"+e,c+"/"+e);return n=c,o.validate(l,t,o.schemaDb[r],a);default:return n=c,o.validate(i,t,o.schemaDb[r],a)}},c=y(r),u=(0,t.path)(c,o.tree);if(!u)throw new Error("validate/1: not found: "+r);const l=s(u,(0,e.normalizePath)(r),r),p=(0,t.assocPath)(c,l,o.tree);return i(i({},o),{},{tree:p,validationNeeded:!1})};exports.validate=D;const N=(r,o,n)=>{const a=(t,o)=>{const n=t["@value"];switch((0,e.typeOf)(n)){case"array":const s=[];for(let e=0;e<n.length;e++)s[e]=a(n[e],o+"/"+e);return i(i({},r(t,o)),{},{"@value":s});case"object":const c={};for(let e in n)c[e]=a(n[e],o+"/"+e);return i(i({},r(t,o)),{},{"@value":c});default:return i(i({},r(t,o)),{},{"@value":n})}},s=y(o),c=(0,t.path)(s,n.tree);if(!c)throw new Error("mapDeep/1: not found: "+o);const u=a(c,o),l=(0,t.assocPath)(s,u,n.tree);return i(i({},n),{},{tree:l})};exports.mapDeep=N;const k=(r,o,n,a)=>{const s=(t,o,n)=>{const a=o["@value"];switch((0,e.typeOf)(a)){case"array":for(let e=0;e<a.length;e++)t=s(t,a[e],n+"/"+e);return r(t,o,n);case"object":for(let e in a)t=s(t,a[e],n+"/"+e);return r(t,o,n);default:return r(t,o,n)}},c=y(n),i=(0,t.path)(c,a.tree);if(!i)throw new Error("reduceDeep/1: not found: "+n);return s(o,i,n)};exports.reduceDeep=k;const R=(e,t,r)=>{if(null===t){const t=r.extra,{[e]:n}=t,s=o(t,[e].map(a));return i(i({},r),{},{extra:s})}{const o=i(i({},r.extra),{},{[e]:t});return i(i({},r),{},{extra:o})}};exports.setExtra=R;const q=(e,t)=>t.extra[e]||null;exports.getExtra=q;const I=(e,t)=>{if(e)return i(i({},t),{},{ret:e});const{ret:n}=t;return o(t,r)};exports.setRet=I;const _=e=>{if(!e.ret)throw new Error("doReturn/0: no ret");e.ret(e)};exports.doReturn=_;const z=e=>null!=e&&"object"==typeof e&&"tree"in e;exports.isEnv=z;
},{"./utils":"Q81S"}],"WCXc":[function(require,module,exports) {
"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.run=void 0;var e=r(require("../src/core/env"));function t(e){if("function"!=typeof WeakMap)return null;var r=new WeakMap,a=new WeakMap;return(t=function(e){return e?a:r})(e)}function r(e,r){if(!r&&e&&e.__esModule)return e;if(null===e||"object"!=typeof e&&"function"!=typeof e)return{default:e};var a=t(r);if(a&&a.has(e))return a.get(e);var o={},i=Object.defineProperty&&Object.getOwnPropertyDescriptor;for(var d in e)if("default"!==d&&Object.prototype.hasOwnProperty.call(e,d)){var c=i?Object.getOwnPropertyDescriptor(e,d):null;c&&(c.get||c.set)?Object.defineProperty(o,d,c):o[d]=e[d]}return o.default=e,a&&a.set(e,o),o}function a(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);t&&(a=a.filter(function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable})),r.push.apply(r,a)}return r}function o(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?a(Object(r),!0).forEach(function(t){i(e,t,r[t])}):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):a(Object(r)).forEach(function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))})}return e}function i(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}const d=(e,t)=>({"@value":e}),c=(t,r)=>{let a=e.makeEnv({name:"Bob",age:24,buddies:["Mam","Dad"]},{},d);t(1,()=>e.extract("/name",a),"Bob"),t(1.1,()=>e.test("/name",a),!0),t(1.2,()=>e.test("/foo",a),!1),a=e.add("/email","info@example.com",a),t(2,()=>e.extract("/email",a),"info@example.com"),r(2.1,()=>e.extract("/foo",a),"extract/"),t(3,()=>e.extract("/buddies/1",a),"Dad"),a=e.add("/buddies/1","Pochi",a),t(4,()=>e.extract("/buddies/1",a),"Pochi"),r(4.1,()=>e.extract("/buddies/5",a),"extract/"),a=e.add("/buddies/-","Komino",a),t(5,()=>e.extract("/buddies/3",a),"Komino"),a=e.remove("/buddies/3",a),t(6,()=>e.extract("/buddies",a).join(","),"Mam,Pochi,Dad"),r(6.1,()=>e.extract("/buddies/3",a),"extract/"),a=e.remove("/email",a),r(7,()=>e.extract("/email",a),"extract/"),r(7.1,()=>e.remove("/email",a),"remove/"),t(8,()=>{let t=e.getSlot("/name",a);return t=o(o({},t),{},{invalid:!0}),a=e.setSlot("/name",t,a),(t=e.getSlot("/name",a)).invalid},!0),a=e.replace("/age",30,a),t(9,()=>e.extract("/age",a),30);let i=e.replace("",{foo:1},a);t(9.1,()=>e.extract("/foo",i),1),r(9.2,()=>e.extract("/age",i),"extract/"),a=e.add("/id","TS1101",a),a=e.move("/id","/employeeId",a),t(10,()=>e.extract("/employeeId",a),"TS1101"),r(10.1,()=>e.extract("/id",a),"extract/"),a=e.copy("/employeeId","/id",a),t(11,()=>e.extract("/employeeId",a),"TS1101"),t(11.1,()=>e.extract("/id",a),"TS1101"),t(11.9,()=>e.extract("/buddies",a).join(","),"Mam,Pochi,Dad"),a=e.move("/buddies/2","/buddies/0",a),t(12,()=>e.extract("/buddies",a).join(","),"Dad,Mam,Pochi"),a=e.copy("/buddies/0","/buddies/2",a),t(13,()=>e.extract("/buddies",a),"Dad,Mam,Dad,Pochi"),a=e.mapDeep((e,t)=>o(o({},e),{},{message:"yeah"}),"/buddies",a),t(14,()=>e.getSlot("/buddies",a).message,"yeah"),t(14.1,()=>e.getSlot("/buddies/0",a).message,"yeah"),t(14.2,()=>e.getSlot("/name",a).message||"",""),t(15,()=>e.reduceDeep((e,t,r)=>"/buddies"==r?e:e+`[${t["@value"]}]`,"","/buddies",a),"[Dad][Mam][Dad][Pochi]")};exports.run=c;
},{"../src/core/env":"JBrm"}],"PwL0":[function(require,module,exports) {
"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.validate=exports.defaultRules=exports.defaultMessages=exports.coerce=exports.buildDb=void 0;var e=require("./utils");function r(e,r){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);r&&(n=n.filter(function(r){return Object.getOwnPropertyDescriptor(e,r).enumerable})),t.push.apply(t,n)}return t}function t(e){for(var t=1;t<arguments.length;t++){var a=null!=arguments[t]?arguments[t]:{};t%2?r(Object(a),!0).forEach(function(r){n(e,r,a[r])}):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(a)):r(Object(a)).forEach(function(r){Object.defineProperty(e,r,Object.getOwnPropertyDescriptor(a,r))})}return e}function n(e,r,t){return r in e?Object.defineProperty(e,r,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[r]=t,e}const a=e=>{if(!e)return!0;const r=e.charAt(e.length-1);return"null"==e||"?"==r},o={"schema.ruleError.enum":"Invalid input","schema.ruleError.const":"Invalid input","schema.ruleError.required":"Missing properties","schema.ruleError.switchRequired":"Unknown instance","schema.ruleError.same":"Not a same value","schema.ruleError.multipleOf":"Please enter a multiple of {{0}}","schema.ruleError.maximum":"Please enter {{0}} or less","schema.ruleError.exclusiveMaximum":"Please enter a number less than {{0}}","schema.ruleError.minimum":"Please enter {{0}} or more","schema.ruleError.exclusiveMinimum":"Please enter a number more than {{0}}","schema.ruleError.maxLength":"Please enter no more than {{0}} characters","schema.ruleError.minLength0":"Please enter","schema.ruleError.minLength":"Please enter at least {{0}} characters","schema.ruleError.pattern":"Invalid format","schema.ruleError.maxItems":"Please make it less than or equal to {{0}}","schema.ruleError.minItems":"Please make it more than or equal to {{0}}","schema.valueError.generic":"Invalid value","schema.valueError.null":"Invalid input","schema.valueError.number":"Please input a number","schema.valueError.number?":"Please input a number","schema.valueError.integer":"Please input an integer","schema.valueError.integer?":"Please input an integer","schema.valueError.boolean":"Please input true or false","schema.valueError.boolean?":"Please input true or false","schema.valueError.string":"Invalid input","schema.valueError.array":"Invalid input","schema.valueError.array?":"Invalid input","schema.valueError.object":"Invalid input","schema.valueError.object?":"Invalid input"};exports.defaultMessages=o;const u=e=>{const r={},t=(e,n)=>{switch(r[n]=e,e.type){case"object":case"object?":for(let r in e.properties)t(e.properties[r],n+"/"+r);break;case"array":case"array?":t(e.items,n+"/*")}};return t(e,""),r};exports.buildDb=u;const s=(e,r,t=null)=>{return(e[r]||r+": {{0}}").replace("{{0}}",""+t)},i=(e,r)=>{if(!r)return!0;if(null===e)return a(r);switch(r){case"null":return!1;case"number":case"number?":return"number"==typeof e;case"integer":case"integer?":return"number"==typeof e&&e%1==0;case"boolean":case"boolean?":return"boolean"==typeof e;case"string":return"string"==typeof e;case"object":case"object?":return"object"==typeof e&&null!==e;case"array":case"array?":return Array.isArray(e);default:throw new Error("unknown type: "+r)}},l={enum:(e,r)=>{if(!Array.isArray(e))throw new Error("invalid parameter");for(let t=0;t<e.length;t++)if(e[t]===r)return!0;return"schema.ruleError.enum"},const:(e,r)=>e===r||"schema.ruleError.const",required:(e,r)=>{if(!Array.isArray(e))throw new Error("invalid parameter");if("object"!=typeof r)return!0;for(let t=0;t<e.length;t++)if(!r.hasOwnProperty(e[t]))return"schema.ruleError.required";return!0},switchRequired:(r,t,n)=>{if("object"!=(0,e.typeOf)(r)||!("tagProperty"in r))throw new Error("invalid parameter");if("object"!=(0,e.typeOf)(t))return!0;const a=n("0/"+r.tagProperty);if(!a||!r.types[a])return"schema.ruleError.switchRequired";const o=r.types[a];if(!Array.isArray(o))throw new Error("invalid parameter");for(let e=0;e<o.length;e++)if(!t.hasOwnProperty(o[e]))return"schema.ruleError.switchRequired";return!0},same:(e,r,t)=>{if("string"!=typeof e)throw new Error("invalid parameter");return t(e)===r||"schema.ruleError.same"},multipleOf:(e,r)=>{if("number"!=typeof e)throw new Error("invalid parameter");return"number"!=typeof r||(r%e==0||"schema.ruleError.multipleOf")},maximum:(e,r)=>"number"!=typeof r||(e>=r||"schema.ruleError.maximum"),exclusiveMaximum:(e,r)=>"number"!=typeof r||(e>r||"schema.ruleError.exclusiveMaximum"),minimum:(e,r)=>"number"!=typeof r||(e<=r||"schema.ruleError.minimum"),exclusiveMinimum:(e,r)=>"number"!=typeof r||(e<r||"schema.ruleError.exclusiveMinimum"),maxLength:(e,r)=>"string"!=typeof r||(r.length<=e||"schema.ruleError.maxLength"),minLength:(e,r)=>"string"!=typeof r||(r.length>=e||(1==e?"schema.ruleError.minLength0":"schema.ruleError.minLength")),pattern:(e,r)=>{if("string"!=typeof e)throw new Error("invalid parameter");return"string"!=typeof r||(!!new RegExp(e).test(r)||"schema.ruleError.pattern")},maxItems:(e,r)=>{if("number"!=typeof e)throw new Error("invalid parameter");return!Array.isArray(r)||(r.length<=e||"schema.ruleError.maxItems")},minItems:(e,r)=>{if("number"!=typeof e)throw new Error("invalid parameter");return!Array.isArray(r)||(r.length>=e||"schema.ruleError.minItems")}};exports.defaultRules=l;const c=(r,n)=>(a,o,u,l)=>{if(!(0,e.isJsonValue)(a)){const e=u&&u.type?"schema.valueError."+u.type:"schema.valueError.generic";return t(t({},o),{},{"@value":a,invalid:!0,message:s(n,e,null)})}if(u&&u.type&&!i(a,u.type))return t(t({},o),{},{"@value":a,invalid:!0,message:s(n,"schema.typeError."+u.type,null)});for(let e in u){const i=r[e];if(!i)continue;const c=i(u[e],a,l);if(!0!==c){const r=s(n,c,u[e]);return t(t({},o),{},{"@value":a,invalid:!0,message:r})}}return t(t({},o),{},{"@value":a,invalid:!1,message:""})};exports.validate=c;const m=(e,r)=>(e,r,t)=>{if(!t)throw new Error("coerce/0: no schema");if(!t.type)throw new Error("coerce/1: type not specified");if(-1==["null","boolean","boolean?","integer","integer?","number","number?","string"].indexOf(t.type))throw new Error("coerce/2: not a coercion enabled type: "+t.type);switch(t.type){case"null":break;case"number":case"number?":const n=+e;if(""+n===e)return{"@value":n,input:e,touched:r.touched};break;case"integer":case"integer?":const a=+e;if(""+a===e&&a%1==0)return{"@value":a,input:e,touched:r.touched};break;case"boolean":case"boolean?":if("true"===e||"false"===e)return{"@value":"true"===e,input:e,touched:r.touched};break;case"string":return{"@value":e,input:e,touched:r.touched}}return""==e&&a(t.type)?{"@value":null,input:e,touched:r.touched}:{input:e,touched:r.touched}};exports.coerce=m;
},{"./utils":"Q81S"}],"zpTb":[function(require,module,exports) {
"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.run=void 0;var i=l(require("../src/core/schema"));function e(i){if("function"!=typeof WeakMap)return null;var l=new WeakMap,a=new WeakMap;return(e=function(i){return i?a:l})(i)}function l(i,l){if(!l&&i&&i.__esModule)return i;if(null===i||"object"!=typeof i&&"function"!=typeof i)return{default:i};var a=e(l);if(a&&a.has(i))return a.get(i);var n={},t=Object.defineProperty&&Object.getOwnPropertyDescriptor;for(var r in i)if("default"!==r&&Object.prototype.hasOwnProperty.call(i,r)){var v=t?Object.getOwnPropertyDescriptor(i,r):null;v&&(v.get||v.set)?Object.defineProperty(n,r,v):n[r]=i[r]}return n.default=i,a&&a.set(i,n),n}function a(i,e){var l=Object.keys(i);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(i);e&&(a=a.filter(function(e){return Object.getOwnPropertyDescriptor(i,e).enumerable})),l.push.apply(l,a)}return l}function n(i){for(var e=1;e<arguments.length;e++){var l=null!=arguments[e]?arguments[e]:{};e%2?a(Object(l),!0).forEach(function(e){t(i,e,l[e])}):Object.getOwnPropertyDescriptors?Object.defineProperties(i,Object.getOwnPropertyDescriptors(l)):a(Object(l)).forEach(function(e){Object.defineProperty(i,e,Object.getOwnPropertyDescriptor(l,e))})}return i}function t(i,e,l){return e in i?Object.defineProperty(i,e,{value:l,enumerable:!0,configurable:!0,writable:!0}):i[e]=l,i}const r=(e,l,a)=>{const t=i.validate(i.defaultRules,{}),r=i.coerce(i.defaultRules,{});let v=null;v={type:"null"},e(1,()=>t(null,{},v).invalid,!1),e(1.1,()=>t(1,{},v).invalid,!0),e(1.2,()=>t("abc",{},v).invalid,!0),e(1.3,()=>r("",{},v)["@value"],null),a(1.4,()=>r("abc",{},v)["@value"]),e(1.5,()=>t(void 0,{},v).invalid,!0),v=null,e(2,()=>t(null,{},v).invalid,!1),e(2.1,()=>t(10,{},v).invalid,!1),e(2.2,()=>t([],{},v).invalid,!1),l(2.3,()=>r("",{},v),"coerce/"),l(2.4,()=>r("aaa",{},v),"coerce/"),e(2.5,()=>t(void 0,{},v).invalid,!0),v={type:"boolean"},e(3,()=>t(null,{},v).invalid,!0),e(3.1,()=>t(1,{},v).invalid,!0),e(3.2,()=>t(!0,{},v).invalid,!1),a(3.3,()=>r("",{},v)["@value"]),e(3.4,()=>r("false",{},v)["@value"],!1),a(3.5,()=>r("abc",{},v)["@value"]),e(3.6,()=>r("true",{},v)["@value"],!0),v={type:"boolean?"},e(4,()=>t(null,{},v).invalid,!1),e(4.1,()=>t(1,{},v).invalid,!0),e(4.2,()=>t(!0,{},v).invalid,!1),e(4.3,()=>r("",{},v)["@value"],null),e(4.4,()=>r("false",{},v)["@value"],!1),a(4.5,()=>r("abc",{},v)["@value"]),v={type:"integer"},e(5,()=>t(null,{},v).invalid,!0),e(5.1,()=>t(1,{},v).invalid,!1),e(5.2,()=>t(!0,{},v).invalid,!0),a(5.3,()=>r("",{},v)["@value"]),e(5.4,()=>r("10",{},v)["@value"],10),a(5.5,()=>r("abc",{},v)["@value"]),e(5.6,()=>t(132,{},v)["@value"],132),v={type:"integer?"},e(6,()=>t(null,{},v).invalid,!1),e(6.1,()=>t(1,{},v).invalid,!1),e(6.2,()=>t(!0,{},v).invalid,!0),e(6.3,()=>r("",{},v)["@value"],null),e(6.4,()=>r("10",{},v)["@value"],10),a(6.5,()=>r("10.3",{},v)["@value"]),e(6.6,()=>r("132",{},v)["@value"],132),v={type:"number"},e(7,()=>t(null,{},v).invalid,!0),e(7.1,()=>t(1.2,{},v).invalid,!1),e(7.2,()=>t(!0,{},v).invalid,!0),a(7.3,()=>r("",{},v)["@value"]),e(7.4,()=>r("10.3",{},v)["@value"],10.3),a(7.5,()=>r("abc",{},v)["@value"]),v={type:"number?"},e(8,()=>t(null,{},v).invalid,!1),e(8.1,()=>t(1.2,{},v).invalid,!1),e(8.2,()=>t(!0,{},v).invalid,!0),e(8.3,()=>r("",{},v)["@value"],null),e(8.4,()=>r("10.3",{},v)["@value"],10.3),a(8.5,()=>r("abc",{},v)["@value"]),v={type:"string"},e(9,()=>t(null,{},v).invalid,!0),e(9.1,()=>t("",{},v).invalid,!1),e(9.2,()=>t(!0,{},v).invalid,!0),e(9.3,()=>t("abc",{},v).invalid,!1),e(9.4,()=>r("",{},v)["@value"],""),e(9.5,()=>r("abc",{},v)["@value"],"abc"),v={type:"object"},e(10,()=>t(null,{},v).invalid,!0),e(10.1,()=>t("",{},v).invalid,!0),e(10.2,()=>t({},v).invalid,!1),l(10.3,()=>r("",{},v),"coerce/"),v={type:"object?"},e(11,()=>t(null,{},v).invalid,!1),e(11.1,()=>t("",{},v).invalid,!0),e(11.2,()=>t({},{},v).invalid,!1),l(11.3,()=>r("",{},v),"coerce/"),v={type:"array"},e(12,()=>t(null,{},v).invalid,!0),e(12.1,()=>t("",{},v).invalid,!0),e(12.2,()=>t([],{},v).invalid,!1),l(12.3,()=>r("",{},v),"coerce/"),v={type:"array?"},e(13,()=>t(null,{},v).invalid,!1),e(13.1,()=>t("",{},v).invalid,!0),e(13.2,()=>t([],{},v).invalid,!1),l(13.3,()=>r("",{},v),"coerce/"),v={type:"integer?",enum:[1]},e(14,()=>t(null,{},v).invalid,!0),e(14.1,()=>t(1,{},v).invalid,!1),e(14.2,()=>t(3,{},v).invalid,!0),v={type:"number",const:3.2},e(15,()=>t(3.2,{},v).invalid,!1),e(15.1,()=>t(3,{},v).invalid,!0),v={type:"object",required:["foo","bar"]},e(16,()=>t({foo:1,bar:1},{},v).invalid,!1),e(16.1,()=>t({foo:1},{},v).invalid,!0),e(16.2,()=>t({foo:1,bar:1,baz:1},{},v).invalid,!1),e(16.3,()=>t(1,{},n(n({},v),{},{type:"integer"})).invalid,!1),v={type:"object",switchRequired:{tagProperty:"type",types:{infix:["type","op","lhs","rhs"],app:["type","f","arg"],var:["type","var"],lit:["type","val"],lambda:["type","param","expr"]}}};let d={type:"infix",op:"*",lhs:{type:"var",var:"n"},rhs:{type:"app",f:"fact",arg:{type:"infix",op:"-",lhs:{type:"var",var:"n"},rhs:{type:"lit"}}}};e(17,()=>t(d,{},v,i=>"infix").invalid,!1),e(17.1,()=>t(d.lhs,{},v,i=>"var").invalid,!1),e(17.2,()=>t(d.rhs.arg.rhs,{},v,i=>"lit").invalid,!0),e(17.3,()=>t(1,{},n(n({},v),{},{type:"integer"})).invalid,!1),v={type:"number?",multipleOf:1.2},e(18,()=>t(-2.4,{},v).invalid,!1),e(18.1,()=>t(1.5,{},v).invalid,!0),e(18.2,()=>t(null,{},v).invalid,!1),e(18.3,()=>t(!0,{},n(n({},v),{},{type:"boolean"})).invalid,!1),v={type:"integer?",maximum:10},e(19,()=>t(10,{},v).invalid,!1),e(19.1,()=>t(11,{},v).invalid,!0),e(19.2,()=>t(null,{},v).invalid,!1),e(19.3,()=>t(!0,{},n(n({},v),{},{type:"boolean"})).invalid,!1),v={type:"integer?",exclusiveMaximum:10},e(20,()=>t(9,{},v).invalid,!1),e(20.1,()=>t(10,{},v).invalid,!0),e(20.2,()=>t(null,{},v).invalid,!1),e(20.3,()=>t(!0,{},n(n({},v),{},{type:"boolean"})).invalid,!1),v={type:"integer?",minimum:10},e(21,()=>t(10,{},v).invalid,!1),e(21.1,()=>t(9,{},v).invalid,!0),e(21.2,()=>t(null,{},v).invalid,!1),e(21.3,()=>t(!0,{},n(n({},v),{},{type:"boolean"})).invalid,!1),v={type:"integer?",exclusiveMinimum:10},e(20,()=>t(10,{},v).invalid,!0),e(20.1,()=>t(11,{},v).invalid,!1),e(20.2,()=>t(null,{},v).invalid,!1),e(20.3,()=>t(!0,{},n(n({},v),{},{type:"boolean"})).invalid,!1),v={type:"string",maxLength:3},e(21,()=>t("abc",{},v).invalid,!1),e(21.1,()=>t("abcd",{},v).invalid,!0),e(21.2,()=>t("",{},v).invalid,!1),e(21.3,()=>t(!0,{},n(n({},v),{},{type:"boolean"})).invalid,!1),v={type:"string",minLength:3},e(21,()=>t("abd",{},v).invalid,!1),e(21.1,()=>t("ab",{},v).invalid,!0),e(21.2,()=>t("",{},v).invalid,!0),e(21.3,()=>t(!0,{},n(n({},v),{},{type:"boolean"})).invalid,!1),v={type:"string",pattern:"^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:.[a-zA-Z0-9-]+)*$"},e(22,()=>t("info@example.com",{},v).invalid,!1),e(22.1,()=>t("192.168.0.1",{},v).invalid,!0),e(22.2,()=>t(!0,{},n(n({},v),{},{type:"boolean"})).invalid,!1),v={type:"array?",maxItems:3},e(23,()=>t([1,2,3],{},v).invalid,!1),e(23.1,()=>t([1,2,3,4],{},v).invalid,!0),e(23.2,()=>t(null,{},v).invalid,!1),e(23.3,()=>t(!0,{},n(n({},v),{},{type:"boolean"})).invalid,!1),v={type:"array?",minItems:4},e(24,()=>t([1,2,3],{},v).invalid,!0),e(24.1,()=>t([1,2,3,4],{},v).invalid,!1),e(24.2,()=>t(null,{},v).invalid,!1),e(24.3,()=>t(!0,{},n(n({},v),{},{type:"boolean"})).invalid,!1),v={type:"string",same:"/first"},d={first:"a",second:"a"},e(25,()=>t("a",{},v,i=>"a").invalid,!1),e(25.1,()=>t("b",{},v,i=>"a").invalid,!0),v={same:"/first"},e(25.2,()=>t("a",{},v,i=>"a").invalid,!1)};exports.run=r;
},{"../src/core/schema":"PwL0"}],"l6QX":[function(require,module,exports) {
"use strict";var e=n(require("./utils")),o=n(require("./env")),r=n(require("./schema"));function t(e){if("function"!=typeof WeakMap)return null;var o=new WeakMap,r=new WeakMap;return(t=function(e){return e?r:o})(e)}function n(e,o){if(!o&&e&&e.__esModule)return e;if(null===e||"object"!=typeof e&&"function"!=typeof e)return{default:e};var r=t(o);if(r&&r.has(e))return r.get(e);var n={},l=Object.defineProperty&&Object.getOwnPropertyDescriptor;for(var c in e)if("default"!==c&&Object.prototype.hasOwnProperty.call(e,c)){var s=l?Object.getOwnPropertyDescriptor(e,c):null;s&&(s.get||s.set)?Object.defineProperty(n,c,s):n[c]=e[c]}return n.default=e,r&&r.set(e,n),n}const l=(e,o,r)=>{const t=o();t==r?console.log("- ASSERTION",e,"OK"):console.log("! ASSERTION",e,"NG",t,r)},c=(e,o)=>{const r=o();void 0===r?console.log("- ASSERTION",e,"OK"):console.log("! ASSERTION",e,"NG",r,"undefined")},s=(e,o,r)=>{let t=null;try{o();t="no error"}catch(n){if(n instanceof Error&&n.message.startsWith(r))return void console.log("- ASSERTION",e,"OK");t="matching failure: "+n.message}console.log("! ASSERTION",e,"NG",t)},u=(e,o)=>{console.log("TEST START: "+o),e.run(l,s,c),console.log("TEST DONE: "+o),console.log("")};u(e,"utils"),u(o,"env"),u(r,"schema");
},{"./utils":"FOZT","./env":"WCXc","./schema":"zpTb"}]},{},["l6QX"], null)
//# sourceMappingURL=/_index.js.map