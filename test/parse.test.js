import { mapSelector, parse } from "../src/parse";

describe("mapSelector", () => {
    test("import", () => {
        let selector = `
        @import url('https://fonts.googleapis.com/css?family=Roboto');
        `,
            [rule] = mapSelector(selector);

        expect(rule).toEqual({
            name: "@import url",
            args: ["'https://fonts.googleapis.com/css?family=Roboto'"]
        });
    });
    test("selector", () => {
        let selector = `
            selector(.button)
        `,
            [rule] = mapSelector(selector);

        expect(rule).toEqual({
            name: "selector",
            args: [".button"]
        });
    });
    test("selector ...", () => {
        let selector = `
            selector(.a,.b,.c)
        `,
            [rule] = mapSelector(selector);

        expect(rule).toEqual({
            name: "selector",
            args: [".a", ".b", ".c"]
        });
    });
});

describe("parse", () => {
    test("import", () => {
        let css = `
            @import url('https://fonts.googleapis.com/css?family=Roboto');
        `;
    });
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
                    selectors: [{ name: "from", args: [] }]
                },
                {
                    selector: "50%",
                    children: [],
                    type: "selector",
                    properties: [{ index: "left", value: "-100px" }],
                    selectors: [{ name: "50%", args: [] }]
                },
                {
                    selector: "to",
                    children: [],
                    type: "selector",
                    properties: [{ index: "top", value: "200px" }],
                    selectors: [{ name: "to", args: [] }]
                }
            ],
            properties: []
        });
    });

    test("media", () => {
        let css = `
        @media (max-width:300px{
            a{top: 0px}
            b{left:-100px}
            c{top: 200px}
        }`,
            [rule] = parse(css);

        expect(rule).toEqual({
            selector: "@media (max-width:300px",
            type: "media",
            value: "(max-width:300px",
            children: [
                {
                    selector: "a",
                    children: [],
                    type: "selector",
                    properties: [{ index: "top", value: "0px" }],
                    selectors: [{ name: "a", args: [] }]
                },
                {
                    selector: "b",
                    children: [],
                    type: "selector",
                    properties: [{ index: "left", value: "-100px" }],
                    selectors: [{ name: "b", args: [] }]
                },
                {
                    selector: "c",
                    children: [],
                    type: "selector",
                    properties: [{ index: "top", value: "200px" }],
                    selectors: [{ name: "c", args: [] }]
                }
            ],
            properties: []
        });
    });
});
