import { mapSelector, parse } from "../src/parse";

describe("mapSelector", () => {
    test("selector", () => {
        let selector = `
            selector(.button)
        `,
            [rule] = mapSelector(selector);

        expect(rule).toEqual([{ value: "selector", args: [".button"] }]);
    });
    test("selector ...", () => {
        let selector = `
            selector(.a,.b,.c)
        `,
            [rule] = mapSelector(selector);
        expect(rule).toEqual([{ value: "selector", args: [".a", ".b", ".c"] }]);
    });
});

describe("parse", () => {
    test("keyframes", () => {
        let css = `
        @keyframes mymove {
            from {top: 0px}
            50%{left:-100px}
            to {top: 200px}
        }`,
            [rule] = parse(css);

        expect(rule).toEqual({
            selector: "@keyframes mymove",
            type: "keyframes",
            value: "mymove",
            children: [
                {
                    selector: "from",
                    children: [],
                    type: "selector",
                    properties: [{ index: "top", value: "0px" }],
                    selectors: [[{ value: "from", args: [] }]]
                },
                {
                    selector: "50%",
                    children: [],
                    type: "selector",
                    properties: [{ index: "left", value: "-100px" }],
                    selectors: [[{ value: "50%", args: [] }]]
                },
                {
                    selector: "to",
                    children: [],
                    type: "selector",
                    properties: [{ index: "top", value: "200px" }],
                    selectors: [[{ value: "to", args: [] }]]
                }
            ],
            properties: []
        });
    });
    test("media", () => {
        let css = `
        @media (max-width:300px){
            a{top: 0px}
            b{left:-100px}
            c{top: 200px}
        }`,
            [rule] = parse(css);

        expect(rule).toEqual({
            selector: "@media (max-width:300px)",
            type: "media",
            value: "(max-width:300px)",
            children: [
                {
                    selector: "a",
                    children: [],
                    type: "selector",
                    properties: [{ index: "top", value: "0px" }],
                    selectors: [[{ value: "a", args: [] }]]
                },
                {
                    selector: "b",
                    children: [],
                    type: "selector",
                    properties: [{ index: "left", value: "-100px" }],
                    selectors: [[{ value: "b", args: [] }]]
                },
                {
                    selector: "c",
                    children: [],
                    type: "selector",
                    properties: [{ index: "top", value: "200px" }],
                    selectors: [[{ value: "c", args: [] }]]
                }
            ],
            properties: []
        });
    });

    test("property with line", () => {
        let css = `
        :host {
            animation: pulse 0s ease 10s infinite alternate;
        }
        `,
            [rule] = parse(css);

        expect(rule).toEqual({
            selector: ":host",
            children: [],
            type: "selector",
            properties: [
                {
                    index: "animation",
                    value: "pulse 0s ease 10s infinite alternate"
                }
            ],
            selectors: [[{ value: ":host", args: [] }]]
        });
    });
});
