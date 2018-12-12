import { parse } from "./parse";

let counter = 0;
let prefix = "css-";
let regId = /<<id>>/g;
let regNm = /<<(?:\:){0,1}(\d+)>>(\;){0,1}/g;
let strId = "<<id>>";

function scoped(rules, id, prefix, deep) {
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
                        if (/^animation(-name){0,1}$/.test(index)) {
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

function createGlobal(id, style) {
    let tag = document.querySelector(`style${id}`);
    if (!tag) {
        tag = document.createElement("style");
        document.head.append(tag);
    }
    tag.innerHTML = style.replace(regId, id);
}

export default function create(pragma) {
    return function styled(tag, keysProps = []) {
        let isFun = typeof tag === "function",
            element = isFun ? {} : document.createElement(tag);
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
            createGlobal(idGlobal, globals);
            return function component(props, context, optional) {
                let idLocal = idGlobal + "-" + counterLocal++,
                    style = locals.replace(regId, idLocal).replace(
                        regNm,
                        (all, index, end) =>
                            args[index](props, optional || context, {
                                idGlobal,
                                idLocal
                            }) + (end || "")
                    ),
                    nextProps = {
                        class: `${idGlobal} ${idLocal} ${props.class || ""}`
                    };
                for (let key in props) {
                    if (
                        isFun ||
                        (key in element ||
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
