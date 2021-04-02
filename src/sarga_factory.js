import {
    DisplayNameMixin,
    ScreenLocationMixin,
    DimensionMixin,
    PreloadMixin,
    ShowMixin,
    ImageMixin,
    RedirectSpeechMixin,
    CounterMixin,
    SpeechBubbleMixin,
    ToggleMixin
} from './sarga_mixins_base';

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

class SargaRuntimeObject {
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
            this[arg.k] = arg.v;
        }
    }

    isSargaRuntimeObject() {
        return true;
    }
}


registerSargaFactory('vanilla', (id, ...args) => {
    return new SargaRuntimeObject(id, ...args);
});

registerSargaFactory('image', (id, ...args) => {
    let obj = new SargaRuntimeObject(id, ...args);

    Object.assign(obj, ScreenLocationMixin);
    obj.initScreenLocationMixin();

    Object.assign(obj, ShowMixin);
    obj.initShowMixin();

    Object.assign(obj, PreloadMixin);
    obj.initPreloadMixin();

    Object.assign(obj, ImageMixin);
    obj.initImageMixin();

    return obj;
});


registerSargaFactory('character', (id, ...args) => {
    let obj = new SargaRuntimeObject(id, ...args);
    Object.assign(obj, DisplayNameMixin);

    Object.assign(obj, ScreenLocationMixin);
    obj.initScreenLocationMixin();

    Object.assign(obj, ShowMixin);
    obj.initShowMixin();

    Object.assign(obj, PreloadMixin);
    obj.initPreloadMixin();

    Object.assign(obj, ImageMixin);
    obj.initImageMixin();

    Object.assign(obj, RedirectSpeechMixin);
    obj.initRedirectSpeechMixin();

    return obj;
});

registerSargaFactory('counter', (id, ...args) => {
    let obj = new SargaRuntimeObject(id, ...args);

    Object.assign(obj, CounterMixin);
    obj.initCounterMixin();

    Object.assign(obj, ScreenLocationMixin);
    obj.initScreenLocationMixin();

    // TODO: implement counter visible on screen
    // Object.assign(obj, ShowMixin);
    // obj.initShowMixin();

    // Object.assign(obj, SpeechBubbleMixin);
    // obj.initSpeechBubbleMixin();

    return obj;
});

registerSargaFactory('speechbubble', (id, ...args) => {
    let obj = new SargaRuntimeObject(id, ...args);

    Object.assign(obj, ScreenLocationMixin);
    obj.initScreenLocationMixin();

    Object.assign(obj, DimensionMixin);
    obj.initDimensionMixin();

    Object.assign(obj, ShowMixin);
    obj.initShowMixin();

    Object.assign(obj, SpeechBubbleMixin);
    obj.initSpeechBubbleMixin();

    return obj;
});

registerSargaFactory('toggle', (id, ...args) => {
    let obj = new SargaRuntimeObject(id, ...args);

    Object.assign(obj, ToggleMixin);
    obj.initToggleMixin();

    return obj;
});

// console.log(`sarga factory items -> ${Array.from(getSargaFactoryNames())}`);

// const obj = createSargaObject('vanilla', 'id0', { k: 'blah', v: 'bluh' });
// const char1 = createSargaObject('character', 'id1', { k: 'name', v: 'narrator' });
// console.log(obj);
// console.dir(char1);
// console.log(char1.getDisplayName());