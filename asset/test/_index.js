parcelRequire=function(e,r,t,n){var i,o="function"==typeof parcelRequire&&parcelRequire,u="function"==typeof require&&require;function f(t,n){if(!r[t]){if(!e[t]){var i="function"==typeof parcelRequire&&parcelRequire;if(!n&&i)return i(t,!0);if(o)return o(t,!0);if(u&&"string"==typeof t)return u(t);var c=new Error("Cannot find module '"+t+"'");throw c.code="MODULE_NOT_FOUND",c}p.resolve=function(r){return e[t][1][r]||r},p.cache={};var l=r[t]=new f.Module(t);e[t][0].call(l.exports,p,l,l.exports,this)}return r[t].exports;function p(e){return f(p.resolve(e))}}f.isParcelRequire=!0,f.Module=function(e){this.id=e,this.bundle=f,this.exports={}},f.modules=e,f.cache=r,f.parent=o,f.register=function(r,t){e[r]=[function(e,r){r.exports=t},{}]};for(var c=0;c<t.length;c++)try{f(t[c])}catch(e){i||(i=e)}if(t.length){var l=f(t[t.length-1]);"object"==typeof exports&&"undefined"!=typeof module?module.exports=l:"function"==typeof define&&define.amd?define(function(){return l}):n&&(this[n]=l)}if(parcelRequire=f,i)throw i;return f}({"hIne":[function(require,module,exports) {
"use strict";var r=this&&this.__importDefault||function(r){return r&&r.__esModule?r:{default:r}};Object.defineProperty(exports,"__esModule",{value:!0}),exports.showText=exports.normalizeQuery=exports.commonPath=exports.isJsonValue=exports.typeOf=exports.pathToArray=exports.normalizePathArray=exports.appendPath=exports.normalizePath=exports.isIntStr=void 0;var t=r(require("string-template"));exports.showText=t.default;var e=function(r){var t=+r;return t%1==0&&r===""+t};exports.isIntStr=e;var n=function(r){for(var t=r.split("/"),e=1;e<t.length;e++)(0,exports.isIntStr)(t[e])&&(t[e]="*");return t.join("/")};exports.normalizePath=n;var a=function(r,t){if(""==t.charAt(0)||"/"==t.charAt(0))return t;if("0"===t)return r;var e=(0,exports.pathToArray)(r),n=t.split("/"),a=[],o=+n[0];return o>(a=e).length&&(o=a.length),a.splice(a.length-o,o),n.shift(),0==n.length&&0==a.length?"":"/"+a.concat(n).join("/")};exports.appendPath=a;var o=function(r){for(var t="",e=0;e<r.length;e++)"number"==typeof r[e]||(0,exports.isIntStr)(""+r[e])?t+="/*":t+="/"+r[e];return t};exports.normalizePathArray=o;var s=function(r){for(var t=r.split("/"),e=[],n=1;n<t.length;n++)e.push((0,exports.isIntStr)(t[n])?+t[n]:t[n]);return e};exports.pathToArray=s;var p=function(r){return null===r?"null":Array.isArray(r)?"array":typeof r};exports.typeOf=p;var i=function(r){switch((0,exports.typeOf)(r)){case"null":case"number":case"boolean":case"string":case"object":case"array":return!0;default:return!1}};exports.isJsonValue=i;var u=function(r,t){for(var e=r.split("/"),n=t.split("/"),a=[],o=0;o<e.length&&!(n.length<=o)&&e[o]==n[o];o++)a.push(e[o]);return a.join("/")};exports.commonPath=u;var l=function(r,t){var e={};for(var n in r)switch((0,exports.typeOf)(n)){case"null":t||(e[n]="");break;case"boolean":e[n]=r[n]?"true":"false";break;case"number":e[n]=""+r[n];break;case"string":if(t&&""===r[n])break;e[n]=r[n]}return e};exports.normalizeQuery=l;
},{}],"FOZT":[function(require,module,exports) {
"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.run=void 0;var e=a(require("../src/core/utils"));function t(e){if("function"!=typeof WeakMap)return null;var a=new WeakMap,r=new WeakMap;return(t=function(e){return e?r:a})(e)}function a(e,a){if(!a&&e&&e.__esModule)return e;if(null===e||"object"!=typeof e&&"function"!=typeof e)return{default:e};var r=t(a);if(r&&r.has(e))return r.get(e);var n={},o=Object.defineProperty&&Object.getOwnPropertyDescriptor;for(var c in e)if("default"!==c&&Object.prototype.hasOwnProperty.call(e,c)){var p=o?Object.getOwnPropertyDescriptor(e,c):null;p&&(p.get||p.set)?Object.defineProperty(n,c,p):n[c]=e[c]}return n.default=e,r&&r.set(e,n),n}const r=(t,a,r)=>{t(1,()=>e.appendPath("/a/b","0/c/d"),"/a/b/c/d"),t(1.1,()=>e.appendPath("","0/c"),"/c"),t(1.2,()=>e.appendPath("/a/b","/x/y"),"/x/y"),t(1.3,()=>e.appendPath("/a/b/c","1/d/e"),"/a/b/d/e"),t(1.4,()=>e.appendPath("/a","3/z"),"/z"),t(1.5,()=>e.appendPath("/a/b","1"),"/a"),t(1.6,()=>e.appendPath("/a/b/c","3"),""),t(2,()=>e.commonPath("/a/b/c","/a/b/c"),"/a/b/c"),t(2.1,()=>e.commonPath("/a/b/c","/a/b/d"),"/a/b"),t(2.2,()=>e.commonPath("/a/b/c","/a"),"/a"),t(2.3,()=>e.commonPath("/a/b/c",""),"")};exports.run=r;
},{"../src/core/utils":"hIne"}],"Vo52":[function(require,module,exports) {
"use strict";var e=this&&this.__assign||function(){return(e=Object.assign||function(e){for(var r,t=1,a=arguments.length;t<a;t++)for(var n in r=arguments[t])Object.prototype.hasOwnProperty.call(r,n)&&(e[n]=r[n]);return e}).apply(this,arguments)},r=this&&this.__rest||function(e,r){var t={};for(var a in e)Object.prototype.hasOwnProperty.call(e,a)&&r.indexOf(a)<0&&(t[a]=e[a]);if(null!=e&&"function"==typeof Object.getOwnPropertySymbols){var n=0;for(a=Object.getOwnPropertySymbols(e);n<a.length;n++)r.indexOf(a[n])<0&&Object.prototype.propertyIsEnumerable.call(e,a[n])&&(t[a[n]]=e[a[n]])}return t},t=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};Object.defineProperty(exports,"__esModule",{value:!0}),exports.isStore=exports.doReturn=exports.setPortal=exports.getExtra=exports.setExtra=exports.duplicate=exports.reduceDeep=exports.mapDeep=exports.validate=exports.copy=exports.move=exports.replace=exports.remove=exports.add=exports.setMdr=exports.getMdr=exports.get=exports.test=exports.endUpdateTracking=exports.beginUpdateTracking=exports.isSame=exports.makeStore=void 0;var a=require("./utils"),n=t(require("ramda/src/hasPath")),o=t(require("ramda/src/init")),u=t(require("ramda/src/path")),i=t(require("ramda/src/assocPath")),d=t(require("ramda/src/insert")),p=t(require("ramda/src/last")),l=t(require("ramda/src/dissoc")),f=t(require("ramda/src/remove")),s=t(require("ramda/src/update")),c=function(e,r){return!e.length||(0,n.default)(e,r)},v=function(e){return(0,o.default)((0,o.default)(e))},h=function(e){var r={value:e,invalid:!1,error:null};switch((0,a.typeOf)(e)){case"object":case"array":break;case"number":case"integer":r.input=""+e,r.touched=!1;break;case"boolean":r.input=e?"true":"false",r.touched=!1;break;case"null":r.input="",r.touched=!1;break;case"string":r.input=e,r.touched=!1}return r},x=function(e){var r=function(e){switch((0,a.typeOf)(e)){case"array":for(var t=[],n=0;n<e.length;n++)t[n]=r(e[n]);return h(t);case"object":var o={};for(var u in e)o[u]=r(e[u]);return h(o);default:return h(e)}};return r(e)},w=function(e){var r=e.value;switch((0,a.typeOf)(r)){case"array":for(var t=[],n=0;n<r.length;n++)t[n]=w(r[n]);return t;case"object":var o={};for(var u in r)o[u]=w(r[u]);return o;default:return r}},y=function(e,r,t,a){return{tree:x(e),trackUpdate:a,updatePoint:a?[]:null,schemaDb:r,validate:t,extra:{}}};exports.makeStore=y;var g=function(e,r){return e.tree===r.tree&&e.extra===r.extra};exports.isSame=g;var P=function(e){for(var r=e.split("/"),t=[],n=1;n<r.length;n++)t.push("value"),t.push((0,a.isIntStr)(r[n])?+r[n]:r[n]);return t},m=function(e){for(var r="",t=0;t<e.length;t+=2)r+="/"+e[t+1];return r},b=function(e,r){if(null===e)return r;if(null===r)return e;for(var t=[],a=0;a<e.length&&!(a>=r.length)&&e[a+1]===r[a+1];a+=2)t.push(e[a]),t.push(e[a+1]);return t},E=function(r){return e(e({},r),{trackUpdate:!0})};exports.beginUpdateTracking=E;var k=function(r){return[r.updatePoint?m(r.updatePoint):null,e(e({},r),{trackUpdate:!1,updatePoint:null})]};exports.endUpdateTracking=k;var O=function(e,r){return c(P(e),r.tree)};exports.test=O;var j=function(e,r){var t=P(e),a=(0,u.default)(t,r.tree);if(!a)throw new Error("get/1: not found: "+e);return w(a)};exports.get=j;var U=function(e,r){var t=P(e),a=(0,u.default)(t,r.tree);if(!a)throw new Error("getMdr/1: not found: "+e);return a};exports.getMdr=U;var D=function(r,t,n){var o=P(r),d=(0,u.default)(o,n.tree);if(!d)throw new Error("setMdr/1: not found: "+r);switch((0,a.typeOf)(d.value)){case"null":case"boolean":case"number":case"string":case"undefined":break;default:throw new Error("setMdr/2: not a scalar: "+r)}var p=(0,i.default)(o,t,n.tree),l=n.trackUpdate?b(n.updatePoint,o):n.updatePoint;return e(e({},n),{tree:p,updatePoint:l})};exports.setMdr=D;var q=function(r,t,n){var o,l=P(r),f=v(l),s=(0,p.default)(l),c=(0,u.default)(f,n.tree),w=(0,a.typeOf)(c.value);if("object"!=w&&"array"!=w)throw new Error("add/1 neither an object nor an array: "+r);if("array"==w){var y="-"===s?c.value.length:s;if("number"!=typeof y||y%1!=0)throw new Error("add/2 invalid index: "+r);if(y<0||y>c.value.length)throw new Error("add/3 index out of range: "+r);var g=x(t),m=(0,d.default)(y,g,c.value),E=h(m),k=(0,i.default)(f,E,n.tree),O=n.trackUpdate?b(n.updatePoint,f):n.updatePoint;return e(e({},n),{tree:k,updatePoint:O})}if("string"!=typeof s)throw new Error("add/4 invalid name: "+r);g=x(t);var j=e(e({},c.value),((o={})[s]=g,o));E=h(j),k=(0,i.default)(f,E,n.tree),O=n.trackUpdate?b(n.updatePoint,s in c.value?l:f):n.updatePoint;return e(e({},n),{tree:k,updatePoint:O})};exports.add=q;var _=function(r,t){var n=P(r),o=v(n),d=(0,p.default)(n),s=(0,u.default)(o,t.tree),c=(0,a.typeOf)(s.value);if("object"!=c&&"array"!=c)throw new Error("remove/1 neither an object nor an array: "+r);if("array"==c){if("number"!=typeof d||d%1!=0)throw new Error("remove/2 invalid index: "+r);if(d<0||d>=s.value.length)throw new Error("remove/3 out of range: "+r);var x=(0,f.default)(d,1,s.value),w=h(x),y=(0,i.default)(o,w,t.tree),g=t.trackUpdate?b(t.updatePoint,o):t.updatePoint;return e(e({},t),{tree:y,updatePoint:g})}if(!s.value.hasOwnProperty(d))throw new Error("remove/4: property not found: "+r);var m=(0,l.default)(d,s.value);w=h(m),y=(0,i.default)(o,w,t.tree),g=t.trackUpdate?b(t.updatePoint,o):t.updatePoint;return e(e({},t),{tree:y,updatePoint:g})};exports.remove=_;var M=function(r,t,n){var o,d=P(r);if(0==d.length){var l=x(t),f=n.trackUpdate?[]:n.updatePoint;return e(e({},n),{tree:l,updatePoint:f})}var c=v(d),w=(0,p.default)(d),y=(0,u.default)(c,n.tree),g=(0,a.typeOf)(y.value);if("object"!=g&&"array"!=g)throw new Error("replace/1 neither an object nor an array: "+r);if("array"==g){if("number"!=typeof w||w%1!=0)throw new Error("replace/2 invalid index: "+r);if(w<0||w>=y.value.length)throw new Error("replace/3 out of range: "+r);var m=x(t),E=(0,s.default)(w,m,y.value),k=h(E);l=(0,i.default)(c,k,n.tree),f=n.trackUpdate?b(n.updatePoint,d):n.updatePoint;return e(e({},n),{tree:l,updatePoint:f})}if("string"!=typeof w)throw new Error("replace/4 invalid name: "+r);if(!(w in y.value))throw new Error("replace/5 undefined property: "+r);m=x(t);var O=e(e({},y.value),((o={})[w]=m,o));k=h(O),l=(0,i.default)(c,k,n.tree),f=n.trackUpdate?b(n.updatePoint,d):n.updatePoint;return e(e({},n),{tree:l,updatePoint:f})};exports.replace=M;var S=function(e,r,t){var a=(0,exports.get)(e,t);return t=(0,exports.remove)(e,t),t=(0,exports.add)(r,a,t)};exports.move=S;var T=function(e,r,t){var a=(0,exports.get)(e,t);return t=(0,exports.add)(r,a,t)};exports.copy=T;var R=function(r,t){var n=null,o=function(e){var r=(0,a.appendPath)(n,e);return(0,exports.get)(r,t)},d=function(e,r,u){var i=e.value;switch((0,a.typeOf)(i)){case"array":for(var p=[],l=0;l<i.length;l++)p[l]=d(i[l],r+"/*",u+"/"+l);return n=u,t.validate(p,e,t.schemaDb[r],o);case"object":var f={};for(var s in i)f[s]=d(i[s],r+"/"+s,u+"/"+s);return n=u,t.validate(f,e,t.schemaDb[r],o);default:n=u;var c=t.validate(i,e,t.schemaDb[r],o);if(c.value!==i)throw new Error("validate/0: value changed: "+u);return c}},p=P(r),l=(0,u.default)(p,t.tree);if(!l)throw new Error("validate/1: not found: "+r);var f=d(l,(0,a.normalizePath)(r),r),s=(0,i.default)(p,f,t.tree);return e(e({},t),{tree:s})};exports.validate=R;var I=function(r,t,n){var o=function(t,n){var u=t.value;switch((0,a.typeOf)(u)){case"array":for(var i=[],d=0;d<u.length;d++)i[d]=o(u[d],n+"/"+d);return e(e({},r(t,n)),{value:i});case"object":var p={};for(var l in u)p[l]=o(u[l],n+"/"+l);return e(e({},r(t,n)),{value:p});default:return e(e({},r(t,n)),{value:u})}},d=P(t),p=(0,u.default)(d,n.tree);if(!p)throw new Error("mapDeep/1: not found: "+t);var l=o(p,t),f=(0,i.default)(d,l,n.tree);return e(e({},n),{tree:f})};exports.mapDeep=I;var z=function(e,r,t,n){var o=function(r,t,n){var u=t.value;switch((0,a.typeOf)(u)){case"array":for(var i=0;i<u.length;i++)r=o(r,u[i],n+"/"+i);return e(r,t,n);case"object":for(var d in u)r=o(r,u[d],n+"/"+d);return e(r,t,n);default:return e(r,t,n)}},i=P(t),d=(0,u.default)(i,n.tree);if(!d)throw new Error("reduceDeep/1: not found: "+t);return o(r,d,t)};exports.reduceDeep=z;var A=function(r,t,n){var o,d=P(r);if(0==d.length){var l=t.tree,f=n.trackUpdate?[]:n.updatePoint;return e(e({},n),{tree:l,updatePoint:f})}var c=v(d),x=(0,p.default)(d),w=(0,u.default)(c,t.tree),y=(0,a.typeOf)(w.value);if("object"!=y&&"array"!=y)throw new Error("duplicate/1 neither an object nor an array: "+r);if("array"==y){if("number"!=typeof x||x%1!=0)throw new Error("duplicate/2 invalid index: "+r);if(x<0||x>=w.value.length)throw new Error("duplicate/3 out of range: "+r);var g=w.value[x],m=(0,s.default)(x,g,w.value),E=h(m);l=(0,i.default)(c,E,n.tree),f=n.trackUpdate?b(n.updatePoint,d):n.updatePoint;return e(e({},n),{tree:l,updatePoint:f})}if("string"!=typeof x)throw new Error("replace/4 invalid name: "+r);if(!(x in w.value))throw new Error("replace/5 undefined property: "+r);g=w.value[x];var k=e(e({},w.value),((o={})[x]=g,o));E=h(k),l=(0,i.default)(c,E,n.tree),f=n.trackUpdate?b(n.updatePoint,d):n.updatePoint;return e(e({},n),{tree:l,updatePoint:f})};exports.duplicate=A;var B=function(t,a,n){var o;if(null===a){var u=n.extra,i=t,d=(u[i],r(u,["symbol"==typeof i?i:i+""]));return e(e({},n),{extra:d})}d=e(e({},n.extra),((o={})[t]=a,o));return e(e({},n),{extra:d})};exports.setExtra=B;var C=function(e,r){return r.extra[e]||null};exports.getExtra=C;var F=function(t,a,n){if(t)return e(e({},n),{ret:t,onPromiseThen:a});n.ret,n.onPromiseThen;return r(n,["ret","onPromiseThen"])};exports.setPortal=F;var G=function(e){if(!e.ret)throw new Error("doReturn/0: no ret");e.ret(e)};exports.doReturn=G;var H=function(e){return null!=e&&"object"==typeof e&&"tree"in e};exports.isStore=H;
},{"./utils":"hIne"}],"iz0v":[function(require,module,exports) {
"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.run=void 0;var e=r(require("../src/core/store"));function t(e){if("function"!=typeof WeakMap)return null;var r=new WeakMap,d=new WeakMap;return(t=function(e){return e?d:r})(e)}function r(e,r){if(!r&&e&&e.__esModule)return e;if(null===e||"object"!=typeof e&&"function"!=typeof e)return{default:e};var d=t(r);if(d&&d.has(e))return d.get(e);var a={},i=Object.defineProperty&&Object.getOwnPropertyDescriptor;for(var n in e)if("default"!==n&&Object.prototype.hasOwnProperty.call(e,n)){var o=i?Object.getOwnPropertyDescriptor(e,n):null;o&&(o.get||o.set)?Object.defineProperty(a,n,o):a[n]=e[n]}return a.default=e,d&&d.set(e,a),a}function d(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var d=Object.getOwnPropertySymbols(e);t&&(d=d.filter(function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable})),r.push.apply(r,d)}return r}function a(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?d(Object(r),!0).forEach(function(t){i(e,t,r[t])}):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):d(Object(r)).forEach(function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))})}return e}function i(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}const n=(e,t)=>({"@value":e}),o=(t,r)=>{const d={name:"Bob",age:24,buddies:["Mam","Dad"]};let i=e.makeStore(d,{},n,!0);t(1,()=>e.get("/name",i),"Bob"),t(1.1,()=>e.test("/name",i),!0),t(1.2,()=>e.test("/foo",i),!1),i=e.add("/email","info@example.com",i),t(2,()=>e.get("/email",i),"info@example.com"),r(2.1,()=>e.get("/foo",i),"get/"),t(3,()=>e.get("/buddies/1",i),"Dad"),i=e.add("/buddies/1","Pochi",i),t(4,()=>e.get("/buddies/1",i),"Pochi"),r(4.1,()=>e.get("/buddies/5",i),"get/"),i=e.add("/buddies/-","Komino",i),t(5,()=>e.get("/buddies/3",i),"Komino"),i=e.remove("/buddies/3",i),t(6,()=>e.get("/buddies",i).join(","),"Mam,Pochi,Dad"),r(6.1,()=>e.get("/buddies/3",i),"get/"),i=e.remove("/email",i),r(7,()=>e.get("/email",i),"get/"),r(7.1,()=>e.remove("/email",i),"remove/"),t(8,()=>{let t=e.getMdr("/name",i);return t=a(a({},t),{},{invalid:!0}),i=e.setMdr("/name",t,i),(t=e.getMdr("/name",i)).invalid},!0),i=e.replace("/age",30,i),t(9,()=>e.get("/age",i),30);let o=e.replace("",{foo:1},i);t(9.1,()=>e.get("/foo",o),1),r(9.2,()=>e.get("/age",o),"get/"),i=e.add("/id","TS1101",i),i=e.move("/id","/employeeId",i),t(10,()=>e.get("/employeeId",i),"TS1101"),r(10.1,()=>e.get("/id",i),"get/"),i=e.copy("/employeeId","/id",i),t(11,()=>e.get("/employeeId",i),"TS1101"),t(11.1,()=>e.get("/id",i),"TS1101"),t(11.9,()=>e.get("/buddies",i).join(","),"Mam,Pochi,Dad"),i=e.move("/buddies/2","/buddies/0",i),t(12,()=>e.get("/buddies",i).join(","),"Dad,Mam,Pochi"),i=e.copy("/buddies/0","/buddies/2",i),t(13,()=>e.get("/buddies",i),"Dad,Mam,Dad,Pochi"),i=e.mapDeep((e,t)=>a(a({},e),{},{message:"yeah"}),"/buddies",i),t(14,()=>e.getMdr("/buddies",i).message,"yeah"),t(14.1,()=>e.getMdr("/buddies/0",i).message,"yeah"),t(14.2,()=>e.getMdr("/name",i).message||"",""),t(15,()=>e.reduceDeep((e,t,r)=>"/buddies"==r?e:e+`[${t.value}]`,"","/buddies",i),"[Dad][Mam][Dad][Pochi]"),i=e.makeStore(d,{},n,!0),t(16,()=>e.endUpdateTracking(i)[0],""),i=e.endUpdateTracking(i)[1],i=e.beginUpdateTracking(i),i=e.replace("/age",30,i),t(16.1,()=>e.endUpdateTracking(i)[0],"/age"),i=e.add("/name","Jack",i),t(16.2,()=>e.endUpdateTracking(i)[0],""),i=e.makeStore(d,{},n,!1),i=e.beginUpdateTracking(i),i=e.add("/buddies/-","Puppy",i),t(16.3,()=>e.endUpdateTracking(i)[0],"/buddies"),i=e.remove("/name",i),t(16.4,()=>e.endUpdateTracking(i)[0],"")};exports.run=o;
},{"../src/core/store":"Vo52"}],"jk6V":[function(require,module,exports) {
"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.minItems=exports.maxItems=exports.pattern=exports.minLength=exports.maxLength=exports.exclusiveMinimum=exports.minimum=exports.exclusiveMaximum=exports.maximum=exports.multipleOf=exports.$if=exports.same=exports.switchRequired=exports.required=exports.notEmpty=exports.$const=exports.$enum=exports.type=void 0;var e=require("./utils"),r=require("./schema"),t=function(e,t){if(!t)return!0;if(null===e)return(0,r.nullable)(t);switch(t){case"null":return!1;case"number":case"number?":return"number"==typeof e;case"integer":case"integer?":return"number"==typeof e&&e%1==0;case"boolean":case"boolean?":return"boolean"==typeof e;case"string":return"string"==typeof e;case"object":case"object?":return"object"==typeof e&&null!==e;case"array":case"array?":return Array.isArray(e);default:throw new Error("unknown type: "+t)}},n=function(e,r){if("string"!=typeof e)throw new Error("invalid type");return!!t(r,e)||{code:"type."+e}};exports.type=n;var i=function(e,r){if(!Array.isArray(e))throw new Error("invalid parameter");for(var t=0;t<e.length;t++)if(e[t]===r)return!0;return{code:"rule.enum"}};exports.$enum=i;var o=function(r,t){if(r===t)return!0;switch((0,e.typeOf)(r)){case"string":case"number":case"null":case"boolean":return{code:"rule.const",hint:r};default:return{code:"rule.const.nohint"}}};exports.$const=o;var u=function(r,t){return"string"!=(0,e.typeOf)(t)||(""!==t||{code:"rule.notEmpty"})};exports.notEmpty=u;var a=function(r,t){if(!Array.isArray(r))throw new Error("invalid parameter");if("object"!=(0,e.typeOf)(t))return!0;for(var n=0;n<r.length;n++)if(!t.hasOwnProperty(r[n]))return{code:"rule.required",hint:r[n]};return!0};exports.required=a;var s=function(r,t,n){if("object"!=(0,e.typeOf)(r)||!("tagProperty"in r))throw new Error("invalid parameter");if("object"!=(0,e.typeOf)(t))return!0;var i=n("0/"+(r=r).tagProperty);if(!i)return{code:"rule.switchRequired.nohint",decription:"no tag"};if(!r.types[i])return{code:"rule.switchRequired.nohint",detail:"no type"};var o=r.types[i];if(!Array.isArray(o))throw new Error("invalid parameter");for(var u=0;u<o.length;u++)if(!t.hasOwnProperty(o[u]))return{code:"rule.switchRequired",hint:o[u]};return!0};exports.switchRequired=s;var p=function(r,t,n){if("string"!=typeof r)throw new Error("invalid parameter");var i=n(r);if(i!==t)switch((0,e.typeOf)(i)){case"string":case"number":case"null":case"boolean":return{code:"rule.same",hint:i};default:return{code:"rule.same.nohint"}}return!0};exports.same=p;var c=function(t,n,i,o){if("array"!=(0,e.typeOf)(t))throw new Error("invalid parameter");var u=t,a=u[0],s=u[1],p=u[2],c=u[3],m=void 0===c?{}:c;if(!a||!s||!p)throw new Error("invalid parameter");var l=i(a);return!0===(0,r.applyRules)(l,s,i,o)?(0,r.applyRules)(n,p,i,o):(0,r.applyRules)(n,m,i,o)};exports.$if=c;var m=function(e,r){if("number"!=typeof e)throw new Error("invalid parameter");return"number"!=typeof r||(r%e==0||{code:"rule.multipleOf",hint:e})};exports.multipleOf=m;var l=function(e,r){return"number"!=typeof r||(e>=r||{code:"rule.maximum",hint:e})};exports.maximum=l;var f=function(e,r){return"number"!=typeof r||(e>r||{code:"rule.exclusiveMaximum",hint:e})};exports.exclusiveMaximum=f;var y=function(e,r){return"number"!=typeof r||(e<=r||{code:"rule.minimum",hint:e})};exports.minimum=y;var x=function(e,r){return"number"!=typeof r||(e<r||{code:"rule.exclusiveMinimum",hint:e})};exports.exclusiveMinimum=x;var h=function(e,r){return"string"!=typeof r||(r.length<=e||{code:"rule.maxLength",hint:e})};exports.maxLength=h;var d=function(e,r){return"string"!=typeof r||(r.length>=e||{code:"rule.minLength",hint:e})};exports.minLength=d;var v=function(e,r){if("string"!=typeof e)throw new Error("invalid parameter");return"string"!=typeof r||(!!new RegExp(e).test(r)||{code:"rule.pattern",hint:e})};exports.pattern=v;var w=function(e,r){if("number"!=typeof e)throw new Error("invalid parameter");return!Array.isArray(r)||(r.length<=e||{code:"rule.maxItems",hint:e})};exports.maxItems=w;var g=function(e,r){if("number"!=typeof e)throw new Error("invalid parameter");return!Array.isArray(r)||(r.length>=e||{code:"rule.minItems",hint:e})};exports.minItems=g;
},{"./utils":"hIne","./schema":"lOJd"}],"lOJd":[function(require,module,exports) {
"use strict";var e=this&&this.__assign||function(){return(e=Object.assign||function(e){for(var t,r=1,n=arguments.length;r<n;r++)for(var i in t=arguments[r])Object.prototype.hasOwnProperty.call(t,i)&&(e[i]=t[i]);return e}).apply(this,arguments)},t=this&&this.__createBinding||(Object.create?function(e,t,r,n){void 0===n&&(n=r),Object.defineProperty(e,n,{enumerable:!0,get:function(){return t[r]}})}:function(e,t,r,n){void 0===n&&(n=r),e[n]=t[r]}),r=this&&this.__setModuleDefault||(Object.create?function(e,t){Object.defineProperty(e,"default",{enumerable:!0,value:t})}:function(e,t){e.default=t}),n=this&&this.__importStar||function(e){if(e&&e.__esModule)return e;var n={};if(null!=e)for(var i in e)"default"!==i&&Object.prototype.hasOwnProperty.call(e,i)&&t(n,e,i);return r(n,e),n};Object.defineProperty(exports,"__esModule",{value:!0}),exports.coerce=exports.applyRules=exports.validate=exports.defaultRules=exports.buildDb=exports.nullable=void 0;var i=require("./utils"),u=n(require("./rules")),a=function(e){if(!e)return!0;var t=e.charAt(e.length-1);return"null"==e||"?"==t};exports.nullable=a;var o=function(e){var t={},r=function(e,n){switch(t[n]=e,e.type){case"object":case"object?":for(var i in e.properties)r(e.properties[i],n+"/"+i);break;case"array":case"array?":r(e.items,n+"/*")}};return r(e,""),t};exports.buildDb=o,exports.defaultRules={type:u.type,enum:u.$enum,const:u.$const,notEmpty:u.notEmpty,required:u.required,switchRequired:u.switchRequired,same:u.same,if:u.$if,multipleOf:u.multipleOf,maximum:u.maximum,exclusiveMaximum:u.exclusiveMaximum,minimum:u.minimum,exclusiveMinimum:u.exclusiveMinimum,maxLength:u.maxLength,minLength:u.minLength,pattern:u.pattern,maxItems:u.maxItems,minItems:u.minItems};var l=function(t){return function(r,n,u,a){if(!(0,i.isJsonValue)(r)){if(u&&u.type){var o={code:"type."+u.type,detail:"given value: "+r};return e(e({},n),{value:r,invalid:!0,error:o})}o={code:"value",detail:"given value: "+r};return e(e({},n),{value:r,invalid:!0,error:o})}if(u){var l=(0,exports.applyRules)(r,u,a,t);if(!0!==l)return e(e({},n),{value:r,invalid:!0,error:l})}return e(e({},n),{value:r,invalid:!1,error:null})}};exports.validate=l;var c=function(e,t,r,n){for(var i in t){var u=n[i];if(u){var a=u(t[i],e,r,n);if(!0!==a)return a}}return!0};exports.applyRules=c;var s=function(e,t,r){if(e=""+e,!r)throw new Error("coerce/0: no schema");if(!r.type||"string"!=typeof r.type)throw new Error("coerce/1: type not specified");var n=r.type;if(-1==["null","boolean","boolean?","integer","integer?","number","number?","string"].indexOf(n))throw new Error("coerce/2: not a coercion enabled type: "+n);switch(n){case"null":break;case"number":case"number?":var i=+e;if(""+i===e)return{value:i,input:e,touched:t.touched};break;case"integer":case"integer?":var u=+e;if(""+u===e&&u%1==0)return{value:u,input:e,touched:t.touched};break;case"boolean":case"boolean?":if("true"===e||"false"===e)return{value:"true"===e,input:e,touched:t.touched};break;case"string":return{value:e,input:e,touched:t.touched}}return""==e&&(0,exports.nullable)(n)?{value:null,input:e,touched:t.touched}:{input:e,touched:t.touched}};exports.coerce=s;
},{"./utils":"hIne","./rules":"jk6V"}],"zpTb":[function(require,module,exports) {
"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.run=void 0;var e=l(require("../src/core/schema"));function i(e){if("function"!=typeof WeakMap)return null;var l=new WeakMap,a=new WeakMap;return(i=function(e){return e?a:l})(e)}function l(e,l){if(!l&&e&&e.__esModule)return e;if(null===e||"object"!=typeof e&&"function"!=typeof e)return{default:e};var a=i(l);if(a&&a.has(e))return a.get(e);var n={},t=Object.defineProperty&&Object.getOwnPropertyDescriptor;for(var r in e)if("default"!==r&&Object.prototype.hasOwnProperty.call(e,r)){var v=t?Object.getOwnPropertyDescriptor(e,r):null;v&&(v.get||v.set)?Object.defineProperty(n,r,v):n[r]=e[r]}return n.default=e,a&&a.set(e,n),n}function a(e,i){var l=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);i&&(a=a.filter(function(i){return Object.getOwnPropertyDescriptor(e,i).enumerable})),l.push.apply(l,a)}return l}function n(e){for(var i=1;i<arguments.length;i++){var l=null!=arguments[i]?arguments[i]:{};i%2?a(Object(l),!0).forEach(function(i){t(e,i,l[i])}):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(l)):a(Object(l)).forEach(function(i){Object.defineProperty(e,i,Object.getOwnPropertyDescriptor(l,i))})}return e}function t(e,i,l){return i in e?Object.defineProperty(e,i,{value:l,enumerable:!0,configurable:!0,writable:!0}):e[i]=l,e}const r=(i,l,a)=>{const t=e.validate(e.defaultRules),r=e.coerce;let v=null;v={type:"null"},i(1,()=>t(null,{},v).invalid,!1),i(1.1,()=>t(1,{},v).invalid,!0),i(1.2,()=>t("abc",{},v).invalid,!0),i(1.3,()=>r("",{},v).value,null),a(1.4,()=>r("abc",{},v).value),i(1.5,()=>t(void 0,{},v).invalid,!0),v=null,i(2,()=>t(null,{},v).invalid,!1),i(2.1,()=>t(10,{},v).invalid,!1),i(2.2,()=>t([],{},v).invalid,!1),l(2.3,()=>r("",{},v),"coerce/"),l(2.4,()=>r("aaa",{},v),"coerce/"),i(2.5,()=>t(void 0,{},v).invalid,!0),v={type:"boolean"},i(3,()=>t(null,{},v).invalid,!0),i(3.1,()=>t(1,{},v).invalid,!0),i(3.2,()=>t(!0,{},v).invalid,!1),a(3.3,()=>r("",{},v).value),i(3.4,()=>r("false",{},v).value,!1),a(3.5,()=>r("abc",{},v).value),i(3.6,()=>r("true",{},v).value,!0),v={type:"boolean?"},i(4,()=>t(null,{},v).invalid,!1),i(4.1,()=>t(1,{},v).invalid,!0),i(4.2,()=>t(!0,{},v).invalid,!1),i(4.3,()=>r("",{},v).value,null),i(4.4,()=>r("false",{},v).value,!1),a(4.5,()=>r("abc",{},v).value),v={type:"integer"},i(5,()=>t(null,{},v).invalid,!0),i(5.1,()=>t(1,{},v).invalid,!1),i(5.2,()=>t(!0,{},v).invalid,!0),a(5.3,()=>r("",{},v).value),i(5.4,()=>r("10",{},v).value,10),a(5.5,()=>r("abc",{},v).value),i(5.6,()=>t(132,{},v).value,132),v={type:"integer?"},i(6,()=>t(null,{},v).invalid,!1),i(6.1,()=>t(1,{},v).invalid,!1),i(6.2,()=>t(!0,{},v).invalid,!0),i(6.3,()=>r("",{},v).value,null),i(6.4,()=>r("10",{},v).value,10),a(6.5,()=>r("10.3",{},v).value),i(6.6,()=>r("132",{},v).value,132),v={type:"number"},i(7,()=>t(null,{},v).invalid,!0),i(7.1,()=>t(1.2,{},v).invalid,!1),i(7.2,()=>t(!0,{},v).invalid,!0),a(7.3,()=>r("",{},v).value),i(7.4,()=>r("10.3",{},v).value,10.3),a(7.5,()=>r("abc",{},v).value),v={type:"number?"},i(8,()=>t(null,{},v).invalid,!1),i(8.1,()=>t(1.2,{},v).invalid,!1),i(8.2,()=>t(!0,{},v).invalid,!0),i(8.3,()=>r("",{},v).value,null),i(8.4,()=>r("10.3",{},v).value,10.3),a(8.5,()=>r("abc",{},v).value),v={type:"string"},i(9,()=>t(null,{},v).invalid,!0),i(9.1,()=>t("",{},v).invalid,!1),i(9.2,()=>t(!0,{},v).invalid,!0),i(9.3,()=>t("abc",{},v).invalid,!1),i(9.4,()=>r("",{},v).value,""),i(9.5,()=>r("abc",{},v).value,"abc"),v={type:"object"},i(10,()=>t(null,{},v).invalid,!0),i(10.1,()=>t("",{},v).invalid,!0),i(10.2,()=>t({},v).invalid,!1),l(10.3,()=>r("",{},v),"coerce/"),v={type:"object?"},i(11,()=>t(null,{},v).invalid,!1),i(11.1,()=>t("",{},v).invalid,!0),i(11.2,()=>t({},{},v).invalid,!1),l(11.3,()=>r("",{},v),"coerce/"),v={type:"array"},i(12,()=>t(null,{},v).invalid,!0),i(12.1,()=>t("",{},v).invalid,!0),i(12.2,()=>t([],{},v).invalid,!1),l(12.3,()=>r("",{},v),"coerce/"),v={type:"array?"},i(13,()=>t(null,{},v).invalid,!1),i(13.1,()=>t("",{},v).invalid,!0),i(13.2,()=>t([],{},v).invalid,!1),l(13.3,()=>r("",{},v),"coerce/"),v={type:"integer?",enum:[1]},i(14,()=>t(null,{},v).invalid,!0),i(14.1,()=>t(1,{},v).invalid,!1),i(14.2,()=>t(3,{},v).invalid,!0),v={type:"number",const:3.2},i(15,()=>t(3.2,{},v).invalid,!1),i(15.1,()=>t(3,{},v).invalid,!0),v={type:"object",required:["foo","bar"]},i(16,()=>t({foo:1,bar:1},{},v).invalid,!1),i(16.1,()=>t({foo:1},{},v).invalid,!0),i(16.2,()=>t({foo:1,bar:1,baz:1},{},v).invalid,!1),i(16.3,()=>t(1,{},n(n({},v),{},{type:"integer"})).invalid,!1),v={type:"object",switchRequired:{tagProperty:"type",types:{infix:["type","op","lhs","rhs"],app:["type","f","arg"],var:["type","var"],lit:["type","val"],lambda:["type","param","expr"]}}};let d={type:"infix",op:"*",lhs:{type:"var",var:"n"},rhs:{type:"app",f:"fact",arg:{type:"infix",op:"-",lhs:{type:"var",var:"n"},rhs:{type:"lit"}}}};i(17,()=>t(d,{},v,e=>"infix").invalid,!1),i(17.1,()=>t(d.lhs,{},v,e=>"var").invalid,!1),i(17.2,()=>t(d.rhs.arg.rhs,{},v,e=>"lit").invalid,!0),i(17.3,()=>t(1,{},n(n({},v),{},{type:"integer"})).invalid,!1),v={type:"number?",multipleOf:1.2},i(18,()=>t(-2.4,{},v).invalid,!1),i(18.1,()=>t(1.5,{},v).invalid,!0),i(18.2,()=>t(null,{},v).invalid,!1),i(18.3,()=>t(!0,{},n(n({},v),{},{type:"boolean"})).invalid,!1),v={type:"integer?",maximum:10},i(19,()=>t(10,{},v).invalid,!1),i(19.1,()=>t(11,{},v).invalid,!0),i(19.2,()=>t(null,{},v).invalid,!1),i(19.3,()=>t(!0,{},n(n({},v),{},{type:"boolean"})).invalid,!1),v={type:"integer?",exclusiveMaximum:10},i(20,()=>t(9,{},v).invalid,!1),i(20.1,()=>t(10,{},v).invalid,!0),i(20.2,()=>t(null,{},v).invalid,!1),i(20.3,()=>t(!0,{},n(n({},v),{},{type:"boolean"})).invalid,!1),v={type:"integer?",minimum:10},i(21,()=>t(10,{},v).invalid,!1),i(21.1,()=>t(9,{},v).invalid,!0),i(21.2,()=>t(null,{},v).invalid,!1),i(21.3,()=>t(!0,{},n(n({},v),{},{type:"boolean"})).invalid,!1),v={type:"integer?",exclusiveMinimum:10},i(20,()=>t(10,{},v).invalid,!0),i(20.1,()=>t(11,{},v).invalid,!1),i(20.2,()=>t(null,{},v).invalid,!1),i(20.3,()=>t(!0,{},n(n({},v),{},{type:"boolean"})).invalid,!1),v={type:"string",maxLength:3},i(21,()=>t("abc",{},v).invalid,!1),i(21.1,()=>t("abcd",{},v).invalid,!0),i(21.2,()=>t("",{},v).invalid,!1),i(21.3,()=>t(!0,{},n(n({},v),{},{type:"boolean"})).invalid,!1),v={type:"string",minLength:3},i(21,()=>t("abd",{},v).invalid,!1),i(21.1,()=>t("ab",{},v).invalid,!0),i(21.2,()=>t("",{},v).invalid,!0),i(21.3,()=>t(!0,{},n(n({},v),{},{type:"boolean"})).invalid,!1),v={type:"string",pattern:"^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:.[a-zA-Z0-9-]+)*$"},i(22,()=>t("info@example.com",{},v).invalid,!1),i(22.1,()=>t("192.168.0.1",{},v).invalid,!0),i(22.2,()=>t(!0,{},n(n({},v),{},{type:"boolean"})).invalid,!1),v={type:"array?",maxItems:3},i(23,()=>t([1,2,3],{},v).invalid,!1),i(23.1,()=>t([1,2,3,4],{},v).invalid,!0),i(23.2,()=>t(null,{},v).invalid,!1),i(23.3,()=>t(!0,{},n(n({},v),{},{type:"boolean"})).invalid,!1),v={type:"array?",minItems:4},i(24,()=>t([1,2,3],{},v).invalid,!0),i(24.1,()=>t([1,2,3,4],{},v).invalid,!1),i(24.2,()=>t(null,{},v).invalid,!1),i(24.3,()=>t(!0,{},n(n({},v),{},{type:"boolean"})).invalid,!1),v={type:"string",same:"/first"},d={first:"a",second:"a"},i(25,()=>t("a",{},v,e=>"a").invalid,!1),i(25.1,()=>t("b",{},v,e=>"a").invalid,!0),v={same:"/first"},i(25.2,()=>t("a",{},v,e=>"a").invalid,!1),v={type:"object?",properties:{at:{type:"string"},to:{type:"string"}},required:["at","to"],if:["/status",{enum:["shipped","refunded"]},{type:"object"}]},i(26,()=>t(null,{},v,e=>"new",e.defaultRules).invalid,!1),i(26.1,()=>t(null,{},v,e=>"shipped",e.defaultRules).invalid,!0),i(26.2,()=>t({at:"a",to:"b"},{},v,e=>"new",e.defaultRules).invalid,!1),i(26.3,()=>t({at:"a",to:"b"},{},v,e=>"shipped",e.defaultRules).invalid,!1),v={type:"object?",properties:{at:{type:"string"},to:{type:"string"}},required:["at","to"],if:["/status",{enum:["shipped","refunded"]},{type:"object"},{type:"null"}]},i(26.4,()=>t(null,{},v,e=>"new",e.defaultRules).invalid,!1),i(26.5,()=>t(null,{},v,e=>"shipped",e.defaultRules).invalid,!0),i(26.6,()=>t({at:"a",to:"b"},{},v,e=>"new",e.defaultRules).invalid,!0),i(26.7,()=>t({at:"a",to:"b"},{},v,e=>"shipped",e.defaultRules).invalid,!1)};exports.run=r;
},{"../src/core/schema":"lOJd"}],"l6QX":[function(require,module,exports) {
"use strict";var e=n(require("./utils")),o=n(require("./store")),r=n(require("./schema"));function t(e){if("function"!=typeof WeakMap)return null;var o=new WeakMap,r=new WeakMap;return(t=function(e){return e?r:o})(e)}function n(e,o){if(!o&&e&&e.__esModule)return e;if(null===e||"object"!=typeof e&&"function"!=typeof e)return{default:e};var r=t(o);if(r&&r.has(e))return r.get(e);var n={},l=Object.defineProperty&&Object.getOwnPropertyDescriptor;for(var s in e)if("default"!==s&&Object.prototype.hasOwnProperty.call(e,s)){var c=l?Object.getOwnPropertyDescriptor(e,s):null;c&&(c.get||c.set)?Object.defineProperty(n,s,c):n[s]=e[s]}return n.default=e,r&&r.set(e,n),n}const l=(e,o,r)=>{const t=o();t==r?console.log("- ASSERTION",e,"OK"):console.log("! ASSERTION",e,"NG",t,r)},s=(e,o)=>{const r=o();void 0===r?console.log("- ASSERTION",e,"OK"):console.log("! ASSERTION",e,"NG",r,"undefined")},c=(e,o,r)=>{let t=null;try{o();t="no error"}catch(n){if(n instanceof Error&&n.message.startsWith(r))return void console.log("- ASSERTION",e,"OK");t="matching failure: "+n.message}console.log("! ASSERTION",e,"NG",t)},u=(e,o)=>{console.log("TEST START: "+o),e.run(l,c,s),console.log("TEST DONE: "+o),console.log("")};u(e,"utils"),u(o,"store"),u(r,"schema");
},{"./utils":"FOZT","./store":"iz0v","./schema":"zpTb"}]},{},["l6QX"], null)
//# sourceMappingURL=/_index.js.map