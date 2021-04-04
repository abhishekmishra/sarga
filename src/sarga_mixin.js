const SARGA_MIXINS = new Map();

export function getSargaMixin(typeName) {
    if (SARGA_MIXINS.has(typeName)) {
        return SARGA_MIXINS.get(typeName);
    } else {
        throw (`|${typeName}| is not a known mixin.`);
    }
}

export function registerSargaMixin(typeName, mixin, depends = []) {
    if (SARGA_MIXINS.has(typeName)) {
        throw (`${typeName} already exists.`);
    } else {
        if (typeName !== "Debug") {
            depends.push("Debug");
        }
        SARGA_MIXINS.set(typeName, {
            depends: depends,
            mixin: mixin
        });
    }
}

export function getSargaMixinNames() {
    return SARGA_MIXINS.keys();
}
