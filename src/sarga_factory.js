import Mustache from 'mustache';
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
            // console.log('argument received');
            // console.log(arg);
            if (arg.k === 'id') {
                throw ('cannot replace id of object via arguments');
            }
            else if (arg.v.isSargaText && arg.v.isSargaText()) {
                let parsedText = this.parseText(arg.v);
                // console.log(`${this.id} k=${arg.k}, v=${arg.v}, parsed=${parsedText}, typeof = ${typeof this[arg.k]}`);
                if ((typeof this[arg.k]) === "number"
                    && (typeof parsedText) !== "number") {
                    this[arg.k] = parseFloat(parsedText);
                } else {
                    this[arg.k] = parsedText;
                }
            }
            else {
                this[arg.k] = arg.v;
            }
        }
    }

    isSargaRuntimeObject() {
        return true;
    }

    num(str) {
        return parseFloat(str);
    }

    mustache(str, heap, self) {
        let output =  Mustache.render(str, heap._heap);
        console.log(str);
        console.log(heap);
        console.log(output);
        return output;
    }

    // TODO: move to sarga_operations.js or sarga_parse.js
    // so that all text occurences are dealt with uniformly.
    parseText(textObj) {
        if (textObj) {
            const filters = textObj.filters;
            const str = textObj.str;
            if (filters.length > 0) {
                let outstr = str;
                for (let filter of filters) {
                    outstr = this[filter](outstr, this._heap, this);
                }
                // console.log(textObj);
                // console.log(outstr);
                return outstr;
            } else {
                return str;
            }
        } else {
            throw (`text object is null/undefined`);
        }
    }
}

export function sargaMixin(obj, mixinName) {
    const mixinObj = getSargaMixin(mixinName);
    const dependsOn = mixinObj.depends;
    if(dependsOn.length > 0) {
        for (let dependsItem of dependsOn) {
            // console.log(`Adding depends ${dependsItem}`);
            sargaMixin(obj, dependsItem);
        }
    }
    Object.assign(obj, mixinObj.mixin);
    const initFnName = "init" + mixinName + "Mixin";
    if (obj[initFnName]) {
        obj[initFnName]();
    }
}

export function sargaMixins(obj, mixinNames) {
    for (let mixinName of mixinNames) {
        sargaMixin(obj, mixinName);
    }
}