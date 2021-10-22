parcelRequire=function(e,r,t,n){var i,o="function"==typeof parcelRequire&&parcelRequire,u="function"==typeof require&&require;function f(t,n){if(!r[t]){if(!e[t]){var i="function"==typeof parcelRequire&&parcelRequire;if(!n&&i)return i(t,!0);if(o)return o(t,!0);if(u&&"string"==typeof t)return u(t);var c=new Error("Cannot find module '"+t+"'");throw c.code="MODULE_NOT_FOUND",c}p.resolve=function(r){return e[t][1][r]||r},p.cache={};var l=r[t]=new f.Module(t);e[t][0].call(l.exports,p,l,l.exports,this)}return r[t].exports;function p(e){return f(p.resolve(e))}}f.isParcelRequire=!0,f.Module=function(e){this.id=e,this.bundle=f,this.exports={}},f.modules=e,f.cache=r,f.parent=o,f.register=function(r,t){e[r]=[function(e,r){r.exports=t},{}]};for(var c=0;c<t.length;c++)try{f(t[c])}catch(e){i||(i=e)}if(t.length){var l=f(t[t.length-1]);"object"==typeof exports&&"undefined"!=typeof module?module.exports=l:"function"==typeof define&&define.amd?define(function(){return l}):n&&(this[n]=l)}if(parcelRequire=f,i)throw i;return f}({"O3AG":[function(require,module,exports) {
"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.isJsonValue=exports.emptyArray=exports.emptyObject=exports.typeOf=exports.pathToArray=exports.normalizePathArray=exports.appendPath=exports.normalizePath=exports.isIntStr=void 0;const t=t=>{const e=+t;return e%1==0&&t===""+e};exports.isIntStr=t;const e=e=>{const r=e.split("/");for(let s=1;s<r.length;s++)t(r[s])&&(r[s]="*");return r.join("/")};exports.normalizePath=e;const r=(t,e)=>{if(""==e.charAt(0)||"/"==e.charAt(0))return e;if("0"===e)return t;const r=o(t);let s=e.split("/"),n=[],a=+s[0];return a>(n=r).length&&(a=n.length),n.splice(n.length-a,a),s.shift(),0==s.length&&0==n.length?"":"/"+n.concat(s).join("/")};exports.appendPath=r;const s=e=>{let r="";for(let s=0;s<e.length;s++)"number"==typeof e[s]||t(e[s])?r+="/*":r+="/"+e[s];return r};exports.normalizePathArray=s;const o=e=>{const r=e.split("/"),s=[];for(let o=1;o<r.length;o++)s.push(t(r[o])?+r[o]:r[o]);return s};exports.pathToArray=o;const n=t=>null===t?"null":Array.isArray(t)?"array":typeof t;exports.typeOf=n;const a={};exports.emptyObject=a;const p=[];exports.emptyArray=p;const l=t=>{switch(n(t)){case"null":case"number":case"boolean":case"string":case"object":case"array":return!0;default:return!1}};exports.isJsonValue=l;
},{}],"FOZT":[function(require,module,exports) {
"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.run=void 0;var e=r(require("../src/utils"));function t(){if("function"!=typeof WeakMap)return null;var e=new WeakMap;return t=function(){return e},e}function r(e){if(e&&e.__esModule)return e;if(null===e||"object"!=typeof e&&"function"!=typeof e)return{default:e};var r=t();if(r&&r.has(e))return r.get(e);var a={},n=Object.defineProperty&&Object.getOwnPropertyDescriptor;for(var p in e)if(Object.prototype.hasOwnProperty.call(e,p)){var o=n?Object.getOwnPropertyDescriptor(e,p):null;o&&(o.get||o.set)?Object.defineProperty(a,p,o):a[p]=e[p]}return a.default=e,r&&r.set(e,a),a}const a=(t,r,a)=>{t(1,()=>e.appendPath("/a/b","0/c/d"),"/a/b/c/d"),t(1.1,()=>e.appendPath("","0/c"),"/c"),t(1.2,()=>e.appendPath("/a/b","/x/y"),"/x/y"),t(1.3,()=>e.appendPath("/a/b/c","1/d/e"),"/a/b/d/e"),t(1.4,()=>e.appendPath("/a","3/z"),"/z"),t(1.5,()=>e.appendPath("/a/b","1"),"/a"),t(1.6,()=>e.appendPath("/a/b/c","3"),"")};exports.run=a;
},{"../src/utils":"O3AG"}],"lnUc":[function(require,module,exports) {
"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.isEnv=exports.doReturn=exports.setRet=exports.getExtra=exports.setExtra=exports.reduceDeep=exports.mapDeep=exports.validate=exports.copy=exports.move=exports.replace=exports.remove=exports.add=exports.setSlot=exports.getSlot=exports.extract=exports.test=exports.isSame=exports.makeEnv=void 0;var e=require("./utils"),t=require("ramda");function r(e,t){if(null==e)return{};var r,n,a=o(e,t);if(Object.getOwnPropertySymbols){var s=Object.getOwnPropertySymbols(e);for(n=0;n<s.length;n++)r=s[n],t.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(e,r)&&(a[r]=e[r])}return a}function o(e,t){if(null==e)return{};var r,o,n={},a=Object.keys(e);for(o=0;o<a.length;o++)r=a[o],t.indexOf(r)>=0||(n[r]=e[r]);return n}function n(e){var t=a(e,"string");return"symbol"==typeof t?t:String(t)}function a(e,t){if("object"!=typeof e||null===e)return e;var r=e[Symbol.toPrimitive];if(void 0!==r){var o=r.call(e,t||"default");if("object"!=typeof o)return o;throw new TypeError("@@toPrimitive must return a primitive value.")}return("string"===t?String:Number)(e)}function s(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);t&&(o=o.filter(function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable})),r.push.apply(r,o)}return r}function c(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?s(Object(r),!0).forEach(function(t){i(e,t,r[t])}):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):s(Object(r)).forEach(function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))})}return e}function i(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}const u=(e,r)=>!e.length||(0,t.hasPath)(e,r),l=e=>(0,t.init)((0,t.init)(e)),p=t=>{const r={"@value":t,invalid:!1,message:""};switch((0,e.typeOf)(t)){case"object":case"array":break;case"number":case"integer":r.input=""+t,r.touched=!1;break;case"boolean":r.input=t?"true":"false",r.touched=!1;break;case"null":r.input="",r.touched=!1;break;case"string":r.input=t,r.touched=!1}return r},f=t=>{const r=t=>{switch((0,e.typeOf)(t)){case"array":const o=[];for(let e=0;e<t.length;e++)o[e]=r(t[e]);return p(o);case"object":const n={};for(let e in t)n[e]=r(t[e]);return p(n);default:return p(t)}};return r(t)},d=t=>{const r=t["@value"];switch((0,e.typeOf)(r)){case"array":const t=[];for(let e=0;e<r.length;e++)t[e]=d(r[e]);return t;case"object":const o={};for(let e in r)o[e]=d(r[e]);return o;default:return r}},h=(e,t,r)=>{return{tree:f(e),validationNeeded:!0,schemaDb:t,validate:r,extra:{}}};exports.makeEnv=h;const v=(e,t)=>e.tree===t.tree&&e.extra===t.extra&&e.validationNeeded===t.validationNeeded;exports.isSame=v;const x=t=>{const r=t.split("/"),o=[];for(let n=1;n<r.length;n++)o.push("@value"),o.push((0,e.isIntStr)(r[n])?+r[n]:r[n]);return o},y=(e,t)=>u(x(e),t.tree);exports.test=y;const b=(e,r)=>{const o=x(e),n=(0,t.path)(o,r.tree);if(!n)throw new Error("extract/1: not found: "+e);return d(n)};exports.extract=b;const w=(e,r)=>{const o=x(e),n=(0,t.path)(o,r.tree);if(!n)throw new Error("getSlot/1: not found: "+e);return n};exports.getSlot=w;const m=(e,r,o)=>{const n=x(e);(0,t.path)(n,o.tree);if(!r)throw new Error("setSlot/1: not found: "+e);const a=(0,t.assocPath)(n,r,o.tree);return c(c({},o),{},{tree:a})};exports.setSlot=m;const g=(r,o,n)=>{const a=x(r),s=l(a),i=(0,t.last)(a),u=(0,t.path)(s,n.tree),d=(0,e.typeOf)(u["@value"]);if("object"!=d&&"array"!=d)throw new Error("add/1 neither an object nor an array: "+r);if("array"==d){const e="-"===i?u["@value"].length:i;if("number"!=typeof e||e%1!=0)throw new Error("add/2 invalid index: "+r);if(e<0||e>u["@value"].length)throw new Error("add/3 index out of range: "+r);const a=f(o),l=(0,t.insert)(e,a,u["@value"]),d=p(l),h=(0,t.assocPath)(s,d,n.tree);return c(c({},n),{},{tree:h,validationNeeded:!0})}{if("string"!=typeof i)throw new Error("add/4 invalid name: "+r);const e=f(o),a=c(c({},u["@value"]),{},{[i]:e}),l=p(a),d=(0,t.assocPath)(s,l,n.tree);return c(c({},n),{},{tree:d,validationNeeded:!0})}};exports.add=g;const O=(r,o)=>{const n=x(r),a=l(n),s=(0,t.last)(n),i=(0,t.path)(a,o.tree),u=(0,e.typeOf)(i["@value"]);if("object"!=u&&"array"!=u)throw new Error("remove/1 neither an object nor an array: "+r);if("array"==u){if("number"!=typeof s||s%1!=0)throw new Error("remove/2 invalid index: "+r);if(s<0||s>=i["@value"].length)throw new Error("remove/3 out of range: "+r);const e=(0,t.remove)(s,1,i["@value"]),n=p(e),u=(0,t.assocPath)(a,n,o.tree);return c(c({},o),{},{tree:u,validationNeeded:!0})}{if(!i["@value"].hasOwnProperty(s))throw new Error("remove/4: property not found: "+r);const e=(0,t.dissoc)(s,i["@value"]),n=p(e),u=(0,t.assocPath)(a,n,o.tree);return c(c({},o),{},{tree:u,validationNeeded:!0})}};exports.remove=O;const j=(r,o,n)=>{const a=x(r),s=l(a),i=(0,t.last)(a),u=(0,t.path)(s,n.tree),d=(0,e.typeOf)(u["@value"]);if("object"!=d&&"array"!=d)throw new Error("replace/1 neither an object nor an array: "+r);if("array"==d){if("number"!=typeof i||i%1!=0)throw new Error("replace/2 invalid index: "+r);if(i<0||i>=u["@value"].length)throw new Error("replace/3 out of range: "+r);const e=f(o),a=(0,t.update)(i,e,u["@value"]),l=p(a),d=(0,t.assocPath)(s,l,n.tree);return c(c({},n),{},{tree:d,validationNeeded:!0})}{if("string"!=typeof i)throw new Error("replace/4 invalid name: "+r);const e=f(o),a=c(c({},u["@value"]),{},{[i]:e}),l=p(a),d=(0,t.assocPath)(s,l,n.tree);return c(c({},n),{},{tree:d,validationNeeded:!0})}};exports.replace=j;const E=(e,t,r)=>{const o=b(e,r);return r=O(e,r),r=g(t,o,r)};exports.move=E;const P=(e,t,r)=>{const o=b(e,r);return r=g(t,o,r)};exports.copy=P;const S=(r,o)=>{const n=(t,r,a)=>{const s=t["@value"];switch((0,e.typeOf)(s)){case"array":const c=[];for(let e=0;e<s.length;e++)c[e]=n(s[e],r+"/*",a+"/"+e);return o.validate(c,t,o.schemaDb[r],a,o);case"object":const i={};for(let e in s)i[e]=n(s[e],r+"/"+e,a+"/"+e);return o.validate(i,t,o.schemaDb[r],a,o);default:return o.validate(s,t,o.schemaDb[r],a,o)}},a=x(r),s=(0,t.path)(a,o.tree);if(!s)throw new Error("validate/1: not found: "+r);const i=n(s,(0,e.normalizePath)(r),r),u=(0,t.assocPath)(a,i,o.tree);return c(c({},o),{},{tree:u,validationNeeded:!1})};exports.validate=S;const D=(r,o,n)=>{const a=(t,o)=>{const n=t["@value"];switch((0,e.typeOf)(n)){case"array":const s=[];for(let e=0;e<n.length;e++)s[e]=a(n[e],o+"/"+e);return c(c({},r(t,o)),{},{"@value":s});case"object":const i={};for(let e in n)i[e]=a(n[e],o+"/"+e);return c(c({},r(t,o)),{},{"@value":i});default:return c(c({},r(t,o)),{},{"@value":n})}},s=x(o),i=(0,t.path)(s,n.tree);if(!i)throw new Error("mapDeep/1: not found: "+o);const u=a(i,o),l=(0,t.assocPath)(s,u,n.tree);return c(c({},n),{},{tree:l})};exports.mapDeep=D;const N=(r,o,n,a)=>{const s=(t,o,n)=>{const a=o["@value"];switch((0,e.typeOf)(a)){case"array":for(let e=0;e<a.length;e++)t=s(t,a[e],n+"/"+e);return r(t,o,n);case"object":for(let e in a)t=s(t,a[e],n+"/"+e);return r(t,o,n);default:return r(t,o,n)}},c=x(n),i=(0,t.path)(c,a.tree);if(!i)throw new Error("reduceDeep/1: not found: "+n);return s(o,i,n)};exports.reduceDeep=N;const k=(e,t,o)=>{if(null===t){const t=o.extra,{[e]:a}=t,s=r(t,[e].map(n));return c(c({},o),{},{extra:s})}{const r=c(c({},o.extra),{},{[e]:t});return c(c({},o),{},{extra:r})}};exports.setExtra=k;const R=(e,t)=>t.extra[e]||null;exports.getExtra=R;const q=(e,t)=>{if(e)return c(c({},t),{},{ret:e});const{ret:o}=t;return r(t,["ret"])};exports.setRet=q;const I=e=>{if(!e.ret)throw new Error("doReturn/0: no ret");e.ret(e)};exports.doReturn=I;const _=e=>null!=e&&"object"==typeof e&&"tree"in e;exports.isEnv=_;
},{"./utils":"O3AG"}],"WCXc":[function(require,module,exports) {
"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.run=void 0;var e=r(require("../src/env"));function t(){if("function"!=typeof WeakMap)return null;var e=new WeakMap;return t=function(){return e},e}function r(e){if(e&&e.__esModule)return e;if(null===e||"object"!=typeof e&&"function"!=typeof e)return{default:e};var r=t();if(r&&r.has(e))return r.get(e);var a={},o=Object.defineProperty&&Object.getOwnPropertyDescriptor;for(var i in e)if(Object.prototype.hasOwnProperty.call(e,i)){var d=o?Object.getOwnPropertyDescriptor(e,i):null;d&&(d.get||d.set)?Object.defineProperty(a,i,d):a[i]=e[i]}return a.default=e,r&&r.set(e,a),a}function a(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);t&&(a=a.filter(function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable})),r.push.apply(r,a)}return r}function o(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?a(Object(r),!0).forEach(function(t){i(e,t,r[t])}):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):a(Object(r)).forEach(function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))})}return e}function i(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}const d=(e,t)=>({"@value":e}),n=(t,r)=>{let a=e.makeEnv({name:"Bob",age:24,buddies:["Mam","Dad"]},{},d);t(1,()=>e.extract("/name",a),"Bob"),t(1.1,()=>e.test("/name",a),!0),t(1.2,()=>e.test("/foo",a),!1),a=e.add("/email","info@example.com",a),t(2,()=>e.extract("/email",a),"info@example.com"),r(2.1,()=>e.extract("/foo",a),"extract/"),t(3,()=>e.extract("/buddies/1",a),"Dad"),a=e.add("/buddies/1","Pochi",a),t(4,()=>e.extract("/buddies/1",a),"Pochi"),r(4.1,()=>e.extract("/buddies/5",a),"extract/"),a=e.add("/buddies/-","Komino",a),t(5,()=>e.extract("/buddies/3",a),"Komino"),a=e.remove("/buddies/3",a),t(6,()=>e.extract("/buddies",a).join(","),"Mam,Pochi,Dad"),r(6.1,()=>e.extract("/buddies/3",a),"extract/"),a=e.remove("/email",a),r(7,()=>e.extract("/email",a),"extract/"),r(7.1,()=>e.remove("/email",a),"remove/"),t(8,()=>{let t=e.getSlot("/name",a);return t=o(o({},t),{},{invalid:!0}),a=e.setSlot("/name",t,a),(t=e.getSlot("/name",a)).invalid},!0),a=e.replace("/age",30,a),t(9,()=>e.extract("/age",a),30),a=e.add("/id","TS1101",a),a=e.move("/id","/employeeId",a),t(10,()=>e.extract("/employeeId",a),"TS1101"),r(10.1,()=>e.extract("/id",a),"extract/"),a=e.copy("/employeeId","/id",a),t(11,()=>e.extract("/employeeId",a),"TS1101"),t(11.1,()=>e.extract("/id",a),"TS1101"),t(11.9,()=>e.extract("/buddies",a).join(","),"Mam,Pochi,Dad"),a=e.move("/buddies/2","/buddies/0",a),t(12,()=>e.extract("/buddies",a).join(","),"Dad,Mam,Pochi"),a=e.copy("/buddies/0","/buddies/2",a),t(13,()=>e.extract("/buddies",a),"Dad,Mam,Dad,Pochi"),a=e.mapDeep((e,t)=>o(o({},e),{},{message:"yeah"}),"/buddies",a),t(14,()=>e.getSlot("/buddies",a).message,"yeah"),t(14.1,()=>e.getSlot("/buddies/0",a).message,"yeah"),t(14.2,()=>e.getSlot("/name",a).message||"",""),t(15,()=>e.reduceDeep((e,t,r)=>"/buddies"==r?e:e+`[${t["@value"]}]`,"","/buddies",a),"[Dad][Mam][Dad][Pochi]")};exports.run=n;
},{"../src/env":"lnUc"}],"v6Cq":[function(require,module,exports) {
"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.coerce=exports.validate=exports.defaultRules=exports.buildDb=exports.defaultMessages=void 0;var e=require("./utils"),r=n(require("./env"));function t(){if("function"!=typeof WeakMap)return null;var e=new WeakMap;return t=function(){return e},e}function n(e){if(e&&e.__esModule)return e;if(null===e||"object"!=typeof e&&"function"!=typeof e)return{default:e};var r=t();if(r&&r.has(e))return r.get(e);var n={},a=Object.defineProperty&&Object.getOwnPropertyDescriptor;for(var o in e)if(Object.prototype.hasOwnProperty.call(e,o)){var u=a?Object.getOwnPropertyDescriptor(e,o):null;u&&(u.get||u.set)?Object.defineProperty(n,o,u):n[o]=e[o]}return n.default=e,r&&r.set(e,n),n}function a(e,r){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);r&&(n=n.filter(function(r){return Object.getOwnPropertyDescriptor(e,r).enumerable})),t.push.apply(t,n)}return t}function o(e){for(var r=1;r<arguments.length;r++){var t=null!=arguments[r]?arguments[r]:{};r%2?a(Object(t),!0).forEach(function(r){u(e,r,t[r])}):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):a(Object(t)).forEach(function(r){Object.defineProperty(e,r,Object.getOwnPropertyDescriptor(t,r))})}return e}function u(e,r,t){return r in e?Object.defineProperty(e,r,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[r]=t,e}const s=e=>{if(!e)return!0;const r=e.charAt(e.length-1);return"null"==e||"?"==r},i={"schema.ruleError.enum":"Invalid input","schema.ruleError.const":"Invalid input","schema.ruleError.required":"Missing properties","schema.ruleError.requiredAnyOf":"Unknown instance","schema.ruleError.same":"Not a same value","schema.ruleError.multipleOf":"Please enter a multiple of {{0}}","schema.ruleError.maximum":"Please enter {{0}} or less","schema.ruleError.exclusiveMaximum":"Please enter a number less than {{0}}","schema.ruleError.minimum":"Please enter {{0}} or more","schema.ruleError.exclusiveMinimum":"Please enter a number more than {{0}}","schema.ruleError.maxLength":"Please enter no more than {{0}} characters","schema.ruleError.minLength0":"Please enter","schema.ruleError.minLength":"Please enter at least {{0}} characters","schema.ruleError.pattern":"Invalid format","schema.ruleError.maxItems":"Please make it less than or equal to {{0}}","schema.ruleError.minItems":"Please make it more than or equal to {{0}}","schema.valueError.generic":"Invalid value","schema.valueError.null":"Invalid input","schema.valueError.number":"Please input a number","schema.valueError.number?":"Please input a number","schema.valueError.integer":"Please input an integer","schema.valueError.integer?":"Please input an integer","schema.valueError.boolean":"Please input true or false","schema.valueError.boolean?":"Please input true or false","schema.valueError.string":"Invalid input","schema.valueError.array":"Invalid input","schema.valueError.array?":"Invalid input","schema.valueError.object":"Invalid input","schema.valueError.object?":"Invalid input"};exports.defaultMessages=i;const l=e=>{const r={},t=(e,n)=>{switch(r[n]=e,e.type){case"object":case"object?":for(let r in e.properties)t(e.properties[r],n+"/"+r);break;case"array":case"array?":t(e.items,n+"/*")}};return t(e,""),r};exports.buildDb=l;const c=(e,r,t=null)=>{return(e[r]||r+": {{0}}").replace("{{0}}",""+t)},m=(e,r)=>{if(!r)return!0;if(null===e)return s(r);switch(r){case"null":return!1;case"number":case"number?":return"number"==typeof e;case"integer":case"integer?":return"number"==typeof e&&e%1==0;case"boolean":case"boolean?":return"boolean"==typeof e;case"string":return"string"==typeof e;case"object":case"object?":return"object"==typeof e&&null!==e;case"array":case"array?":return Array.isArray(e);default:throw new Error("unknown type: "+r)}},p={enum:(e,r)=>{if(!Array.isArray(e))throw new Error("invalid parameter");for(let t=0;t<e.length;t++)if(e[t]===r)return!0;return"schema.ruleError.enum"},const:(e,r)=>e===r||"schema.ruleError.const",required:(e,r)=>{if(!Array.isArray(e))throw new Error("invalid parameter");if("object"!=typeof r)return!0;for(let t=0;t<e.length;t++)if(!r.hasOwnProperty(e[t]))return"schema.ruleError.required";return!0},requiredAnyOf:(e,r)=>{if(!Array.isArray(e))throw new Error("invalid parameter");if("object"!=typeof r)return!0;const t=e=>r.hasOwnProperty(e);for(let n of e)if(n.every(t))return!0;return"schema.ruleError.requiredAnyOf"},same:(t,n,a,o)=>{if("string"!=typeof t)throw new Error("invalid parameter");const u=(0,e.appendPath)(a,t);return r.extract(u,o)===n||"schema.ruleError.same"},multipleOf:(e,r)=>{if("number"!=typeof e)throw new Error("invalid parameter");return"number"!=typeof r||(r%e==0||"schema.ruleError.multipleOf")},maximum:(e,r)=>"number"!=typeof r||(e>=r||"schema.ruleError.maximum"),exclusiveMaximum:(e,r)=>"number"!=typeof r||(e>r||"schema.ruleError.exclusiveMaximum"),minimum:(e,r)=>"number"!=typeof r||(e<=r||"schema.ruleError.minimum"),exclusiveMinimum:(e,r)=>"number"!=typeof r||(e<r||"schema.ruleError.exclusiveMinimum"),maxLength:(e,r)=>"string"!=typeof r||(r.length<=e||"schema.ruleError.maxLength"),minLength:(e,r)=>"string"!=typeof r||(r.length>=e||(1==e?"schema.ruleError.minLength0":"schema.ruleError.minLength")),pattern:(e,r)=>{if("string"!=typeof e)throw new Error("invalid parameter");return"string"!=typeof r||(!!new RegExp(e).test(r)||"schema.ruleError.pattern")},maxItems:(e,r)=>{if("number"!=typeof e)throw new Error("invalid parameter");return!Array.isArray(r)||(r.length<=e||"schema.ruleError.maxItems")},minItems:(e,r)=>{if("number"!=typeof e)throw new Error("invalid parameter");return!Array.isArray(r)||(r.length>=e||"schema.ruleError.minItems")}};exports.defaultRules=p;const h=(r,t)=>(n,a,u,s,i)=>{if(!(0,e.isJsonValue)(n)){const e=u&&u.type?"schema.valueError."+u.type:"schema.valueError.generic";return o(o({},a),{},{"@value":n,invalid:!0,message:c(t,e,null)})}if(u&&u.type&&!m(n,u.type))return o(o({},a),{},{"@value":n,invalid:!0,message:c(t,"schema.typeError."+u.type,null)});for(let e in u){const l=r[e];if(!l)continue;const m=l(u[e],n,s,i);if(!0!==m){const r=c(t,m,u[e]);return o(o({},a),{},{"@value":n,invalid:!0,message:r})}}return o(o({},a),{},{"@value":n,invalid:!1,message:""})};exports.validate=h;const f=(e,r)=>(e,r,t)=>{if(!t)throw new Error("coerce/0: no schema");if(!t.type)throw new Error("coerce/1: type not specified");if(-1==["null","boolean","boolean?","integer","integer?","number","number?","string"].indexOf(t.type))throw new Error("coerce/2: not a coercion enabled type: "+t.type);switch(t.type){case"null":break;case"number":case"number?":const n=+e;if(""+n===e)return{"@value":n,input:e,touched:r.touched};break;case"integer":case"integer?":const a=+e;if(""+a===e&&a%1==0)return{"@value":a,input:e,touched:r.touched};break;case"boolean":case"boolean?":if("true"===e||"false"===e)return{"@value":"true"===e,input:e,touched:r.touched};break;case"string":return{"@value":e,input:e,touched:r.touched}}return""==e&&s(t.type)?{"@value":null,input:e,touched:r.touched}:{input:e,touched:r.touched}};exports.coerce=f;
},{"./utils":"O3AG","./env":"lnUc"}],"zpTb":[function(require,module,exports) {
"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.run=void 0;var i=l(require("../src/schema"));function e(){if("function"!=typeof WeakMap)return null;var i=new WeakMap;return e=function(){return i},i}function l(i){if(i&&i.__esModule)return i;if(null===i||"object"!=typeof i&&"function"!=typeof i)return{default:i};var l=e();if(l&&l.has(i))return l.get(i);var n={},a=Object.defineProperty&&Object.getOwnPropertyDescriptor;for(var t in i)if(Object.prototype.hasOwnProperty.call(i,t)){var r=a?Object.getOwnPropertyDescriptor(i,t):null;r&&(r.get||r.set)?Object.defineProperty(n,t,r):n[t]=i[t]}return n.default=i,l&&l.set(i,n),n}function n(i,e){var l=Object.keys(i);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(i);e&&(n=n.filter(function(e){return Object.getOwnPropertyDescriptor(i,e).enumerable})),l.push.apply(l,n)}return l}function a(i){for(var e=1;e<arguments.length;e++){var l=null!=arguments[e]?arguments[e]:{};e%2?n(Object(l),!0).forEach(function(e){t(i,e,l[e])}):Object.getOwnPropertyDescriptors?Object.defineProperties(i,Object.getOwnPropertyDescriptors(l)):n(Object(l)).forEach(function(e){Object.defineProperty(i,e,Object.getOwnPropertyDescriptor(l,e))})}return i}function t(i,e,l){return e in i?Object.defineProperty(i,e,{value:l,enumerable:!0,configurable:!0,writable:!0}):i[e]=l,i}const r=(e,l,n)=>{const t=i.validate(i.defaultRules,{}),r=i.coerce(i.defaultRules,{});let v={type:"null"};e(1,()=>t(null,{},v).invalid,!1),e(1.1,()=>t(1,{},v).invalid,!0),e(1.2,()=>t("abc",{},v).invalid,!0),e(1.3,()=>r("",{},v)["@value"],null),n(1.4,()=>r("abc",{},v)["@value"]),e(1.5,()=>t(void 0,{},v).invalid,!0),v=null,e(2,()=>t(null,{},v).invalid,!1),e(2.1,()=>t(10,{},v).invalid,!1),e(2.2,()=>t([],{},v).invalid,!1),l(2.3,()=>r("",{},v),"coerce/"),l(2.4,()=>r("aaa",{},v),"coerce/"),e(2.5,()=>t(void 0,{},v).invalid,!0),v={type:"boolean"},e(3,()=>t(null,{},v).invalid,!0),e(3.1,()=>t(1,{},v).invalid,!0),e(3.2,()=>t(!0,{},v).invalid,!1),n(3.3,()=>r("",{},v)["@value"]),e(3.4,()=>r("false",{},v)["@value"],!1),n(3.5,()=>r("abc",{},v)["@value"]),e(3.6,()=>r("true",{},v)["@value"],!0),v={type:"boolean?"},e(4,()=>t(null,{},v).invalid,!1),e(4.1,()=>t(1,{},v).invalid,!0),e(4.2,()=>t(!0,{},v).invalid,!1),e(4.3,()=>r("",{},v)["@value"],null),e(4.4,()=>r("false",{},v)["@value"],!1),n(4.5,()=>r("abc",{},v)["@value"]),v={type:"integer"},e(5,()=>t(null,{},v).invalid,!0),e(5.1,()=>t(1,{},v).invalid,!1),e(5.2,()=>t(!0,{},v).invalid,!0),n(5.3,()=>r("",{},v)["@value"]),e(5.4,()=>r("10",{},v)["@value"],10),n(5.5,()=>r("abc",{},v)["@value"]),e(5.6,()=>t(132,{},v)["@value"],132),v={type:"integer?"},e(6,()=>t(null,{},v).invalid,!1),e(6.1,()=>t(1,{},v).invalid,!1),e(6.2,()=>t(!0,{},v).invalid,!0),e(6.3,()=>r("",{},v)["@value"],null),e(6.4,()=>r("10",{},v)["@value"],10),n(6.5,()=>r("10.3",{},v)["@value"]),e(6.6,()=>r("132",{},v)["@value"],132),v={type:"number"},e(7,()=>t(null,{},v).invalid,!0),e(7.1,()=>t(1.2,{},v).invalid,!1),e(7.2,()=>t(!0,{},v).invalid,!0),n(7.3,()=>r("",{},v)["@value"]),e(7.4,()=>r("10.3",{},v)["@value"],10.3),n(7.5,()=>r("abc",{},v)["@value"]),v={type:"number?"},e(8,()=>t(null,{},v).invalid,!1),e(8.1,()=>t(1.2,{},v).invalid,!1),e(8.2,()=>t(!0,{},v).invalid,!0),e(8.3,()=>r("",{},v)["@value"],null),e(8.4,()=>r("10.3",{},v)["@value"],10.3),n(8.5,()=>r("abc",{},v)["@value"]),v={type:"string"},e(9,()=>t(null,{},v).invalid,!0),e(9.1,()=>t("",{},v).invalid,!1),e(9.2,()=>t(!0,{},v).invalid,!0),e(9.3,()=>t("abc",{},v).invalid,!1),e(9.4,()=>r("",{},v)["@value"],""),e(9.5,()=>r("abc",{},v)["@value"],"abc"),v={type:"object"},e(10,()=>t(null,{},v).invalid,!0),e(10.1,()=>t("",{},v).invalid,!0),e(10.2,()=>t({},v).invalid,!1),l(10.3,()=>r("",{},v),"coerce/"),v={type:"object?"},e(11,()=>t(null,{},v).invalid,!1),e(11.1,()=>t("",{},v).invalid,!0),e(11.2,()=>t({},{},v).invalid,!1),l(11.3,()=>r("",{},v),"coerce/"),v={type:"array"},e(12,()=>t(null,{},v).invalid,!0),e(12.1,()=>t("",{},v).invalid,!0),e(12.2,()=>t([],{},v).invalid,!1),l(12.3,()=>r("",{},v),"coerce/"),v={type:"array?"},e(13,()=>t(null,{},v).invalid,!1),e(13.1,()=>t("",{},v).invalid,!0),e(13.2,()=>t([],{},v).invalid,!1),l(13.3,()=>r("",{},v),"coerce/"),v={type:"integer?",enum:[1]},e(14,()=>t(null,{},v).invalid,!0),e(14.1,()=>t(1,{},v).invalid,!1),e(14.2,()=>t(3,{},v).invalid,!0),v={type:"number",const:3.2},e(15,()=>t(3.2,{},v).invalid,!1),e(15.1,()=>t(3,{},v).invalid,!0),v={type:"object",required:["foo","bar"]},e(16,()=>t({foo:1,bar:1},{},v).invalid,!1),e(16.1,()=>t({foo:1},{},v).invalid,!0),e(16.2,()=>t({foo:1,bar:1,baz:1},{},v).invalid,!1),e(16.3,()=>t(1,{},a(a({},v),{},{type:"integer"})).invalid,!1),v={type:"object",requiredAnyOf:[["tag","op","lhs","rhs"],["tag","f","arg"],["tag","val","line"],["tag","var"]]};let d={tag:"infix",op:"*",lhs:{tag:"var",var:"n"},rhs:{tag:"app",f:"fact",arg:{tag:"infix",op:"-",lhs:{tag:"var",var:"n"},rhs:{tag:"lit",val:1}}}};e(17,()=>t(d,{},v).invalid,!1),e(17.1,()=>t(d.lhs,{},v).invalid,!1),e(17.2,()=>t(d.rhs.arg.rhs,{},v).invalid,!0),e(17.3,()=>t(1,{},a(a({},v),{},{type:"integer"})).invalid,!1),v={type:"number?",multipleOf:1.2},e(18,()=>t(-2.4,{},v).invalid,!1),e(18.1,()=>t(1.5,{},v).invalid,!0),e(18.2,()=>t(null,{},v).invalid,!1),e(18.3,()=>t(!0,{},a(a({},v),{},{type:"boolean"})).invalid,!1),v={type:"integer?",maximum:10},e(19,()=>t(10,{},v).invalid,!1),e(19.1,()=>t(11,{},v).invalid,!0),e(19.2,()=>t(null,{},v).invalid,!1),e(19.3,()=>t(!0,{},a(a({},v),{},{type:"boolean"})).invalid,!1),v={type:"integer?",exclusiveMaximum:10},e(20,()=>t(9,{},v).invalid,!1),e(20.1,()=>t(10,{},v).invalid,!0),e(20.2,()=>t(null,{},v).invalid,!1),e(20.3,()=>t(!0,{},a(a({},v),{},{type:"boolean"})).invalid,!1),v={type:"integer?",minimum:10},e(21,()=>t(10,{},v).invalid,!1),e(21.1,()=>t(9,{},v).invalid,!0),e(21.2,()=>t(null,{},v).invalid,!1),e(21.3,()=>t(!0,{},a(a({},v),{},{type:"boolean"})).invalid,!1),v={type:"integer?",exclusiveMinimum:10},e(20,()=>t(10,{},v).invalid,!0),e(20.1,()=>t(11,{},v).invalid,!1),e(20.2,()=>t(null,{},v).invalid,!1),e(20.3,()=>t(!0,{},a(a({},v),{},{type:"boolean"})).invalid,!1),v={type:"string",maxLength:3},e(21,()=>t("abc",{},v).invalid,!1),e(21.1,()=>t("abcd",{},v).invalid,!0),e(21.2,()=>t("",{},v).invalid,!1),e(21.3,()=>t(!0,{},a(a({},v),{},{type:"boolean"})).invalid,!1),v={type:"string",minLength:3},e(21,()=>t("abd",{},v).invalid,!1),e(21.1,()=>t("ab",{},v).invalid,!0),e(21.2,()=>t("",{},v).invalid,!0),e(21.3,()=>t(!0,{},a(a({},v),{},{type:"boolean"})).invalid,!1),v={type:"string",pattern:"^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:.[a-zA-Z0-9-]+)*$"},e(22,()=>t("info@example.com",{},v).invalid,!1),e(22.1,()=>t("192.168.0.1",{},v).invalid,!0),e(22.2,()=>t(!0,{},a(a({},v),{},{type:"boolean"})).invalid,!1),v={type:"array?",maxItems:3},e(23,()=>t([1,2,3],{},v).invalid,!1),e(23.1,()=>t([1,2,3,4],{},v).invalid,!0),e(23.2,()=>t(null,{},v).invalid,!1),e(23.3,()=>t(!0,{},a(a({},v),{},{type:"boolean"})).invalid,!1),v={type:"array?",minItems:4},e(24,()=>t([1,2,3],{},v).invalid,!0),e(24.1,()=>t([1,2,3,4],{},v).invalid,!1),e(24.2,()=>t(null,{},v).invalid,!1),e(24.3,()=>t(!0,{},a(a({},v),{},{type:"boolean"})).invalid,!1)};exports.run=r;
},{"../src/schema":"v6Cq"}],"l6QX":[function(require,module,exports) {
"use strict";var e=n(require("./utils")),o=n(require("./env")),r=n(require("./schema"));function t(){if("function"!=typeof WeakMap)return null;var e=new WeakMap;return t=function(){return e},e}function n(e){if(e&&e.__esModule)return e;if(null===e||"object"!=typeof e&&"function"!=typeof e)return{default:e};var o=t();if(o&&o.has(e))return o.get(e);var r={},n=Object.defineProperty&&Object.getOwnPropertyDescriptor;for(var l in e)if(Object.prototype.hasOwnProperty.call(e,l)){var c=n?Object.getOwnPropertyDescriptor(e,l):null;c&&(c.get||c.set)?Object.defineProperty(r,l,c):r[l]=e[l]}return r.default=e,o&&o.set(e,r),r}const l=(e,o,r)=>{const t=o();t==r?console.log("- ASSERTION",e,"OK"):console.log("! ASSERTION",e,"NG",t,r)},c=(e,o)=>{const r=o();void 0===r?console.log("- ASSERTION",e,"OK"):console.log("! ASSERTION",e,"NG",r,"undefined")},s=(e,o,r)=>{let t=null;try{o();t="no error"}catch(n){if(n instanceof Error&&n.message.startsWith(r))return void console.log("- ASSERTION",e,"OK");t="matching failure: "+n.message}console.log("! ASSERTION",e,"NG",t)},i=(e,o)=>{console.log("TEST START: "+o),e.run(l,s,c),console.log("TEST DONE: "+o),console.log("")};i(e,"utils"),i(o,"env"),i(r,"schema");
},{"./utils":"FOZT","./env":"WCXc","./schema":"zpTb"}]},{},["l6QX"], null)
//# sourceMappingURL=/_index.js.map