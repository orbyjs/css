function a(a){return a.trim?a.trim():a.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g,"")}function s(s){var n=[],i=[],f={selector:s=a(s),children:n,type:"selector",properties:i},h=s.match(/^\@(\w+) (.+)/);return h?{selector:h[0],type:h[1],value:h[2],children:n,properties:i}:(f.selectors=function(s){s=a(s);for(var n,i="",f=0,h=[],m=[],p=0;p<s.length;p++){var v=s[p];"("===v?f++?i+=v:(m=[],n=i,i=""):")"===v?--f?i+=v:(m.push(i),h.push({name:n,args:m}),i="",m=[]):","===v?(i&&(f?m.push(i):h.push({name:i})),i=""):i+=v}return i&&h.push({name:i,args:m}),h}(f.selector),f)}function n(i){var f,h,m="",p=0,v=[],c=0,o=0,g=[];i=a(i).replace(/([^\:]+):([^\;]+){0,1}}/g,"$1:$2;}");for(var y=0;y<i.length;y++)if(f=i[y],"\\"!==i[y-1])if(c||o)m+=f,"'"!==f&&'"'!==f||("'"===f?c=!1:o=!1);else switch(f){case";":if(/\{/.test(m))m+=f;else{var d=(m=a(m)).match(/^([\w\<\-]+)(?:\s*):(.+)/)||[],j=d[1],k=d[2];j&&k?h.properties.push({index:j,value:a(k)}):m&&v.push(s(m)),m=""}break;case"{":p++?m+=f:(h=s(m),v.push(h),m="");break;case"}":if(--p)g.push(m+=f);else{for(var E=[],O=0;O<g.length;O++)E=E.concat(n(g[O]));h.children=E,g=[]}m="";break;case"'":c=!0,m+=f;break;case'"':o=!0,m+=f;break;default:m+=f}else m+=f;return v}function i(a,s){var n={};for(var i in a)Object.prototype.hasOwnProperty.call(a,i)&&-1===s.indexOf(i)&&(n[i]=a[i]);return n}var f=new Map,h="css-",m=/<<id>>/g,p=/<<(?:\:){0,1}(\d+)>>(\;){0,1}/g,v=/^animation(-name){0,1}$/,c="<<id>>";function o(a){for(var s=[],n=[],f=0;f<a.length;f++){for(var h=a[f],m=h.properties,c=i(h,["properties"]),g=m.length,y=[],d=[],j=0;j<g;j++){var k=m[j],E=k.value,O=k.index;p.test(E)||v.test(O)?y.push({value:E,index:O}):d.push({value:E,index:O})}if(g)y.length&&s.push(Object.assign({},c,{properties:y})),d.length&&n.push(Object.assign({},c,{properties:d}));else switch(c.type){case"media":case"supports":var w=o(c.children);s=s.concat(Object.assign({},c,{properties:[],children:w.locals})),n=n.concat(Object.assign({},c,{properties:[],children:w.globals}));break;default:n.push(Object.assign({},c,{properties:[]}))}}return{globals:n,locals:s}}function g(a,s,n,i){if(!i){var f=o(a);a=f.locals.concat(f.globals)}if(a=a.map(function(a){switch(a.type){case"keyframes":return"@keyframes "+s+"-"+a.value+"{"+g(a.children,"","",!0)+"}";case"media":return"@media "+a.value+"{"+g(a.children,s,n,!0)+"}";case"selector":return a.selectors.map(function(a){var i=a.name;return/:host/.test(a.name)&&a.args.length&&(i=a.args.map(function(s){return""+a.name+s}).join(",")),/:global/.test(a.name)&&(i=a.args.join(",")),i.replace(/:host/g,n+s)}).join(",")+"{"+a.properties.map(function(a){var n=a.index,i=a.value;return v.test(n)&&(i=i.replace(/(\s*)/,s+"-$1")),n+":"+i}).join(";")+"}";case"import":return a.selector+";";default:return""}}),!i){var h="",m="";return a.forEach(function(a){p.test(a)?m+=a:h+=a}),{globals:h,locals:m}}return a.join("")}exports.Styles=f,exports.optimizeRules=o,exports.rulesToCss=g,exports.create=function(a){return function s(i,v){void 0===v&&(v=[]);var o,y,d="function"==typeof i,j=function(a){var s,n=f.get(a);return n||(n={id:f.size,style:(s=document.createElement("style"),document.head.appendChild(s),s),set:function(a){this.style.innerHTML=a}},f.set(a,n)),n}(s);switch(i){case"a":o=HTMLLinkElement;break;case"svg":o=SVGElement;break;case"img":o=HTMLImageElement;break;case"button":o=HTMLButtonElement;break;case"input":o=HTMLInputElement;break;default:o=HTMLElement}return y=o.prototype,function(s){for(var f=[],o=arguments.length-1;o-- >0;)f[o]=arguments[o+1];var k=h+j.id,E=0,O=g(n(s=s.map(function(a,s){return a+="function"==typeof f[s]?/\:(\s+)$/.test(a)?"<<"+s+">>":"<<:"+s+">>;":f[s]||""}).join("")),c,"."),w=O.globals,x=O.locals;return console.log(j),j.set(w.replace(m,k)),function(s,n,h){var c=k+"-"+E++,o=x.replace(/animation(-name){0,1}(\s*):(\s*)<<id>>/g,function(a){return a.replace(m,k)}).replace(m,c).replace(p,function(a,i,m){return f[i](s,h||n,{idGlobal:k,idLocal:c})+(m||"")}),g={class:k+" "+c+" "+(s.class||"")};for(var j in s)(d||j in y||"function"==typeof s[j]||v.indexOf(j)>-1)&&(g[j]=s[j]);return a.apply(void 0,[i,g,a("style",{},o)].concat(s.children))}}}},exports.parse=n;
//# sourceMappingURL=orby-css.js.map
