!function(e,n){"object"==typeof exports&&"undefined"!=typeof module?n(exports):"function"==typeof define&&define.amd?define(["exports"],n):n(e["@orby/css"]={})}(this,function(e){var n={};function t(e){return e.trim?e.trim():e.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g,"")}function r(e){var n=[],r=[],a={selector:e=t(e),children:n,type:"selector",properties:r},s=e.match(/^\@(\w+) (.+)/);return s?{selector:s[0],type:s[1],value:s[2],children:n,properties:r}:(a.selectors=function(e){var n=(e=t(e)).length,r="",a=0,s=[],c=[],u="",o=0,i=0,l={value:"",args:[]},f=function(e){return-1===c.indexOf(e)&&c.push(e)},p=function(e){return-1===s.indexOf(e)&&s.push(e)};p(l);for(var h=0;h<n;h++)if(r=e[h],o||i)u+=r,"'"!==r&&'"'!==r||("'"===r?o=!1:i=!1);else switch(r){case":":":"===e[h-1]?l.value+=":":l.value?(p(l),p(l={value:":",args:[]})):l.value=":",u="";break;case"(":case")":"("==r?a++||(u=""):--a||(l.args.push(u),u="");break;case"'":case'"':"'"===r?o++:i++,u+=r;break;case",":a?(l.args.push(u),u=""):(s.length&&f(s),l.value&&p(l),f(s=[l={value:"",args:[]}]));break;case"\n":continue;default:a?u+=r:l.value+=r}return l.value&&p(l),s.length&&f(s),c}(a.selector),a)}function a(e){var n,s,c="",u=0,o=[],i=0,l=0,f=[];e=t(e).replace(/([^\:]+):([^\;]+){0,1}}/g,"$1:$2;}");for(var p=0;p<e.length;p++)if(n=e[p],"\\"!==e[p-1])if(i||l)c+=n,"'"!==n&&'"'!==n||("'"===n?i=!1:l=!1);else switch(n){case";":if(/\{/.test(c))c+=n;else{var h=(c=t(c)).match(/^([\w\<\-]+)(\s*):(.+)/)||[],v=h[1],d=v?c.slice(v.length+h[2].length+1):"";v&&d?s.properties.push({index:v,value:t(d)}):c&&o.push(r(c)),c=""}break;case"{":u++?c+=n:(s=r(c),o.push(s),c="");break;case"}":if(--u)f.push(c+=n);else{for(var m=[],g=0;g<f.length;g++)m=m.concat(a(f[g]));s.children=m,f=[]}c="";break;case"'":i=!0,c+=n;break;case'"':l=!0,c+=n;break;default:c+=n}else c+=n;return o}var s=0;function c(e){var t=n.document||document;return n.HTMLInstances||(n.HTMLInstances={}),n.HTMLInstances[e]||(n.HTMLInstances[e]=t.createElement(e)),n.HTMLInstances[e]}function u(e){return e.map(function(e){var n=e.args;return e.value+(n.length?"("+n.join(",")+")":"")}).join(":")}function o(e,n,t,r){void 0===r&&(r=0);var a=[],s="."+n,c=e.selectors.map(function(e){var n=e[0],a=n.value,c=n.args,o=e.slice(1);switch(a=a.replace(/(\s+)$/," ")){case":host":return c.length?c.map(function(e){return s+e}):s;case":global":return c.join(",");case"& ":case"&":return t+("&"===a?"":" ")+u(o);default:return r?(t?t+" ":"")+a+u(o):s+" "+(a+u(o))}}),i=e.properties.map(function(e){var t=e.index,r=e.value;return/^animation(-name){0,1}$/.test(t)&&(r=n+r),t+":"+r});return i.length&&a.push(c.join(",")+"{"+i.join(";")+"}"),e.children.map(function(e){(e=c.map(function(t){return o(e,n,t,r+1)})).length&&(a=a.concat.apply(a,e))}),a}function i(e,n,t){return void 0===t&&(t=""),e.reduce(function(e,t){switch(t.type){case"keyframes":return e.concat("@keyframes "+(n+t.value)+"{"+t.children.map(function(e){return o(e,n,"",1)}).join("")+"}");case"media":case"supports":return e.concat("@media "+t.value+"{"+t.children.map(function(e){return o(e,n)}).join("")+"}");case"selector":return e.concat(o(t,n));case"import":return e.concat(t.selector+";");default:return e}},[])}function l(e,n){var t={},r="--cn-"+s++,c=0,u=e.map(function(e,a){if("function"==typeof n[a]){var s=r+"-"+c++;t[s]=n[a],e+="var("+s+")"}else e+=n[a]||"";return e}).join("");return{space:r,rules:i(a(u),r),customVars:t}}e.getTagInstance=c,e.stateToArgs=u,e.createRuleSelector=o,e.createStaticCss=i,e.transpile=l,e.createStyled=function(e,t){return function(r){var a="function"==typeof r,s=a?{}:c(r)||{};return function(c){for(var u=[],o=arguments.length-1;o-- >0;)u[o]=arguments[o+1];var i=l(c,u),f=i.space,p=i.rules,h=i.customVars,v=n.document||document,d=v.getElementById(f),m=d||v.createElement("style");return d||(m.id=f,v.head.appendChild(m)),m.sheet&&!n.disableSheet?p.map(function(e,n){return m.sheet.insertRule(e,n)}):m.innerHTML=p.join(""),function(n,c){var u=t?"object"==typeof n.style?n.style:{}:"string"==typeof n.style?n.style:"",o={},i=[f];for(var l in(n.className||n.class)&&i.push(n.className||n.class),h){var p=h[l](n,c);t?u[l]=p:p&&(u+=l+":"+p+";")}for(var v in n)(a||"function"==typeof n[v]||v in s)&&(o[v]=n[v]);return o.className=i.join(" "),o.style=u,e(r,o,n.children)}}}},e.parse=a,e.options=n});
//# sourceMappingURL=orby-css.umd.js.map
