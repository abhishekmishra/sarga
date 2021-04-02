const SARGA_MIXINS = new Map();

export function getSargaMixin(typeName) {
    if (SARGA_MIXINS.has(typeName)) {
        return SARGA_MIXINS.get(typeName);
    } else {
        throw (`|${typeName}| is not a known mixin.`);
    }
}

export function registerSargaMixin(typeName, mixin) {
    if (SARGA_MIXINS.has(typeName)) {
        throw (`${typeName} already exists.`);
    } else {
        SARGA_MIXINS.set(typeName, mixin);
    }
}

export function getSargaMixinNames() {
    return SARGA_MIXINS.keys();
}
