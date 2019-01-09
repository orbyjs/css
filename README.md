# @orby/css

**@orby/css** allows to maintain the control and scope of the CSS of JSX-based components, with only 1.8kB.

```jsx
import {h} from "@orby/core";
import styled from "@orby/css/orby";

let Button = styled("button")`
    :host{
		background : ${(props)=>{
    		return props.primary ? "black" : "orange";
		}};
    }
`;
```

The dynamic context effect happens thanks to the use of [Custom properties](https://developer.mozilla.org/en-US/docs/Web/CSS/--*), each function will be replaced by an associated variable only to the className.

## Index

1. [Functioning](#functioning)
2. [Static Styles](#static-styles)
3. [Dynamic styles](#dynamic-styles)
4. [Special selectors](#special-selectors)
    1. [Host selector](#host-selector)
    2. [Global selector](#global-selector)
5. [Keyframes](#keyframes)
6. [CreateStyled](#createStyled)
7. [Examples](#examples)

## Functioning

The process of **@orby/css** is simple, it takes the input css and transforms it into an array that groups the rules defined as an object, then based on those rules, identify which of these are static and dynamic.

## Static Styles

Static styles are all rules that do not incorporate the use of functions for defining properties.

```jsx
styled("button")`
    :host{
        background:${COLOR}
    }
`
```
> the constant `${COLOR}` not being a function, the rule is considered static, so it will only print once and before mounting the same component.

## Dynamic styles

Dynamic styles are all rules that incorporate the use of functions in the definition of properties.

```jsx
styled("button")`
    :host{
        background:${(props)=>{
            return props.primary ? "black" : "orange";
        }}
    }
`
```
> When detecting the use of functions in the associated rule, it is considered dynamic, this rule will exist as a node of the component and will be updated so many times the component is rendered.

## Special selectors

To facilitate the printing of **@orby/css** styles, it makes use of special selectors:

1. `:host`:  allows to point to the same class, whether static or dynamic.
2. `:global` : allows to escape the context of scope of the component.

### Host selector

This selector allows you to point to the component itself, you can generate the following proposed confinements:

```css
:host(.selector-1){}
:host(:checked){}

:host(.selector-1,.selector-2,.selector-3){}
:host(.selector-1:not(.selector-2)){}

:host.selector-1{}
:host:checked{}

:host[data-any]{}
```

> I tried to homologate the behavior of `: host` proposed in the use of shadowDom [see more](https://developer.mozilla.org/en-US/docs/Web/CSS/:host()).


### Global selector

This selector allows to escape from the local context of the component

```css
:global(body){}
```

## Keyframes

To keep the keyframes animations **@orby/css** prefix all animation names with the class name, in this way the generated keyframes retain their effect.

```jsx
let Rotate = styled("div")`
    :host{
        animation : rotate 1s  infinite;
    }
    @keyframes rotate{
        0%{
            transform:rotate(0deg);
        }
        100%{
            transform:rotate(360deg);
        }
    }
`;
```

## CreateStyled

Orby like other libraries like [HTM](https://github.com/developit/htm), is not tied to a specific library, if you already create JSX-based components, you can deliver to the label generator function (pragma) to create a styled instance to work.

By default `@orby/css` delivers support to [@orby/code](https://github.com/orbyjs/core), [Preact](https://github.com/developit/preact/) and [React](https://reactjs.org/).

Below is how to create the `styled` function for preact, you can use this resource by importing `@orby/css/preact`.

```jsx
import { h } from "preact";
import { createStyled } from "@orby/css";

export default createStyled(h);
```

## parse 

to be able to process the rules I created a small script layers to transform the css into an object similar to the one that returns [postcss](https://postcss.org/). in only 855 B.

```js
import parse from "@orby/css/parse";

let css = `
    @media (max-width:320px){
        button:not(.sample){
            color : black;
        }
    }
`;

parse(css)
```
The return of this is an extremely enriched object, ideal for the construction of rules or reading of properties.
```js
[
    {
        selector: "@media (max-width:320px)",
        type: "media",
        value: "(max-width:320px)",
        children: [
            {
                selector: "button:not(.sample)",
                children: [],
                type: "selector",
                properties: [{ index: "color", value: "black" }],
                selectors: [
                    [
                        { value: "button", args: [] },
                        { value: ":not", args: [".sample"] }
                    ]
                ]
            }
        ],
        properties: []
    }
];
```
