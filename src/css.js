import { parse } from "./parse";
import { options } from "./options";

export function stateToArgs(states) {
    return states
        .map(
            ({ value, args }) =>
                value + (args.length ? `(${args.join(",")})` : "")
        )
        .join("");
}
/**
 *
 * @param {*} rule
 * @param {*} className
 * @param {*} parent
 * @param {*} deep
 * :TODO
 * soportar selectores conjunto &
 */
export function createRuleSelector(rule, className, parent = "", deep = 0) {
    let rules = [],
        root = "." + className;

    let selectors = rule.selectors.map(([{ value, args }, ...states]) => {
            value = value.replace(/(\s+)$/, " ").replace(/^(\s+)/, "");
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
                    let [all, isAnd, space = "", selector] =
                        value.match(/(&)(\s*)(.+)/) || [];
                    return deep
                        ? (parent ? parent + (isAnd ? space : "") : "") +
                              (selector || value) +
                              stateToArgs(states)
                        : `${root} ${value + stateToArgs(states)}`;
            }
        }),
        properties = rule.properties.map(({ index, value }) => {
            if (/^animation(-name){0,1}$/.test(index)) {
                value = className + value;
            }
            return `${index}:${value}`;
        });

    if (properties.length) {
        rules.push(`${selectors.join(",")}{${properties.join(";")}}`);
    }
    rule.children.map(rule => {
        rule = selectors.map(selector =>
            createRuleSelector(rule, className, selector, deep + 1)
        );
        if (rule.length) rules = rules.concat(...rule);
    });

    return rules;
}

export function createStaticCss(rules, className, parent = "") {
    return rules.reduce((nextRules, rule) => {
        switch (rule.type) {
            case "keyframes":
                return nextRules.concat(
                    `@keyframes ${className + rule.value}{${rule.children
                        .map(rule => createRuleSelector(rule, className, "", 1))
                        .join("")}}`
                );
            case "media":
            case "supports":
                return nextRules.concat(
                    `@media ${rule.value}{${rule.children
                        .map(rule => createRuleSelector(rule, className))
                        .join("")}}`
                );
            case "selector":
                return nextRules.concat(createRuleSelector(rule, className));
            case "import":
                return nextRules.concat(rule.selector + ";");
            default:
                return nextRules;
        }
    }, []);
}

export function css(mapString, ...args) {
    let customVars = {},
        className = options.getClassName(),
        localID = 0,
        cssString = mapString
            .map((string, index) => {
                if (typeof args[index] === "function") {
                    let name = className + "-" + localID++;
                    customVars[name] = args[index];
                    string += `var(${name})`;
                } else {
                    string += args[index] || "";
                }
                return string;
            })
            .join("");
    return {
        rules: createStaticCss(parse(cssString), className),
        className,
        customVars,
        toString() {
            return className;
        }
    };
}
