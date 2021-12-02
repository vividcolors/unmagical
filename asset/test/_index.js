parcelRequire=function(e,r,t,n){var i,o="function"==typeof parcelRequire&&parcelRequire,u="function"==typeof require&&require;function f(t,n){if(!r[t]){if(!e[t]){var i="function"==typeof parcelRequire&&parcelRequire;if(!n&&i)return i(t,!0);if(o)return o(t,!0);if(u&&"string"==typeof t)return u(t);var c=new Error("Cannot find module '"+t+"'");throw c.code="MODULE_NOT_FOUND",c}p.resolve=function(r){return e[t][1][r]||r},p.cache={};var l=r[t]=new f.Module(t);e[t][0].call(l.exports,p,l,l.exports,this)}return r[t].exports;function p(e){return f(p.resolve(e))}}f.isParcelRequire=!0,f.Module=function(e){this.id=e,this.bundle=f,this.exports={}},f.modules=e,f.cache=r,f.parent=o,f.register=function(r,t){e[r]=[function(e,r){r.exports=t},{}]};for(var c=0;c<t.length;c++)try{f(t[c])}catch(e){i||(i=e)}if(t.length){var l=f(t[t.length-1]);"object"==typeof exports&&"undefined"!=typeof module?module.exports=l:"function"==typeof define&&define.amd?define(function(){return l}):n&&(this[n]=l)}if(parcelRequire=f,i)throw i;return f}({"e4yr":[function(require,module,exports) {
"use strict";var r=this&&this.__importDefault||function(r){return r&&r.__esModule?r:{default:r}};Object.defineProperty(exports,"__esModule",{value:!0}),exports.showText=exports.normalizeQuery=exports.commonPath=exports.isJsonValue=exports.typeOf=exports.pathToArray=exports.normalizePathArray=exports.appendPath=exports.normalizePath=exports.isIntStr=void 0;var t=r(require("string-template"));exports.showText=t.default;var e=function(r){var t=+r;return t%1==0&&r===""+t};exports.isIntStr=e;var n=function(r){for(var t=r.split("/"),e=1;e<t.length;e++)(0,exports.isIntStr)(t[e])&&(t[e]="*");return t.join("/")};exports.normalizePath=n;var a=function(r,t){if(""==t.charAt(0)||"/"==t.charAt(0))return t;if("0"===t)return r;var e=(0,exports.pathToArray)(r),n=t.split("/"),a=[],o=+n[0];return o>(a=e).length&&(o=a.length),a.splice(a.length-o,o),n.shift(),0==n.length&&0==a.length?"":"/"+a.concat(n).join("/")};exports.appendPath=a;var o=function(r){for(var t="",e=0;e<r.length;e++)"number"==typeof r[e]||(0,exports.isIntStr)(""+r[e])?t+="/*":t+="/"+r[e];return t};exports.normalizePathArray=o;var s=function(r){for(var t=r.split("/"),e=[],n=1;n<t.length;n++)e.push((0,exports.isIntStr)(t[n])?+t[n]:t[n]);return e};exports.pathToArray=s;var p=function(r){return null===r?"null":Array.isArray(r)?"array":typeof r};exports.typeOf=p;var i=function(r){switch((0,exports.typeOf)(r)){case"null":case"number":case"boolean":case"string":case"object":case"array":return!0;default:return!1}};exports.isJsonValue=i;var u=function(r,t){for(var e=r.split("/"),n=t.split("/"),a=[],o=0;o<e.length&&!(n.length<=o)&&e[o]==n[o];o++)a.push(e[o]);return a.join("/")};exports.commonPath=u;var l=function(r,t){var e={};for(var n in r)switch((0,exports.typeOf)(n)){case"null":t||(e[n]="");break;case"boolean":e[n]=r[n]?"true":"false";break;case"number":e[n]=""+r[n];break;case"string":if(t&&""===r[n])break;e[n]=r[n]}return e};exports.normalizeQuery=l;
},{}],"FOZT":[function(require,module,exports) {
"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.run=void 0;var e=a(require("../src/core/utils"));function t(e){if("function"!=typeof WeakMap)return null;var a=new WeakMap,r=new WeakMap;return(t=function(e){return e?r:a})(e)}function a(e,a){if(!a&&e&&e.__esModule)return e;if(null===e||"object"!=typeof e&&"function"!=typeof e)return{default:e};var r=t(a);if(r&&r.has(e))return r.get(e);var n={},o=Object.defineProperty&&Object.getOwnPropertyDescriptor;for(var c in e)if("default"!==c&&Object.prototype.hasOwnProperty.call(e,c)){var p=o?Object.getOwnPropertyDescriptor(e,c):null;p&&(p.get||p.set)?Object.defineProperty(n,c,p):n[c]=e[c]}return n.default=e,r&&r.set(e,n),n}const r=(t,a,r)=>{t(1,()=>e.appendPath("/a/b","0/c/d"),"/a/b/c/d"),t(1.1,()=>e.appendPath("","0/c"),"/c"),t(1.2,()=>e.appendPath("/a/b","/x/y"),"/x/y"),t(1.3,()=>e.appendPath("/a/b/c","1/d/e"),"/a/b/d/e"),t(1.4,()=>e.appendPath("/a","3/z"),"/z"),t(1.5,()=>e.appendPath("/a/b","1"),"/a"),t(1.6,()=>e.appendPath("/a/b/c","3"),""),t(2,()=>e.commonPath("/a/b/c","/a/b/c"),"/a/b/c"),t(2.1,()=>e.commonPath("/a/b/c","/a/b/d"),"/a/b"),t(2.2,()=>e.commonPath("/a/b/c","/a"),"/a"),t(2.3,()=>e.commonPath("/a/b/c",""),"")};exports.run=r;
},{"../src/core/utils":"e4yr"}],"GOAg":[function(require,module,exports) {
"use strict";var e=this&&this.__assign||function(){return(e=Object.assign||function(e){for(var r,t=1,a=arguments.length;t<a;t++)for(var n in r=arguments[t])Object.prototype.hasOwnProperty.call(r,n)&&(e[n]=r[n]);return e}).apply(this,arguments)},r=this&&this.__rest||function(e,r){var t={};for(var a in e)Object.prototype.hasOwnProperty.call(e,a)&&r.indexOf(a)<0&&(t[a]=e[a]);if(null!=e&&"function"==typeof Object.getOwnPropertySymbols){var n=0;for(a=Object.getOwnPropertySymbols(e);n<a.length;n++)r.indexOf(a[n])<0&&Object.prototype.propertyIsEnumerable.call(e,a[n])&&(t[a[n]]=e[a[n]])}return t},t=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};Object.defineProperty(exports,"__esModule",{value:!0}),exports.isEnv=exports.doReturn=exports.setPortal=exports.getExtra=exports.setExtra=exports.duplicate=exports.reduceDeep=exports.mapDeep=exports.validate=exports.copy=exports.move=exports.replace=exports.remove=exports.add=exports.setSlot=exports.getSlot=exports.extract=exports.test=exports.endUpdateTracking=exports.beginUpdateTracking=exports.isSame=exports.makeEnv=void 0;var a=require("./utils"),n=t(require("ramda/src/hasPath")),o=t(require("ramda/src/init")),u=t(require("ramda/src/path")),i=t(require("ramda/src/assocPath")),p=t(require("ramda/src/insert")),l=t(require("ramda/src/last")),d=t(require("ramda/src/dissoc")),f=t(require("ramda/src/remove")),c=t(require("ramda/src/update")),s=function(e,r){return!e.length||(0,n.default)(e,r)},v=function(e){return(0,o.default)((0,o.default)(e))},h=function(e){var r={value:e,invalid:!1,error:null};switch((0,a.typeOf)(e)){case"object":case"array":break;case"number":case"integer":r.input=""+e,r.touched=!1;break;case"boolean":r.input=e?"true":"false",r.touched=!1;break;case"null":r.input="",r.touched=!1;break;case"string":r.input=e,r.touched=!1}return r},x=function(e){var r=function(e){switch((0,a.typeOf)(e)){case"array":for(var t=[],n=0;n<e.length;n++)t[n]=r(e[n]);return h(t);case"object":var o={};for(var u in e)o[u]=r(e[u]);return h(o);default:return h(e)}};return r(e)},w=function(e){var r=e.value;switch((0,a.typeOf)(r)){case"array":for(var t=[],n=0;n<r.length;n++)t[n]=w(r[n]);return t;case"object":var o={};for(var u in r)o[u]=w(r[u]);return o;default:return r}},y=function(e,r,t,a){return{tree:x(e),trackUpdate:a,updatePoint:a?[]:null,schemaDb:r,validate:t,extra:{}}};exports.makeEnv=y;var P=function(e,r){return e.tree===r.tree&&e.extra===r.extra};exports.isSame=P;var m=function(e){for(var r=e.split("/"),t=[],n=1;n<r.length;n++)t.push("value"),t.push((0,a.isIntStr)(r[n])?+r[n]:r[n]);return t},g=function(e){for(var r="",t=0;t<e.length;t+=2)r+="/"+e[t+1];return r},b=function(e,r){if(null===e)return r;if(null===r)return e;for(var t=[],a=0;a<e.length&&!(a>=r.length)&&e[a+1]===r[a+1];a+=2)t.push(e[a]),t.push(e[a+1]);return t},E=function(r){return e(e({},r),{trackUpdate:!0})};exports.beginUpdateTracking=E;var O=function(r){var t=r.updatePoint?g(r.updatePoint):null;return console.log("update occurred at "+JSON.stringify(t)),[t,e(e({},r),{trackUpdate:!1,updatePoint:null})]};exports.endUpdateTracking=O;var k=function(e,r){return s(m(e),r.tree)};exports.test=k;var j=function(e,r){var t=m(e),a=(0,u.default)(t,r.tree);if(!a)throw new Error("extract/1: not found: "+e);return w(a)};exports.extract=j;var U=function(e,r){var t=m(e),a=(0,u.default)(t,r.tree);if(!a)throw new Error("getSlot/1: not found: "+e);return a};exports.getSlot=U;var S=function(r,t,n){var o=m(r),p=(0,u.default)(o,n.tree);if(!p)throw new Error("setSlot/1: not found: "+r);switch((0,a.typeOf)(p.value)){case"null":case"boolean":case"number":case"string":case"undefined":break;default:throw new Error("setSlot/2: not a scalar: "+r)}var l=(0,i.default)(o,t,n.tree),d=n.trackUpdate?b(n.updatePoint,o):n.updatePoint;return e(e({},n),{tree:l,updatePoint:d})};exports.setSlot=S;var D=function(r,t,n){var o,d=m(r),f=v(d),c=(0,l.default)(d),s=(0,u.default)(f,n.tree),w=(0,a.typeOf)(s.value);if("object"!=w&&"array"!=w)throw new Error("add/1 neither an object nor an array: "+r);if("array"==w){var y="-"===c?s.value.length:c;if("number"!=typeof y||y%1!=0)throw new Error("add/2 invalid index: "+r);if(y<0||y>s.value.length)throw new Error("add/3 index out of range: "+r);var P=x(t),g=(0,p.default)(y,P,s.value),E=h(g),O=(0,i.default)(f,E,n.tree),k=n.trackUpdate?b(n.updatePoint,f):n.updatePoint;return e(e({},n),{tree:O,updatePoint:k})}if("string"!=typeof c)throw new Error("add/4 invalid name: "+r);P=x(t);var j=e(e({},s.value),((o={})[c]=P,o));E=h(j),O=(0,i.default)(f,E,n.tree),k=n.trackUpdate?b(n.updatePoint,c in s.value?d:f):n.updatePoint;return e(e({},n),{tree:O,updatePoint:k})};exports.add=D;var q=function(r,t){var n=m(r),o=v(n),p=(0,l.default)(n),c=(0,u.default)(o,t.tree),s=(0,a.typeOf)(c.value);if("object"!=s&&"array"!=s)throw new Error("remove/1 neither an object nor an array: "+r);if("array"==s){if("number"!=typeof p||p%1!=0)throw new Error("remove/2 invalid index: "+r);if(p<0||p>=c.value.length)throw new Error("remove/3 out of range: "+r);var x=(0,f.default)(p,1,c.value),w=h(x),y=(0,i.default)(o,w,t.tree),P=t.trackUpdate?b(t.updatePoint,o):t.updatePoint;return e(e({},t),{tree:y,updatePoint:P})}if(!c.value.hasOwnProperty(p))throw new Error("remove/4: property not found: "+r);var g=(0,d.default)(p,c.value);w=h(g),y=(0,i.default)(o,w,t.tree),P=t.trackUpdate?b(t.updatePoint,o):t.updatePoint;return e(e({},t),{tree:y,updatePoint:P})};exports.remove=q;var _=function(r,t,n){var o,p=m(r);if(0==p.length){var d=x(t),f=n.trackUpdate?[]:n.updatePoint;return e(e({},n),{tree:d,updatePoint:f})}var s=v(p),w=(0,l.default)(p),y=(0,u.default)(s,n.tree),P=(0,a.typeOf)(y.value);if("object"!=P&&"array"!=P)throw new Error("replace/1 neither an object nor an array: "+r);if("array"==P){if("number"!=typeof w||w%1!=0)throw new Error("replace/2 invalid index: "+r);if(w<0||w>=y.value.length)throw new Error("replace/3 out of range: "+r);var g=x(t),E=(0,c.default)(w,g,y.value),O=h(E);d=(0,i.default)(s,O,n.tree),f=n.trackUpdate?b(n.updatePoint,p):n.updatePoint;return e(e({},n),{tree:d,updatePoint:f})}if("string"!=typeof w)throw new Error("replace/4 invalid name: "+r);if(!(w in y.value))throw new Error("replace/5 undefined property: "+r);g=x(t);var k=e(e({},y.value),((o={})[w]=g,o));O=h(k),d=(0,i.default)(s,O,n.tree),f=n.trackUpdate?b(n.updatePoint,p):n.updatePoint;return e(e({},n),{tree:d,updatePoint:f})};exports.replace=_;var T=function(e,r,t){var a=(0,exports.extract)(e,t);return t=(0,exports.remove)(e,t),t=(0,exports.add)(r,a,t)};exports.move=T;var R=function(e,r,t){var a=(0,exports.extract)(e,t);return t=(0,exports.add)(r,a,t)};exports.copy=R;var I=function(r,t){var n=null,o=function(e){var r=(0,a.appendPath)(n,e);return(0,exports.extract)(r,t)},p=function(e,r,u){var i=e.value;switch((0,a.typeOf)(i)){case"array":for(var l=[],d=0;d<i.length;d++)l[d]=p(i[d],r+"/*",u+"/"+d);return n=u,t.validate(l,e,t.schemaDb[r],o);case"object":var f={};for(var c in i)f[c]=p(i[c],r+"/"+c,u+"/"+c);return n=u,t.validate(f,e,t.schemaDb[r],o);default:n=u;var s=t.validate(i,e,t.schemaDb[r],o);if(s.value!==i)throw new Error("validate/0: value changed: "+u);return s}},l=m(r),d=(0,u.default)(l,t.tree);if(!d)throw new Error("validate/1: not found: "+r);var f=p(d,(0,a.normalizePath)(r),r),c=(0,i.default)(l,f,t.tree);return e(e({},t),{tree:c})};exports.validate=I;var M=function(r,t,n){var o=function(t,n){var u=t.value;switch((0,a.typeOf)(u)){case"array":for(var i=[],p=0;p<u.length;p++)i[p]=o(u[p],n+"/"+p);return e(e({},r(t,n)),{value:i});case"object":var l={};for(var d in u)l[d]=o(u[d],n+"/"+d);return e(e({},r(t,n)),{value:l});default:return e(e({},r(t,n)),{value:u})}},p=m(t),l=(0,u.default)(p,n.tree);if(!l)throw new Error("mapDeep/1: not found: "+t);var d=o(l,t),f=(0,i.default)(p,d,n.tree);return e(e({},n),{tree:f})};exports.mapDeep=M;var z=function(e,r,t,n){var o=function(r,t,n){var u=t.value;switch((0,a.typeOf)(u)){case"array":for(var i=0;i<u.length;i++)r=o(r,u[i],n+"/"+i);return e(r,t,n);case"object":for(var p in u)r=o(r,u[p],n+"/"+p);return e(r,t,n);default:return e(r,t,n)}},i=m(t),p=(0,u.default)(i,n.tree);if(!p)throw new Error("reduceDeep/1: not found: "+t);return o(r,p,t)};exports.reduceDeep=z;var J=function(r,t,n){var o,p=m(r);if(0==p.length){var d=t.tree,f=n.trackUpdate?[]:n.updatePoint;return e(e({},n),{tree:d,updatePoint:f})}var s=v(p),x=(0,l.default)(p),w=(0,u.default)(s,t.tree),y=(0,a.typeOf)(w.value);if("object"!=y&&"array"!=y)throw new Error("duplicate/1 neither an object nor an array: "+r);if("array"==y){if("number"!=typeof x||x%1!=0)throw new Error("duplicate/2 invalid index: "+r);if(x<0||x>=w.value.length)throw new Error("duplicate/3 out of range: "+r);var P=w.value[x],g=(0,c.default)(x,P,w.value),E=h(g);d=(0,i.default)(s,E,n.tree),f=n.trackUpdate?b(n.updatePoint,p):n.updatePoint;return e(e({},n),{tree:d,updatePoint:f})}if("string"!=typeof x)throw new Error("replace/4 invalid name: "+r);if(!(x in w.value))throw new Error("replace/5 undefined property: "+r);P=w.value[x];var O=e(e({},w.value),((o={})[x]=P,o));E=h(O),d=(0,i.default)(s,E,n.tree),f=n.trackUpdate?b(n.updatePoint,p):n.updatePoint;return e(e({},n),{tree:d,updatePoint:f})};exports.duplicate=J;var N=function(t,a,n){var o;if(null===a){var u=n.extra,i=t,p=(u[i],r(u,["symbol"==typeof i?i:i+""]));return e(e({},n),{extra:p})}p=e(e({},n.extra),((o={})[t]=a,o));return e(e({},n),{extra:p})};exports.setExtra=N;var A=function(e,r){return r.extra[e]||null};exports.getExtra=A;var B=function(t,a,n){if(t)return e(e({},n),{ret:t,onPromiseThen:a});n.ret,n.onPromiseThen;return r(n,["ret","onPromiseThen"])};exports.setPortal=B;var C=function(e){if(!e.ret)throw new Error("doReturn/0: no ret");e.ret(e)};exports.doReturn=C;var F=function(e){return null!=e&&"object"==typeof e&&"tree"in e};exports.isEnv=F;
},{"./utils":"e4yr"}],"WCXc":[function(require,module,exports) {
"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.run=void 0;var e=r(require("../src/core/env"));function t(e){if("function"!=typeof WeakMap)return null;var r=new WeakMap,a=new WeakMap;return(t=function(e){return e?a:r})(e)}function r(e,r){if(!r&&e&&e.__esModule)return e;if(null===e||"object"!=typeof e&&"function"!=typeof e)return{default:e};var a=t(r);if(a&&a.has(e))return a.get(e);var d={},n=Object.defineProperty&&Object.getOwnPropertyDescriptor;for(var o in e)if("default"!==o&&Object.prototype.hasOwnProperty.call(e,o)){var i=n?Object.getOwnPropertyDescriptor(e,o):null;i&&(i.get||i.set)?Object.defineProperty(d,o,i):d[o]=e[o]}return d.default=e,a&&a.set(e,d),d}function a(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);t&&(a=a.filter(function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable})),r.push.apply(r,a)}return r}function d(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?a(Object(r),!0).forEach(function(t){n(e,t,r[t])}):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):a(Object(r)).forEach(function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))})}return e}function n(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}const o=(e,t)=>({"@value":e}),i=(t,r)=>{const a={name:"Bob",age:24,buddies:["Mam","Dad"]};let n=e.makeEnv(a,{},o,!0);t(1,()=>e.extract("/name",n),"Bob"),t(1.1,()=>e.test("/name",n),!0),t(1.2,()=>e.test("/foo",n),!1),n=e.add("/email","info@example.com",n),t(2,()=>e.extract("/email",n),"info@example.com"),r(2.1,()=>e.extract("/foo",n),"extract/"),t(3,()=>e.extract("/buddies/1",n),"Dad"),n=e.add("/buddies/1","Pochi",n),t(4,()=>e.extract("/buddies/1",n),"Pochi"),r(4.1,()=>e.extract("/buddies/5",n),"extract/"),n=e.add("/buddies/-","Komino",n),t(5,()=>e.extract("/buddies/3",n),"Komino"),n=e.remove("/buddies/3",n),t(6,()=>e.extract("/buddies",n).join(","),"Mam,Pochi,Dad"),r(6.1,()=>e.extract("/buddies/3",n),"extract/"),n=e.remove("/email",n),r(7,()=>e.extract("/email",n),"extract/"),r(7.1,()=>e.remove("/email",n),"remove/"),t(8,()=>{let t=e.getSlot("/name",n);return t=d(d({},t),{},{invalid:!0}),n=e.setSlot("/name",t,n),(t=e.getSlot("/name",n)).invalid},!0),n=e.replace("/age",30,n),t(9,()=>e.extract("/age",n),30);let i=e.replace("",{foo:1},n);t(9.1,()=>e.extract("/foo",i),1),r(9.2,()=>e.extract("/age",i),"extract/"),n=e.add("/id","TS1101",n),n=e.move("/id","/employeeId",n),t(10,()=>e.extract("/employeeId",n),"TS1101"),r(10.1,()=>e.extract("/id",n),"extract/"),n=e.copy("/employeeId","/id",n),t(11,()=>e.extract("/employeeId",n),"TS1101"),t(11.1,()=>e.extract("/id",n),"TS1101"),t(11.9,()=>e.extract("/buddies",n).join(","),"Mam,Pochi,Dad"),n=e.move("/buddies/2","/buddies/0",n),t(12,()=>e.extract("/buddies",n).join(","),"Dad,Mam,Pochi"),n=e.copy("/buddies/0","/buddies/2",n),t(13,()=>e.extract("/buddies",n),"Dad,Mam,Dad,Pochi"),n=e.mapDeep((e,t)=>d(d({},e),{},{message:"yeah"}),"/buddies",n),t(14,()=>e.getSlot("/buddies",n).message,"yeah"),t(14.1,()=>e.getSlot("/buddies/0",n).message,"yeah"),t(14.2,()=>e.getSlot("/name",n).message||"",""),t(15,()=>e.reduceDeep((e,t,r)=>"/buddies"==r?e:e+`[${t.value}]`,"","/buddies",n),"[Dad][Mam][Dad][Pochi]"),n=e.makeEnv(a,{},o,!0),t(16,()=>e.endUpdateTracking(n)[0],""),n=e.endUpdateTracking(n)[1],n=e.beginUpdateTracking(n),n=e.replace("/age",30,n),t(16.1,()=>e.endUpdateTracking(n)[0],"/age"),n=e.add("/name","Jack",n),t(16.2,()=>e.endUpdateTracking(n)[0],""),n=e.makeEnv(a,{},o,!1),n=e.beginUpdateTracking(n),n=e.add("/buddies/-","Puppy",n),t(16.3,()=>e.endUpdateTracking(n)[0],"/buddies"),n=e.remove("/name",n),t(16.4,()=>e.endUpdateTracking(n)[0],"")};exports.run=i;
},{"../src/core/env":"GOAg"}],"DtBn":[function(require,module,exports) {
"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.minItems=exports.maxItems=exports.pattern=exports.minLength=exports.maxLength=exports.exclusiveMinimum=exports.minimum=exports.exclusiveMaximum=exports.maximum=exports.multipleOf=exports.$if=exports.same=exports.switchRequired=exports.required=exports.notEmpty=exports.$const=exports.$enum=exports.type=void 0;var e=require("./utils"),r=require("./schema"),t=function(e,t){if(!t)return!0;if(null===e)return(0,r.nullable)(t);switch(t){case"null":return!1;case"number":case"number?":return"number"==typeof e;case"integer":case"integer?":return"number"==typeof e&&e%1==0;case"boolean":case"boolean?":return"boolean"==typeof e;case"string":return"string"==typeof e;case"object":case"object?":return"object"==typeof e&&null!==e;case"array":case"array?":return Array.isArray(e);default:throw new Error("unknown type: "+t)}},n=function(e,r){if("string"!=typeof e)throw new Error("invalid type");return!!t(r,e)||{code:"type."+e}};exports.type=n;var i=function(e,r){if(!Array.isArray(e))throw new Error("invalid parameter");for(var t=0;t<e.length;t++)if(e[t]===r)return!0;return{code:"rule.enum"}};exports.$enum=i;var o=function(r,t){if(r===t)return!0;switch((0,e.typeOf)(r)){case"string":case"number":case"null":case"boolean":return{code:"rule.const",hint:r};default:return{code:"rule.const.nohint"}}};exports.$const=o;var u=function(r,t){return"string"!=(0,e.typeOf)(t)||(""!==t||{code:"rule.notEmpty"})};exports.notEmpty=u;var a=function(r,t){if(!Array.isArray(r))throw new Error("invalid parameter");if("object"!=(0,e.typeOf)(t))return!0;for(var n=0;n<r.length;n++)if(!t.hasOwnProperty(r[n]))return{code:"rule.required",hint:r[n]};return!0};exports.required=a;var s=function(r,t,n){if("object"!=(0,e.typeOf)(r)||!("tagProperty"in r))throw new Error("invalid parameter");if("object"!=(0,e.typeOf)(t))return!0;var i=n("0/"+(r=r).tagProperty);if(!i)return{code:"rule.switchRequired.nohint",decription:"no tag"};if(!r.types[i])return{code:"rule.switchRequired.nohint",detail:"no type"};var o=r.types[i];if(!Array.isArray(o))throw new Error("invalid parameter");for(var u=0;u<o.length;u++)if(!t.hasOwnProperty(o[u]))return{code:"rule.switchRequired",hint:o[u]};return!0};exports.switchRequired=s;var p=function(r,t,n){if("string"!=typeof r)throw new Error("invalid parameter");var i=n(r);if(i!==t)switch((0,e.typeOf)(i)){case"string":case"number":case"null":case"boolean":return{code:"rule.same",hint:i};default:return{code:"rule.same.nohint"}}return!0};exports.same=p;var c=function(t,n,i,o){if("array"!=(0,e.typeOf)(t))throw new Error("invalid parameter");var u=t,a=u[0],s=u[1],p=u[2],c=u[3],m=void 0===c?{}:c;if(!a||!s||!p)throw new Error("invalid parameter");var l=i(a);return!0===(0,r.applyRules)(l,s,i,o)?(0,r.applyRules)(n,p,i,o):(0,r.applyRules)(n,m,i,o)};exports.$if=c;var m=function(e,r){if("number"!=typeof e)throw new Error("invalid parameter");return"number"!=typeof r||(r%e==0||{code:"rule.multipleOf",hint:e})};exports.multipleOf=m;var l=function(e,r){return"number"!=typeof r||(e>=r||{code:"rule.maximum",hint:e})};exports.maximum=l;var f=function(e,r){return"number"!=typeof r||(e>r||{code:"rule.exclusiveMaximum",hint:e})};exports.exclusiveMaximum=f;var y=function(e,r){return"number"!=typeof r||(e<=r||{code:"rule.minimum",hint:e})};exports.minimum=y;var x=function(e,r){return"number"!=typeof r||(e<r||{code:"rule.exclusiveMinimum",hint:e})};exports.exclusiveMinimum=x;var h=function(e,r){return"string"!=typeof r||(r.length<=e||{code:"rule.maxLength",hint:e})};exports.maxLength=h;var d=function(e,r){return"string"!=typeof r||(r.length>=e||{code:"rule.minLength",hint:e})};exports.minLength=d;var v=function(e,r){if("string"!=typeof e)throw new Error("invalid parameter");return"string"!=typeof r||(!!new RegExp(e).test(r)||{code:"rule.pattern",hint:e})};exports.pattern=v;var w=function(e,r){if("number"!=typeof e)throw new Error("invalid parameter");return!Array.isArray(r)||(r.length<=e||{code:"rule.maxItems",hint:e})};exports.maxItems=w;var g=function(e,r){if("number"!=typeof e)throw new Error("invalid parameter");return!Array.isArray(r)||(r.length>=e||{code:"rule.minItems",hint:e})};exports.minItems=g;
},{"./utils":"e4yr","./schema":"BtYR"}],"BtYR":[function(require,module,exports) {
"use strict";var e=this&&this.__assign||function(){return(e=Object.assign||function(e){for(var t,r=1,n=arguments.length;r<n;r++)for(var i in t=arguments[r])Object.prototype.hasOwnProperty.call(t,i)&&(e[i]=t[i]);return e}).apply(this,arguments)},t=this&&this.__createBinding||(Object.create?function(e,t,r,n){void 0===n&&(n=r),Object.defineProperty(e,n,{enumerable:!0,get:function(){return t[r]}})}:function(e,t,r,n){void 0===n&&(n=r),e[n]=t[r]}),r=this&&this.__setModuleDefault||(Object.create?function(e,t){Object.defineProperty(e,"default",{enumerable:!0,value:t})}:function(e,t){e.default=t}),n=this&&this.__importStar||function(e){if(e&&e.__esModule)return e;var n={};if(null!=e)for(var i in e)"default"!==i&&Object.prototype.hasOwnProperty.call(e,i)&&t(n,e,i);return r(n,e),n};Object.defineProperty(exports,"__esModule",{value:!0}),exports.coerce=exports.applyRules=exports.validate=exports.defaultRules=exports.buildDb=exports.nullable=void 0;var i=require("./utils"),u=n(require("./rules")),a=function(e){if(!e)return!0;var t=e.charAt(e.length-1);return"null"==e||"?"==t};exports.nullable=a;var o=function(e){var t={},r=function(e,n){switch(t[n]=e,e.type){case"object":case"object?":for(var i in e.properties)r(e.properties[i],n+"/"+i);break;case"array":case"array?":r(e.items,n+"/*")}};return r(e,""),t};exports.buildDb=o,exports.defaultRules={type:u.type,enum:u.$enum,const:u.$const,notEmpty:u.notEmpty,required:u.required,switchRequired:u.switchRequired,same:u.same,if:u.$if,multipleOf:u.multipleOf,maximum:u.maximum,exclusiveMaximum:u.exclusiveMaximum,minimum:u.minimum,exclusiveMinimum:u.exclusiveMinimum,maxLength:u.maxLength,minLength:u.minLength,pattern:u.pattern,maxItems:u.maxItems,minItems:u.minItems};var l=function(t){return function(r,n,u,a){if(!(0,i.isJsonValue)(r)){if(u&&u.type){var o={code:"type."+u.type,detail:"given value: "+r};return e(e({},n),{value:r,invalid:!0,error:o})}o={code:"value",detail:"given value: "+r};return e(e({},n),{value:r,invalid:!0,error:o})}if(u){var l=(0,exports.applyRules)(r,u,a,t);if(!0!==l)return e(e({},n),{value:r,invalid:!0,error:l})}return e(e({},n),{value:r,invalid:!1,error:null})}};exports.validate=l;var c=function(e,t,r,n){for(var i in t){var u=n[i];if(u){var a=u(t[i],e,r,n);if(!0!==a)return a}}return!0};exports.applyRules=c;var s=function(e,t,r){if(e=""+e,!r)throw new Error("coerce/0: no schema");if(!r.type||"string"!=typeof r.type)throw new Error("coerce/1: type not specified");var n=r.type;if(-1==["null","boolean","boolean?","integer","integer?","number","number?","string"].indexOf(n))throw new Error("coerce/2: not a coercion enabled type: "+n);switch(n){case"null":break;case"number":case"number?":var i=+e;if(""+i===e)return{value:i,input:e,touched:t.touched};break;case"integer":case"integer?":var u=+e;if(""+u===e&&u%1==0)return{value:u,input:e,touched:t.touched};break;case"boolean":case"boolean?":if("true"===e||"false"===e)return{value:"true"===e,input:e,touched:t.touched};break;case"string":return{value:e,input:e,touched:t.touched}}return""==e&&(0,exports.nullable)(n)?{value:null,input:e,touched:t.touched}:{input:e,touched:t.touched}};exports.coerce=s;
},{"./utils":"e4yr","./rules":"DtBn"}],"zpTb":[function(require,module,exports) {
"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.run=void 0;var e=l(require("../src/core/schema"));function i(e){if("function"!=typeof WeakMap)return null;var l=new WeakMap,a=new WeakMap;return(i=function(e){return e?a:l})(e)}function l(e,l){if(!l&&e&&e.__esModule)return e;if(null===e||"object"!=typeof e&&"function"!=typeof e)return{default:e};var a=i(l);if(a&&a.has(e))return a.get(e);var n={},t=Object.defineProperty&&Object.getOwnPropertyDescriptor;for(var r in e)if("default"!==r&&Object.prototype.hasOwnProperty.call(e,r)){var v=t?Object.getOwnPropertyDescriptor(e,r):null;v&&(v.get||v.set)?Object.defineProperty(n,r,v):n[r]=e[r]}return n.default=e,a&&a.set(e,n),n}function a(e,i){var l=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);i&&(a=a.filter(function(i){return Object.getOwnPropertyDescriptor(e,i).enumerable})),l.push.apply(l,a)}return l}function n(e){for(var i=1;i<arguments.length;i++){var l=null!=arguments[i]?arguments[i]:{};i%2?a(Object(l),!0).forEach(function(i){t(e,i,l[i])}):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(l)):a(Object(l)).forEach(function(i){Object.defineProperty(e,i,Object.getOwnPropertyDescriptor(l,i))})}return e}function t(e,i,l){return i in e?Object.defineProperty(e,i,{value:l,enumerable:!0,configurable:!0,writable:!0}):e[i]=l,e}const r=(i,l,a)=>{const t=e.validate(e.defaultRules),r=e.coerce;let v=null;v={type:"null"},i(1,()=>t(null,{},v).invalid,!1),i(1.1,()=>t(1,{},v).invalid,!0),i(1.2,()=>t("abc",{},v).invalid,!0),i(1.3,()=>r("",{},v).value,null),a(1.4,()=>r("abc",{},v).value),i(1.5,()=>t(void 0,{},v).invalid,!0),v=null,i(2,()=>t(null,{},v).invalid,!1),i(2.1,()=>t(10,{},v).invalid,!1),i(2.2,()=>t([],{},v).invalid,!1),l(2.3,()=>r("",{},v),"coerce/"),l(2.4,()=>r("aaa",{},v),"coerce/"),i(2.5,()=>t(void 0,{},v).invalid,!0),v={type:"boolean"},i(3,()=>t(null,{},v).invalid,!0),i(3.1,()=>t(1,{},v).invalid,!0),i(3.2,()=>t(!0,{},v).invalid,!1),a(3.3,()=>r("",{},v).value),i(3.4,()=>r("false",{},v).value,!1),a(3.5,()=>r("abc",{},v).value),i(3.6,()=>r("true",{},v).value,!0),v={type:"boolean?"},i(4,()=>t(null,{},v).invalid,!1),i(4.1,()=>t(1,{},v).invalid,!0),i(4.2,()=>t(!0,{},v).invalid,!1),i(4.3,()=>r("",{},v).value,null),i(4.4,()=>r("false",{},v).value,!1),a(4.5,()=>r("abc",{},v).value),v={type:"integer"},i(5,()=>t(null,{},v).invalid,!0),i(5.1,()=>t(1,{},v).invalid,!1),i(5.2,()=>t(!0,{},v).invalid,!0),a(5.3,()=>r("",{},v).value),i(5.4,()=>r("10",{},v).value,10),a(5.5,()=>r("abc",{},v).value),i(5.6,()=>t(132,{},v).value,132),v={type:"integer?"},i(6,()=>t(null,{},v).invalid,!1),i(6.1,()=>t(1,{},v).invalid,!1),i(6.2,()=>t(!0,{},v).invalid,!0),i(6.3,()=>r("",{},v).value,null),i(6.4,()=>r("10",{},v).value,10),a(6.5,()=>r("10.3",{},v).value),i(6.6,()=>r("132",{},v).value,132),v={type:"number"},i(7,()=>t(null,{},v).invalid,!0),i(7.1,()=>t(1.2,{},v).invalid,!1),i(7.2,()=>t(!0,{},v).invalid,!0),a(7.3,()=>r("",{},v).value),i(7.4,()=>r("10.3",{},v).value,10.3),a(7.5,()=>r("abc",{},v).value),v={type:"number?"},i(8,()=>t(null,{},v).invalid,!1),i(8.1,()=>t(1.2,{},v).invalid,!1),i(8.2,()=>t(!0,{},v).invalid,!0),i(8.3,()=>r("",{},v).value,null),i(8.4,()=>r("10.3",{},v).value,10.3),a(8.5,()=>r("abc",{},v).value),v={type:"string"},i(9,()=>t(null,{},v).invalid,!0),i(9.1,()=>t("",{},v).invalid,!1),i(9.2,()=>t(!0,{},v).invalid,!0),i(9.3,()=>t("abc",{},v).invalid,!1),i(9.4,()=>r("",{},v).value,""),i(9.5,()=>r("abc",{},v).value,"abc"),v={type:"object"},i(10,()=>t(null,{},v).invalid,!0),i(10.1,()=>t("",{},v).invalid,!0),i(10.2,()=>t({},v).invalid,!1),l(10.3,()=>r("",{},v),"coerce/"),v={type:"object?"},i(11,()=>t(null,{},v).invalid,!1),i(11.1,()=>t("",{},v).invalid,!0),i(11.2,()=>t({},{},v).invalid,!1),l(11.3,()=>r("",{},v),"coerce/"),v={type:"array"},i(12,()=>t(null,{},v).invalid,!0),i(12.1,()=>t("",{},v).invalid,!0),i(12.2,()=>t([],{},v).invalid,!1),l(12.3,()=>r("",{},v),"coerce/"),v={type:"array?"},i(13,()=>t(null,{},v).invalid,!1),i(13.1,()=>t("",{},v).invalid,!0),i(13.2,()=>t([],{},v).invalid,!1),l(13.3,()=>r("",{},v),"coerce/"),v={type:"integer?",enum:[1]},i(14,()=>t(null,{},v).invalid,!0),i(14.1,()=>t(1,{},v).invalid,!1),i(14.2,()=>t(3,{},v).invalid,!0),v={type:"number",const:3.2},i(15,()=>t(3.2,{},v).invalid,!1),i(15.1,()=>t(3,{},v).invalid,!0),v={type:"object",required:["foo","bar"]},i(16,()=>t({foo:1,bar:1},{},v).invalid,!1),i(16.1,()=>t({foo:1},{},v).invalid,!0),i(16.2,()=>t({foo:1,bar:1,baz:1},{},v).invalid,!1),i(16.3,()=>t(1,{},n(n({},v),{},{type:"integer"})).invalid,!1),v={type:"object",switchRequired:{tagProperty:"type",types:{infix:["type","op","lhs","rhs"],app:["type","f","arg"],var:["type","var"],lit:["type","val"],lambda:["type","param","expr"]}}};let d={type:"infix",op:"*",lhs:{type:"var",var:"n"},rhs:{type:"app",f:"fact",arg:{type:"infix",op:"-",lhs:{type:"var",var:"n"},rhs:{type:"lit"}}}};i(17,()=>t(d,{},v,e=>"infix").invalid,!1),i(17.1,()=>t(d.lhs,{},v,e=>"var").invalid,!1),i(17.2,()=>t(d.rhs.arg.rhs,{},v,e=>"lit").invalid,!0),i(17.3,()=>t(1,{},n(n({},v),{},{type:"integer"})).invalid,!1),v={type:"number?",multipleOf:1.2},i(18,()=>t(-2.4,{},v).invalid,!1),i(18.1,()=>t(1.5,{},v).invalid,!0),i(18.2,()=>t(null,{},v).invalid,!1),i(18.3,()=>t(!0,{},n(n({},v),{},{type:"boolean"})).invalid,!1),v={type:"integer?",maximum:10},i(19,()=>t(10,{},v).invalid,!1),i(19.1,()=>t(11,{},v).invalid,!0),i(19.2,()=>t(null,{},v).invalid,!1),i(19.3,()=>t(!0,{},n(n({},v),{},{type:"boolean"})).invalid,!1),v={type:"integer?",exclusiveMaximum:10},i(20,()=>t(9,{},v).invalid,!1),i(20.1,()=>t(10,{},v).invalid,!0),i(20.2,()=>t(null,{},v).invalid,!1),i(20.3,()=>t(!0,{},n(n({},v),{},{type:"boolean"})).invalid,!1),v={type:"integer?",minimum:10},i(21,()=>t(10,{},v).invalid,!1),i(21.1,()=>t(9,{},v).invalid,!0),i(21.2,()=>t(null,{},v).invalid,!1),i(21.3,()=>t(!0,{},n(n({},v),{},{type:"boolean"})).invalid,!1),v={type:"integer?",exclusiveMinimum:10},i(20,()=>t(10,{},v).invalid,!0),i(20.1,()=>t(11,{},v).invalid,!1),i(20.2,()=>t(null,{},v).invalid,!1),i(20.3,()=>t(!0,{},n(n({},v),{},{type:"boolean"})).invalid,!1),v={type:"string",maxLength:3},i(21,()=>t("abc",{},v).invalid,!1),i(21.1,()=>t("abcd",{},v).invalid,!0),i(21.2,()=>t("",{},v).invalid,!1),i(21.3,()=>t(!0,{},n(n({},v),{},{type:"boolean"})).invalid,!1),v={type:"string",minLength:3},i(21,()=>t("abd",{},v).invalid,!1),i(21.1,()=>t("ab",{},v).invalid,!0),i(21.2,()=>t("",{},v).invalid,!0),i(21.3,()=>t(!0,{},n(n({},v),{},{type:"boolean"})).invalid,!1),v={type:"string",pattern:"^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:.[a-zA-Z0-9-]+)*$"},i(22,()=>t("info@example.com",{},v).invalid,!1),i(22.1,()=>t("192.168.0.1",{},v).invalid,!0),i(22.2,()=>t(!0,{},n(n({},v),{},{type:"boolean"})).invalid,!1),v={type:"array?",maxItems:3},i(23,()=>t([1,2,3],{},v).invalid,!1),i(23.1,()=>t([1,2,3,4],{},v).invalid,!0),i(23.2,()=>t(null,{},v).invalid,!1),i(23.3,()=>t(!0,{},n(n({},v),{},{type:"boolean"})).invalid,!1),v={type:"array?",minItems:4},i(24,()=>t([1,2,3],{},v).invalid,!0),i(24.1,()=>t([1,2,3,4],{},v).invalid,!1),i(24.2,()=>t(null,{},v).invalid,!1),i(24.3,()=>t(!0,{},n(n({},v),{},{type:"boolean"})).invalid,!1),v={type:"string",same:"/first"},d={first:"a",second:"a"},i(25,()=>t("a",{},v,e=>"a").invalid,!1),i(25.1,()=>t("b",{},v,e=>"a").invalid,!0),v={same:"/first"},i(25.2,()=>t("a",{},v,e=>"a").invalid,!1),v={type:"object?",properties:{at:{type:"string"},to:{type:"string"}},required:["at","to"],if:["/status",{enum:["shipped","refunded"]},{type:"object"}]},i(26,()=>t(null,{},v,e=>"new",e.defaultRules).invalid,!1),i(26.1,()=>t(null,{},v,e=>"shipped",e.defaultRules).invalid,!0),i(26.2,()=>t({at:"a",to:"b"},{},v,e=>"new",e.defaultRules).invalid,!1),i(26.3,()=>t({at:"a",to:"b"},{},v,e=>"shipped",e.defaultRules).invalid,!1),v={type:"object?",properties:{at:{type:"string"},to:{type:"string"}},required:["at","to"],if:["/status",{enum:["shipped","refunded"]},{type:"object"},{type:"null"}]},i(26.4,()=>t(null,{},v,e=>"new",e.defaultRules).invalid,!1),i(26.5,()=>t(null,{},v,e=>"shipped",e.defaultRules).invalid,!0),i(26.6,()=>t({at:"a",to:"b"},{},v,e=>"new",e.defaultRules).invalid,!0),i(26.7,()=>t({at:"a",to:"b"},{},v,e=>"shipped",e.defaultRules).invalid,!1)};exports.run=r;
},{"../src/core/schema":"BtYR"}],"l6QX":[function(require,module,exports) {
"use strict";var e=n(require("./utils")),o=n(require("./env")),r=n(require("./schema"));function t(e){if("function"!=typeof WeakMap)return null;var o=new WeakMap,r=new WeakMap;return(t=function(e){return e?r:o})(e)}function n(e,o){if(!o&&e&&e.__esModule)return e;if(null===e||"object"!=typeof e&&"function"!=typeof e)return{default:e};var r=t(o);if(r&&r.has(e))return r.get(e);var n={},l=Object.defineProperty&&Object.getOwnPropertyDescriptor;for(var c in e)if("default"!==c&&Object.prototype.hasOwnProperty.call(e,c)){var s=l?Object.getOwnPropertyDescriptor(e,c):null;s&&(s.get||s.set)?Object.defineProperty(n,c,s):n[c]=e[c]}return n.default=e,r&&r.set(e,n),n}const l=(e,o,r)=>{const t=o();t==r?console.log("- ASSERTION",e,"OK"):console.log("! ASSERTION",e,"NG",t,r)},c=(e,o)=>{const r=o();void 0===r?console.log("- ASSERTION",e,"OK"):console.log("! ASSERTION",e,"NG",r,"undefined")},s=(e,o,r)=>{let t=null;try{o();t="no error"}catch(n){if(n instanceof Error&&n.message.startsWith(r))return void console.log("- ASSERTION",e,"OK");t="matching failure: "+n.message}console.log("! ASSERTION",e,"NG",t)},u=(e,o)=>{console.log("TEST START: "+o),e.run(l,s,c),console.log("TEST DONE: "+o),console.log("")};u(e,"utils"),u(o,"env"),u(r,"schema");
},{"./utils":"FOZT","./env":"WCXc","./schema":"zpTb"}]},{},["l6QX"], null)
//# sourceMappingURL=/_index.js.map