import { parse } from "./parse";

let ID = "orby-css";
let counter = 0;
let prefix = "css-";
let regId = /<<id>>/g;
let regNm = /<<(?:\:){0,1}(\d+)>>(\;){0,1}/g;
let regAn = /^animation(-name){0,1}$/;
let strId = "<<id>>";

function optimize(rules) {
    let locals = [],
        globals = [];
    for (let i = 0; i < rules.length; i++) {
        let { properties, ...rule } = rules[i],
            lengthProperties = properties.length,
            propertiesLocals = [],
            propertiesGlobal = [];
        for (let i = 0; i < lengthProperties; i++) {
            let { value, index } = properties[i],
                local = false;

            if (regNm.test(value) || regAn.test(index)) {
                local = true;
                propertiesLocals.push({ value, index });
            } else {
                propertiesGlobal.push({ value, index });
            }
        }

        if (lengthProperties) {
            if (propertiesLocals.length) {
                locals.push({ ...rule, properties: propertiesLocals });
            }
            if (propertiesGlobal.length) {
                globals.push({ ...rule, properties: propertiesGlobal });
            }
        } else {
            switch (rule.type) {
                case "media":
                case "supports":
                    let children = optimize(rule.children);
                    locals = locals.concat({
                        ...rule,
                        properties: [],
                        children: children.locals
                    });
                    globals = globals.concat({
                        ...rule,
                        properties: [],
                        children: children.globals
                    });
                    break;
                default:
                    globals.push({ ...rule, properties: [] });
            }
        }
    }
    return { globals, locals };
}

function scoped(rules, id, prefix, deep) {
    if (!deep) {
        let { locals, globals } = optimize(rules);
        rules = locals.concat(globals);
    }
    rules = rules.map(rule => {
        let selectors, properties;
        switch (rule.type) {
            case "keyframes":
                selectors = "@keyframes " + id + "-" + rule.value;
                properties = properties = scoped(rule.children, "", "", true);
                return `${selectors}{${properties}}`;
            case "media":
                selectors = "@media " + rule.value;
                properties = scoped(rule.children, id, prefix, true);
                return `${selectors}{${properties}}`;
            case "selector":
                selectors = rule.selectors
                    .map(selector => {
                        let name = selector.name;
                        if (/:host/.test(selector.name)) {
                            if (selector.args.length) {
                                name = selector.args
                                    .map(arg => `${selector.name}${arg}`)
                                    .join(",");
                            }
                        }
                        if (/:global/.test(selector.name)) {
                            name = selector.args.join(",");
                        }
                        return name.replace(/:host/g, prefix + id);
                    })
                    .join(",");
                properties = rule.properties
                    .map(({ index, value }) => {
                        if (regAn.test(index)) {
                            value = value.replace(/(\s*)/, id + "-$1");
                        }
                        return `${index}:${value}`;
                    })
                    .join(";");

                return `${selectors}{${properties}}`;
            case "import":
                return rule.selector + ";";
            default:
                return "";
        }
    });
    if (!deep) {
        let globals = "",
            locals = "";
        rules.forEach(str => {
            if (regNm.test(str)) {
                locals += str;
            } else {
                globals += str;
            }
        });
        return { globals, locals };
    }
    return rules.join("");
}

function useGlobal(id, style) {
    let tag = document.querySelector(`style#${ID}`);
    if (!tag) {
        tag = document.createElement("style");
        tag.id = ID;
        document.head.append(tag);
    }
    tag.appendChild(document.createTextNode(style.replace(regId, id)));
}

export default function create(pragma) {
    return function styled(tag, keysProps = []) {
        let isFun = typeof tag === "function",
            element,
            proto;
        switch (tag) {
            case "a":
                element = HTMLLinkElement;
                break;
            case "svg":
                element = SVGElement;
                break;
            case "img":
                element = HTMLImageElement;
                break;
            case "button":
                element = HTMLButtonElement;
                break;
            case "input":
                element = HTMLInputElement;
                break;
            default:
                element = HTMLElement;
                break;
        }
        proto = element.prototype;
        return function local(template, ...args) {
            let idGlobal = prefix + counter++,
                counterLocal = 0;

            template = template
                .map((string, index) => {
                    if (typeof args[index] === "function") {
                        string += /\:(\s+)$/.test(string)
                            ? `<<${index}>>`
                            : `<<:${index}>>;`;
                    } else {
                        string += args[index] || "";
                    }
                    return string;
                })
                .join("");
            let { globals, locals } = scoped(parse(template), strId, ".");
            useGlobal(idGlobal, globals);
            return function component(props, context, optional) {
                let idLocal = idGlobal + "-" + counterLocal++,
                    style = locals
                        .replace(
                            /animation(-name){0,1}(\s*):(\s*)<<id>>/g,
                            all => all.replace(regId, idGlobal)
                        )
                        .replace(regId, idLocal)

                        .replace(regNm, (all, index, end) => {
                            return (
                                args[index](props, optional || context, {
                                    idGlobal,
                                    idLocal
                                }) + (end || "")
                            );
                        }),
                    nextProps = {
                        class: `${idGlobal} ${idLocal} ${props.class || ""}`
                    };
                for (let key in props) {
                    if (
                        isFun ||
                        (key in proto ||
                            typeof props[key] === "function" ||
                            keysProps.indexOf(key) > -1)
                    ) {
                        nextProps[key] = props[key];
                    }
                }
                return pragma(
                    tag,
                    nextProps,
                    pragma("style", {}, style),
                    ...props.children
                );
            };
        };
    };
}
