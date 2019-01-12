export let options = {
    id: 0,
    cache: {},
    prefix: "--cn-",
    getClassName() {
        return this.prefix + this.id++;
    }
};
