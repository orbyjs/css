function a(a){return a.trim?a.trim():a.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g,"")}function s(s){var n=[],i=[],f={selector:s=a(s),children:n,type:"selector",properties:i},h=s.match(/^\@(\w+) (.+)/);return h?{selector:h[0],type:h[1],value:h[2],children:n,properties:i}:(f.selectors=function(s){s=a(s);for(var n,i="",f=0,h=[],m=[],p=0;p<s.length;p++){var v=s[p];"("===v?f++?i+=v:(m=[],n=i,i=""):")"===v?--f?i+=v:(m.push(i),h.push({name:n,args:m}),i="",m=[]):","===v?(i&&(f?m.push(i):h.push({name:i})),i=""):i+=v}return i&&h.push({name:i,args:m}),h}(f.selector),f)}function n(i){var f,h,m="",p=0,v=[],c=0,g=0,o=[];i=a(i).replace(/([^\:]+):([^\;]+){0,1}}/g,"$1:$2;}");for(var j=0;j<i.length;j++)if(f=i[j],"\\"!==i[j-1])if(c||g)m+=f,"'"!==f&&'"'!==f||("'"===f?c=!1:g=!1);else switch(f){case";":if(/\{/.test(m))m+=f;else{var y=(m=a(m)).match(/^([\w\<\-]+)(?:\s*):(.+)/)||[],d=y[1],k=y[2];d&&k?h.properties.push({index:d,value:a(k)}):m&&v.push(s(m)),m=""}break;case"{":p++?m+=f:(h=s(m),v.push(h),m="");break;case"}":if(--p)o.push(m+=f);else{for(var x=[],E=0;E<o.length;E++)x=x.concat(n(o[E]));h.children=x,o=[]}m="";break;case"'":c=!0,m+=f;break;case'"':g=!0,m+=f;break;default:m+=f}else m+=f;return v}function i(a,s){var n={};for(var i in a)Object.prototype.hasOwnProperty.call(a,i)&&-1===s.indexOf(i)&&(n[i]=a[i]);return n}var f={index:0},h="css-",m=/<<id>>/g,p=/<<(?:\:){0,1}(\d+)>>(\;){0,1}/g,v=/^animation(-name){0,1}$/,c="<<id>>";function g(a){for(var s=[],n=[],f=0;f<a.length;f++){for(var h=a[f],m=h.properties,c=i(h,["properties"]),o=m.length,j=[],y=[],d=0;d<o;d++){var k=m[d],x=k.value,E=k.index;p.test(x)||v.test(E)?j.push({value:x,index:E}):y.push({value:x,index:E})}if(o)j.length&&s.push(Object.assign({},c,{properties:j})),y.length&&n.push(Object.assign({},c,{properties:y}));else switch(c.type){case"media":case"supports":var O=g(c.children);s=s.concat(Object.assign({},c,{properties:[],children:O.locals})),n=n.concat(Object.assign({},c,{properties:[],children:O.globals}));break;default:n.push(Object.assign({},c,{properties:[]}))}}return{globals:n,locals:s}}function o(a,s,n,i,f){if(!i){var h=g(a);a=h.locals.concat(h.globals)}if(a=a.map(function(a){switch(a.type){case"keyframes":return"@keyframes "+s+"-"+a.value+"{"+o(a.children,"","",!0,!0)+"}";case"media":return"@media "+a.value+"{"+o(a.children,s,n,!0)+"}";case"selector":return a.selectors.map(function(a){var i=a.name;return/:host/.test(a.name)?a.args.length&&(i=a.args.map(function(s){return""+a.name+s}).join(",")):/:global/.test(a.name)?i=a.args.join(","):f||(i=":host "+a.name+(a.args.length>0?"("+a.args+")":"")),i.replace(/:host/g,n+s)}).join(",")+"{"+a.properties.map(function(a){var n=a.index,i=a.value;return v.test(n)&&(i=i.replace(/(\s*)/,s+"-$1")),n+":"+i}).join(";")+"}";case"import":return a.selector+";";default:return""}}),!i){var m="",c="";return a.forEach(function(a){p.test(a)?c+=a:m+=a}),{globals:m,locals:c}}return a.join("")}exports.current=f,exports.optimizeRules=g,exports.rulesToCss=o,exports.create=function(a){return function(s,i){void 0===i&&(i=[]);var v,g,j="function"==typeof s;switch(s){case"a":v=HTMLLinkElement;break;case"svg":v=SVGElement;break;case"img":v=HTMLImageElement;break;case"button":v=HTMLButtonElement;break;case"input":v=HTMLInputElement;break;default:v=HTMLElement}g=v.prototype;var y=document.createElement("style");return y.dataset.orby="css",document.head.appendChild(y),function(v){for(var d=[],k=arguments.length-1;k-- >0;)d[k]=arguments[k+1];var x=h+ ++f.index,E=0,O=o(n(v=v.map(function(a,s){return a+="function"==typeof d[s]?/\:(\s+)$/.test(a)?"<<"+s+">>":"<<:"+s+">>;":d[s]||""}).join("")),c,"."),w=O.locals;return y.innerHTML=O.globals.replace(m,x),function(n,f){var h=x+"-"+E++,v=w.replace(/animation(-name){0,1}(\s*):(\s*)<<id>>/g,function(a){return a.replace(m,x)}).replace(m,h).replace(p,function(a,s,i){return d[s](n,f)+(i||"")}),c={class:x+" "+h+" "+(n.class||"")};for(var o in n)(j||o in g||"function"==typeof n[o]||i.indexOf(o)>-1)&&(c[o]=n[o]);return a.apply(void 0,[s,c,a("style",{},v)].concat(n.children))}}}},exports.parse=n;
//# sourceMappingURL=orby-css.js.map
