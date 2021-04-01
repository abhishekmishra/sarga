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
            console.log(arg);
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

const DisplayNameMixin = {

    getDisplayName() {
        return this.name;
    },

    hasDisplayName() {
        return true;
    }

};

const ScreenLocationMixin = {
    initScreenLocationMixin() {
        if (!this.x) { this.x = 0 };
        if (!this.y) { this.y = 0 };
        if (!this.z) { this.z = 0 };
        if (!this.offset) { this.offset = 'origin' }
    },

    getRawCoords() {
        return [this.x, this.y, this.z];
    },

    getOffset() {
        return this.offset;
    },

    getScreenCoords() {
        //TODO: implement offsets
        return [this.x, this.y, this.z];
    },

    hasScreenLocation() {
        return true;
    }
}

const ImageMixin = {
    initImageMixin() {
        if (!this.imageExtension) {
            this.imageExtension = ".png";
        }

        if (!this.views) {
            this.views = [""];
        }

        if (!this.view) {
            this.view = "";
        }
    },

    getImageNames() {
        let imgNames = [];
        const imgBaseName = this.image.replaceAll(/\s+/, '_');
        for (let view of this.views) {
            const viewName = view.replaceAll(/\s+/, '_');
            const imgName = imgBaseName + viewName + this.imageExtension;
            imgNames.push(imgName);
        }

        return imgNames;
    },

    getCurrentImage() {
        const imgBaseName = this.image.replaceAll(/\s+/, '_');
        const viewName = this.view.replaceAll(/\s+/, '_');
        const imgName = imgBaseName + viewName + this.imageExtension;
        return imgName;
    },

    hasImage() {
        return true;
    }
}

registerSargaFactory('vanilla', (id, ...args) => {
    return new SargaRuntimeObject(id, ...args);
});

registerSargaFactory('character', (id, ...args) => {
    let obj = new SargaRuntimeObject(id, ...args);
    Object.assign(obj, DisplayNameMixin);

    Object.assign(obj, ScreenLocationMixin);
    obj.initScreenLocationMixin();

    Object.assign(obj, ImageMixin);
    return obj;
});

console.log(`sarga factory items -> ${Array.from(getSargaFactoryNames())}`);

const obj = createSargaObject('vanilla', 'id0', { k: 'blah', v: 'bluh' });
const char1 = createSargaObject('character', 'id1', { k: 'name', v: 'narrator' });
console.log(obj);
console.dir(char1);
console.log(char1.getDisplayName());