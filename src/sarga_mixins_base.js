import { registerSargaMixin } from './sarga_mixin';

import { layoutItemsFromString, breakLines, positionItems } from 'tex-linebreak';

const displayNameMixin = {

    initDisplayNameMixin() {
        if (!this.name) {
            this.name = this.id;
        }
    },

    getDisplayName() {
        return this.name;
    },

    hasDisplayName() {
        return true;
    }

};

const locationMixin = {
    initLocationMixin() {
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

    hasLocation() {
        return true;
    }
};

const dimensionMixin = {
    initDimensionMixin() {
        if (!this.w) {
            this.w = -1;
        }
        if (!this.h) {
            this.h = -1;
        }
    },

    hasDimensions() {
        return true;
    }
};

const preloadMixin = {
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
};

const showMixin = {
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
};

const imageMixin = {
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
            s.loadImage(img, (imgObj) => {
                this._imageObjects.set(img, imgObj);
            });
        }
    },

    getCurrentImage() {
        const imgBaseName = this.image.replaceAll(/\s+/g, '_');
        const viewName = this.view.replaceAll(/\s+/g, '_');
        const imgName = imgBaseName + viewName + this.imageExtension;
        return imgName;
    },

    hasImage() {
        return true;
    },

    drawImage(s) {
        const currentImg = this.getCurrentImage();
        const imgObj = this._imageObjects.get(currentImg);
        s.image(
            imgObj,
            this.x,
            this.y,
            this.w && this.w != -1 ? this.w : s.width,
            this.h && this.h != -1 ? this.h : s.height
        );
    }
};

const speechMixin = {
    initSpeechMixin() {
        if (!this.text) {
            this.text = "!dummy text!";
        }
        if (!this.speechBubbleName) {
            this.speechBubbleName = "Bubble";
        }
        if (!this.speakerBubbleName) {
            this.speakerBubbleName = "SpeakerBubble";
        }
    },

    canSpeak() {
        return true;
    },

    say() {
        const speechBubble = this._heap.get(this.speechBubbleName);
        speechBubble.speak(this.text, this.color);
        if (this.name) {
            const speakerBubble = this._heap.get(this.speakerBubbleName);
            speakerBubble.speak(this.name, this.color);
        }
        this._heap.get("Play").off();
    }
};

const counterMixin = {
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
};

const speechBubbleMixin = {
    initSpeechBubbleMixin() {
        if (this.addShowFn) {
            this.addShowFn((s) => { this.drawText(s) });
        }
        if (!this.text) {
            this.text = 'what vro';
        }
        if (!this.font) {
            this.font = null;
        }
        if (!this.textColor) {
            this.textColor = 100;
        }
        if (!this.textSize) {
            this.textSize = 20;
        }
        if (!this.width) {
            this.width = 400;
        }
    },

    speak(text, color = null) {
        this.text = text;
        if (color !== null) {
            this.textColor = color;
        }
    },

    drawText(s) {
        // console.log("text -> " + this.text);
        const textSize = this.textSize == null ? 20 : parseInt(this.textSize);
        // console.log(`text size = ${textSize}`);
        s.textSize(textSize);
        s.fill(this.textColor);

        // Convert your text to a set of "box", "glue" and "penalty" items used by the
        // line-breaking process.
        //
        // "Box" items are things (typically words) to typeset.
        // "Glue" items are spaces that can stretch or shrink or be a breakpoint.
        // "Penalty" items are possible breakpoints (hyphens, end of a paragraph etc.).
        //
        // `layoutItemsFromString` is a helper that takes a string and a function to
        // measure the width of a piece of that string and returns a suitable set of
        // items.
        const measureText = text => s.textWidth(text);
        const items = layoutItemsFromString(this.text, measureText);

        // Find where to insert line-breaks in order to optimally lay out the text.
        const lineWidth = this.w;
        const breakpoints = breakLines(items, lineWidth)

        // Compute the (xOffset, line number) at which to draw each box item.
        const positionedItems = positionItems(items, lineWidth, breakpoints);

        positionedItems.forEach(pi => {
            const item = items[pi.item];

            // Add code to draw `item.text` at `(box.xOffset, box.line)` to whatever output
            // you want, eg. `<canvas>`, HTML elements with spacing created using CSS,
            // WebGL, ...

            let textx = this.x + pi.xOffset;
            let texty = this.y + (pi.line * textSize)

            // console.log(`${textx}, ${texty}`);
            s.text(item.text, textx, texty);
        });
    }
};

const toggleMixin = {
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
};

const tickMixin = {
    initTickMixin() {
        if (!this.tickFns) {
            this.tickFns = [];
        }
    },

    addTickFn(fn) {
        this.tickFns.push(fn);
    },

    tick(dt) {
        for (let tickFn of this.tickFns) {
            tickFn(dt);
        }
    },

    hasTick() {
        return true;
    }
};

const soundMixin = {
    initSoundMixin() {
        console.log('init sound mixin');
        if (this.addPreloadFn) {
            this.addPreloadFn((s) => this.loadSound(s));
        }
    },

    getSoundName() {
        let soundName = this.sound.replaceAll(/\s+/g, '_');
        return soundName;
    },

    loadSound(s) {
        console.log(`loading ${this.getSoundName()}`);
        s.loadSound(this.getSoundName(), (sfile) => {
            this.soundFile = sfile;
        });
    },

    play(s) {
        console.log('play sound');
        this.soundFile.play();
    },

    hasSound() {
        return true;
    }
};

const debugMixin = {
    print() {
        console.log(`Heap object ${this.id}`);
        console.log(this);
    }
}

const colorMixin = {
    initColorMixin() {
        if (!this.color) {
            this.color = "#ff0000";
        }
    }
}

const fillMixin = {
    initFillMixin() {
        if (this.addShowFn) {
            this.addShowFn((s) => this.drawFill(s));
        }
        if (!this.tl) {
            this.tl = 0;
            this.tr = 0;
            this.br = 0;
            this.bl = 0;
        }
    },

    drawFill(s) {
        // console.log(`${this.color}, ${this.x}, ${this.y}, ${this.w}, ${this.h}`);
        s.fill(this.color);
        s.noStroke();
        s.rect(
            this.x,
            this.y,
            this.w,
            this.h,
            this.tl,
            this.tr,
            this.br,
            this.bl
        );
    }
}

registerSargaMixin("Debug", debugMixin);
registerSargaMixin("DisplayName", displayNameMixin);
registerSargaMixin("Location", locationMixin);
registerSargaMixin("Dimension", dimensionMixin);
registerSargaMixin("Preload", preloadMixin);
registerSargaMixin("Show", showMixin);
registerSargaMixin("Image", imageMixin,
    [
        'Location',
        'Dimension',
        'Show'
    ]);

registerSargaMixin("Speech", speechMixin, ["DisplayName"]);
registerSargaMixin("Counter", counterMixin);
registerSargaMixin("SpeechBubble", speechBubbleMixin, ['Location', 'Dimension', 'Show']);
registerSargaMixin("Toggle", toggleMixin);
registerSargaMixin("Tick", tickMixin);
registerSargaMixin("Sound", soundMixin, ["Preload"]);
registerSargaMixin("Color", colorMixin);
registerSargaMixin("Fill", fillMixin, ["Location", "Dimension", "Color", "Show"]);