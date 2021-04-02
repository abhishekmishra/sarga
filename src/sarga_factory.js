import { getSargaMixin } from './sarga_mixin';
import './sarga_mixins_base';

const SARGA_FACTORIES = new Map();

export function getSargaFactory(typeName) {
    if (SARGA_FACTORIES.has(typeName)) {
        return SARGA_FACTORIES.get(typeName);
    } else {
        throw (`${typeName} is not a known factory.`);
    }
}

export function registerSargaFactory(typeName, factory) {
    if (SARGA_FACTORIES.has(typeName)) {
        throw (`${typeName} already exists.`);
    } else {
        SARGA_FACTORIES.set(typeName, factory);
    }
}

export function getSargaFactoryNames() {
    return SARGA_FACTORIES.keys();
}

export function createSargaObject(typeName, id, ...args) {
    if (!SARGA_FACTORIES.has(typeName)) {
        console.error(`${typeName} not found in object fatories`);
    }
    const factory = getSargaFactory(typeName);
    return factory(id, ...args);
}

export class SargaRuntimeObject {
    id;

    constructor(id, ...args) {
        if (id === null || id === undefined) {
            throw (`dude id cannot be null or undefined`);
        }
        this.id = id;
        for (let arg of args) {
            // console.log(arg);
            if (arg.k === 'id') {
                throw ('cannot replace id of object via arguments');
            }
            this[arg.k] = arg.v;
        }
    }

    update(...args) {
        for (let arg of args) {
            // console.log(arg);
            if (arg.k === 'id') {
                throw ('cannot replace id of object via arguments');
            }
            if(arg.k && (typeof this[arg.k]) == "number") {
                this[arg.k] = parseFloat(arg.v);
            } else {
                this[arg.k] = arg.v;
            }
        }
    }

    isSargaRuntimeObject() {
        return true;
    }
}

export function sargaMixin(obj, mixinName) {
    Object.assign(obj, getSargaMixin(mixinName));
    const initFnName = "init" + mixinName + "Mixin";
    if(obj[initFnName]) {
        obj[initFnName]();
    }
}

export function sargaMixins(obj, mixinNames) {
    for(let mixinName of mixinNames) {
        sargaMixin(obj, mixinName);
    }
}