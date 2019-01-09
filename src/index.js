import { options } from "./options";
import { parse } from "./parse";
export { parse } from "./parse";
export { options } from "./options";

let ID = 0;

export function getTagInstance(tagName) {
    let doc = options.document || document;

    if (!options.HTMLInstances) {
        options.HTMLInstances = {};
    }

    if (!options.HTMLInstances[tagName]) {
        options.HTMLInstances[tagName] = doc.createElement(tagName);
    }

    return options.HTMLInstances[tagName];
}

export function stateToArgs(states) {
    return states
        .map(
            ({ value, args }) =>
                value + (args.length ? `(${args.join(",")})` : "")
        )
        .join(":");
}

export function createRuleSelector(rule, space, parent, deep = 0) {
    let rules = [],
        root = "." + space,
        selectors = rule.selectors.map(([{ value, args }, ...states]) => {
            value = value.replace(/(\s+)$/, " ");
            switch (value) {
                case ":host":
                    return args.length ? args.map(value => root + value) : root;
                case ":global":
                    return args.join(",");
                case "& ":
                case "&":
                    return (
                        parent +
                        (value === "&" ? "" : " ") +
                        stateToArgs(states)
                    );
                default:
                    return deep
                        ? (parent ? parent + " " : "") +
                              value +
                              stateToArgs(states)
                        : `${root} ${value + stateToArgs(states)}`;
            }
        }),
        properties = rule.properties.map(({ index, value }) => {
            if (/^animation(-name){0,1}$/.test(index)) {
                value = space + value;
            }
            return `${index}:${value}`;
        });

    if (properties.length) {
        rules.push(`${selectors.join(",")}{${properties.join(";")}}`);
    }
    rule.children.map(rule => {
        rule = selectors.map(selector =>
            createRuleSelector(rule, space, selector, deep + 1)
        );
        if (rule.length) rules = rules.concat(...rule);
    });

    return rules;
}

export function createStaticCss(rules, space, parent = "") {
    return rules.reduce((nextRules, rule) => {
        switch (rule.type) {
            case "keyframes":
                return nextRules.concat(
                    `@keyframes ${space + rule.value}{${rule.children
                        .map(rule => createRuleSelector(rule, space, "", 1))
                        .join("")}}`
                );
            case "media":
            case "supports":
                return nextRules.concat(
                    `@media ${rule.value}{${rule.children
                        .map(rule => createRuleSelector(rule, space))
                        .join("")}}`
                );
            case "selector":
                return nextRules.concat(createRuleSelector(rule, space));
            case "import":
                return nextRules.concat(rule.selector + ";");
            default:
                return nextRules;
        }
    }, []);
}

export function transpile(mapString, args) {
    let customVars = {},
        space = "--cn-" + ID++,
        localID = 0,
        css = mapString
            .map((string, index) => {
                if (typeof args[index] === "function") {
                    let name = space + "-" + localID++;
                    customVars[name] = args[index];
                    string += `var(${name})`;
                } else {
                    string += args[index] || "";
                }
                return string;
            })
            .join("");
    return {
        space,
        rules: createStaticCss(parse(css), space),
        customVars
    };
}

export function createStyled(pragma, enableStyleObject) {
    return function scope(tagName) {
        let isComponent = typeof tagName === "function",
            tagInstance = isComponent ? {} : getTagInstance(tagName) || {};

        return function styled(mapString, ...args) {
            let { space, rules, customVars } = transpile(mapString, args),
                doc = options.document || document;

            let existStyle = doc.getElementById(space),
                style = existStyle || doc.createElement("style");

            if (!existStyle) {
                style.id = space;
                doc.head.appendChild(style);
            }

            if (style.sheet && !options.disableSheet) {
                rules.map((rule, index) => style.sheet.insertRule(rule, index));
            } else {
                style.innerHTML = rules.join("");
            }
            return function Component(props, context) {
                let style = enableStyleObject
                        ? typeof props.style === "object"
                            ? props.style
                            : {}
                        : typeof props.style == "string"
                        ? props.style
                        : "",
                    nextProps = {},
                    className = [space];

                if (props.className || props.class) {
                    className.push(props.className || props.class);
                }

                for (let index in customVars) {
                    let value = customVars[index](props, context);
                    if (enableStyleObject) {
                        style[index] = value;
                    } else {
                        if (value) style += `${index}:${value};`;
                    }
                }

                for (let index in props) {
                    if (
                        isComponent ||
                        typeof props[index] === "function" ||
                        index in tagInstance
                    ) {
                        nextProps[index] = props[index];
                    }
                }

                nextProps.className = nextProps.class = className.join(" ");

                nextProps.style = style;

                return pragma(tagName, nextProps, props.children);
            };
        };
    };
}
