
function component(props:Object,context?:Object,optional?:Object):Object;

function local(template:String,...args):component;

function styled(tag,keysProps:Array=[]):local;

declare module "@orby/css" {
    export default function create(pragma:Function):styled{
        return styled;
    }
}