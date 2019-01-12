import { options } from "./options";
export { parse } from "./parse";
export { options } from "./options";
import { css } from "./css";
export { css } from "./css";

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

export function createStyled(pragma, enableStyleObject) {
    return function scope(tagName) {
        let isComponent = typeof tagName === "function",
            tagInstance = isComponent ? {} : getTagInstance(tagName) || {};

        return function styled(mapString, ...args) {
            let { className, rules, customVars } = css(mapString, ...args),
                doc = options.document || document;

            let existStyle = doc.getElementById(className),
                style = existStyle || doc.createElement("style");

            if (!existStyle) {
                style.id = className;
                doc.head.appendChild(style);
            }

            if (style.sheet && !options.disableSheet) {
                rules.map((rule, index) => style.sheet.insertRule(rule, index));
            } else {
                style.innerHTML = rules.join("");
            }
            function Component(props, context) {
                let style = enableStyleObject
                        ? typeof props.style === "object"
                            ? props.style
                            : {}
                        : typeof props.style == "string"
                        ? props.style
                        : "",
                    nextProps = {},
                    nextClassName = [className];

                if (props.className || props.class) {
                    nextClassName.push(props.nextClassName || props.class);
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

                nextProps.className = nextClassName.join(" ");

                nextProps.style = style;

                return pragma(tagName, nextProps, props.children);
            }

            Component.className = className;
            Component.is = alias => className + alias;
            return Component;
        };
    };
}
