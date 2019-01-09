export function trim(str) {
    return str.trim
        ? str.trim()
        : str.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, "");
}

export function mapSelector(string) {
    string = trim(string);
    let length = string.length,
        letter = "",
        openArgs = 0,
        selector = [],
        selectors = [],
        currentArgs = "",
        singleQuote = 0,
        doubleQuote = 0,
        state = { value: "", args: [] },
        insertSelector = selector =>
            selectors.indexOf(selector) === -1 && selectors.push(selector),
        insertState = state =>
            selector.indexOf(state) === -1 && selector.push(state);

    insertState(state);

    for (let index = 0; index < length; index++) {
        letter = string[index];
        if (singleQuote || doubleQuote) {
            currentArgs += letter;
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
            case ":":
                if (string[index - 1] === ":") {
                    state.value += ":";
                } else {
                    if (state.value) {
                        insertState(state);
                        insertState(
                            (state = {
                                value: ":",
                                args: []
                            })
                        );
                    } else {
                        state.value = ":";
                    }
                }
                currentArgs = "";
                break;
            case "(":
            case ")":
                if (letter == "(") {
                    if (!openArgs++) {
                        currentArgs = "";
                    }
                } else {
                    if (!--openArgs) {
                        state.args.push(currentArgs);
                        currentArgs = "";
                    }
                }
                break;
            case "'":
            case '"':
                if (letter === "'") {
                    singleQuote++;
                } else {
                    doubleQuote++;
                }
                currentArgs += letter;
                break;
            case ",":
                if (openArgs) {
                    state.args.push(currentArgs);
                    currentArgs = "";
                } else {
                    if (selector.length) {
                        insertSelector(selector);
                    }
                    if (state.value) {
                        insertState(state);
                    }
                    insertSelector(
                        (selector = [
                            (state = {
                                value: "",
                                args: []
                            })
                        ])
                    );
                }
                break;

            case "\n":
                continue;
            default:
                if (openArgs) {
                    currentArgs += letter;
                } else {
                    state.value += letter;
                }
        }
    }
    if (state.value) insertState(state);
    if (selector.length) insertSelector(selector);
    return selectors;
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
                    let [all, index, space] =
                            current.match(/^([\w\<\-]+)(\s*):(.+)/) || [],
                        value = index
                            ? current.slice(index.length + space.length + 1)
                            : "";
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
