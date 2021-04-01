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

const PreloadMixin = {
    initPreloadMixin() {
        if (!this._preloadFunctions) {
            this._preloadFunctions = [];
        }
    },

    addPreloadFn(fn) {
        this._preloadFunctions.push(fn);
    },

    preload(s) {
        for (let fn of this._preloadFunctions) {
            fn(s);
        }
    },

    hasPreload() {
        return true;
    }
}

const ShowMixin = {
    initShowMixin() {
        if (!this._showFunctions) {
            this._showFunctions = [];
        }

        if (!this.showing) {
            this.showing = false;
        }
    },

    addShowFn(fn) {
        this._showFunctions.push(fn);
    },

    show() {
        this.showing = true;
    },

    hide() {
        this.showing = false;
    },

    runShow(s) {
        if (this.showing) {
            for (let fn of this._showFunctions) {
                fn(s);
            }
        }
    },

    hasShow() {
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

        if (!this._imageObjects) {
            this._imageObjects = new Map();
        }

        if (this.addShowFn) {
            this.addShowFn((s) => this.drawImage(s));
        }

        if (this.addPreloadFn) {
            this.addPreloadFn((s) => this.loadImages(s));
        }
    },

    getImageNames() {
        let imgNames = [];
        const imgBaseName = this.image.replaceAll(/\s+/g, '_');
        for (let view of this.views) {
            const viewName = view.replaceAll(/\s+/g, '_');
            const imgName = imgBaseName + viewName + this.imageExtension;
            imgNames.push(imgName);
        }

        return imgNames;
    },

    loadImages(s) {
        const imgNames = this.getImageNames();
        for (let img of imgNames) {
            console.log(`loading image ${img}`);
            this._imageObjects.set(img, s.loadImage(img));
        }
    },

    getCurrentImage() {
        const imgBaseName = this.image.replaceAll(/\s+/, '_');
        const viewName = this.view.replaceAll(/\s+/, '_');
        const imgName = imgBaseName + viewName + this.imageExtension;
        return imgName;
    },

    hasImage() {
        return true;
    },

    drawImage(s) {
        s.image(this._imageObjects.get(img), 0, 0, s.width, s.height);
    }
}

const RedirectSpeechMixin = {
    initRedirectSpeechMixin() {
        if (!this.text) {
            this.text = "!dummy text!";
        }
        if (!this.speechBubbleName) {
            this.speechBubbleName = "Bubble";
        }
    },

    canSpeak() {
        return true;
    },

    say() {
        const speechBubble = this._heap.get(this.speechBubbleName);
        speechBubble.speak(this.text, {
            name: this.getDisplayName ? this.getDisplayName() : 'nobody',
            font: this.font ? this.font : null,
            color: this.color ? this.color : null,
            fontSize: this.fontSize ? this.fontSize : null
        });
    }
}

const CounterMixin = {
    initCounterMixin() {
        if (!this.start) {
            this.start = 0;
        }
        if (!this.step) {
            this.step = 1;
        }
        if (!this.stop) {
            this.stop = Infinity;
        }
        if (!this.count) {
            this.count = this.start;
        }
    },

    increment() {
        if (this.count < this.stop) {
            this.count += this.step;
        }
    }
}

const SpeechBubbleMixin = {
    initSpeechBubbleMixin() {
        if (this.addShowFn) {
            this.addShowFn((s) => { this.drawImage(s) });
        }
    },

    speak(text, options) {
        this.text = text;
        this.textOptions = options;
    },

    drawText(s) {
        s.text(this.text, this.x, this.y);
    }
}

const ToggleMixin = {
    initToggleMixin() {
        if (!this.switch) {
            this.switch = false;
        }
    },

    toggle() {
        this.switch = !this.switch;
    },

    on() {
        this.switch = true;
    },

    off() {
        this.switch = false;
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