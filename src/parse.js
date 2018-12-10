export function trim(str) {
    return str.trim ? str.trim() : str.replace(/^\s*|\s*$/, "");
}

export function isProperty(string) {
    return string.match(/([^\:]+):(.+)(;){0,1}$/);
}

export default function mapSelector(string) {
    let name = "",
        open = 0,
        parts = [],
        args = [],
        prev;
    for (let i = 0; i < string.length; i++) {
        let letter = string[i];
        if (letter === "(") {
            if (!open++) {
                args = [];
                prev = name;
                name = "";
            } else {
                name += letter;
            }
        } else if (letter === ")") {
            if (!--open) {
                args.push(name);
                parts.push({
                    name: prev,
                    args
                });
                name = "";
                args = [];
            } else {
                name += letter;
            }
        } else {
            if (letter === ",") {
                name && (open ? args.push(name) : parts.push({ name }));
                name = "";
            } else {
                name += letter;
            }
        }
    }
    if (name) parts.push({ name, args });
    return parts;
}

export function createType(selector) {
    selector = trim(selector);
    let children = [],
        properties = [],
        data = { selector, children, type: "selector", properties },
        test = selector.match(/^\@(\w+) (.+)/);

    if (test) {
        let [selector, type, value] = test;
        return { selector, type, value, children, properties };
    } else {
        data.selectors = mapSelector(data.selector);
    }

    return data;
}

export function parse(str) {
    let letter,
        current = "",
        content = "",
        brackets = 0,
        groups = [],
        withSlash,
        currentGroup,
        singleQuote = 0,
        doubleQuote = 0,
        subGroups = [];

    str = trim(str).replace(/([^\:]+):([^\;]+){0,1}}/g, "$1:$2;}");
    for (let i = 0; i < str.length; i++) {
        letter = str[i];
        withSlash = str[i - 1] === "\\";
        if (
            withSlash ||
            ((!/\"|\'/.test(letter) && singleQuote) || doubleQuote)
        ) {
            current += letter;
            continue;
        }
        switch (letter) {
            case ";":
                if (/\{/.test(current)) {
                    current += letter;
                } else {
                    let [all, index, value] =
                        current.match(/([^\:]+):(.+)/) || [];
                    if (index && value) {
                        currentGroup.properties.push({
                            index: trim(index),
                            value: trim(value)
                        });
                        current = "";
                    }
                }
                break;
            case "{":
                if (!brackets++) {
                    currentGroup = createType(current);
                    groups.push(currentGroup);
                    current = "";
                } else {
                    current += letter;
                }
                break;
            case "}":
                if (!--brackets) {
                    let children = [];
                    for (let i = 0; i < subGroups.length; i++) {
                        children = children.concat(parse(subGroups[i]));
                    }
                    currentGroup.children = children;
                    subGroups = [];
                } else {
                    subGroups.push((current += letter));
                }
                current = "";
                break;
            case "'":
                singleQuote ? singleQuote-- : singleQuote++;
                current += letter;
                break;
            case '"':
                doubleQuote ? doubleQuote-- : doubleQuote++;
                current += letter;
                break;
            default:
                current += letter;
        }
    }
    return groups;
}
