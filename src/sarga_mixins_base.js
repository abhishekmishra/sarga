import { layoutItemsFromString, breakLines, positionItems } from 'tex-linebreak';

export const DisplayNameMixin = {

    getDisplayName() {
        return this.name;
    },

    hasDisplayName() {
        return true;
    }

};

export const ScreenLocationMixin = {
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

export const DimensionMixin = {
    initDimensionMixin() {
        if(!this.width) {
            this.width = 100;
        }
        if(!this.height) {
            this.height = 10;
        }
    },

    hasDimensions() {
        return true;
    }
}

export const PreloadMixin = {
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

export const ShowMixin = {
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

export const ImageMixin = {
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
        s.image(imgObj, 0, 0, s.width, s.height);
    }
}

export const RedirectSpeechMixin = {
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
        speechBubble.speak(this.text, this.color);
    }
}

export const CounterMixin = {
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

export const SpeechBubbleMixin = {
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
        if(!this.textColor) {
            this.textColor = 100;
        }
        if(!this.textSize) {
            this.textSize = 20;
        }
        if (!this.width) {
            this.width = 400;
        }
    },

    speak(text, color = null) {
        this.text = text;
        if(color !== null) {
            this.textColor = color;
        }
    },

    drawText(s) {
        console.log("text -> " + this.text);
        const textSize = this.textSize == null ? 20 : parseInt(this.textSize);
        console.log(`text size = ${textSize}`);
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
        const lineWidth = this.width;
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

            s.text(item.text, textx, texty);
        });
    }
}

export const ToggleMixin = {
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
