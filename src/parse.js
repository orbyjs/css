export function trim(str) {
    return str.trim
        ? str.trim()
        : str.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, "");
}

export function mapSelector(string) {
    string = trim(string);
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
/**
 *
 * @param {String} str - css rules
 * @return {Array}
 *
 * TODO:
 * Add support:
 * selector{color:'every:a;{}'}
 */
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

        if (str[i - 1] === "\\") {
            current += letter;
            continue;
        }

        if (singleQuote || doubleQuote) {
            current += letter;
            if (letter === "'" || letter === '"') {
                if (letter === "'") {
                    singleQuote = false;
                } else {
                    doubleQuote = false;
                }
            }
            continue;
        }
        switch (letter) {
            case ";":
                if (!/\{/.test(current)) {
                    current = trim(current);
                    let [all, index, value] =
                        current.match(/^([\w\<\-]+)(?:\s*):(.+)/) || [];
                    if (index && value) {
                        currentGroup.properties.push({
                            index,
                            value: trim(value)
                        });
                    } else {
                        current && groups.push(createType(current));
                    }
                    current = "";
                } else {
                    current += letter;
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
                singleQuote = true;
                current += letter;
                break;
            case '"':
                doubleQuote = true;
                current += letter;
                break;
            default:
                current += letter;
        }
    }
    return groups;
}
