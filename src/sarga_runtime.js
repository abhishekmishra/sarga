import { v5 as uuidv5, v4 as uuidv4 } from 'uuid';
import { createSargaObject } from './sarga_factory';
import { SargaHeap } from './sarga_heap';
import {registerBaseFactories} from './sarga_factories_base';

export const Sarga_NAMESPACE = '5903ea4b-cfed-4c58-991f-0c4624be1b08';

class SargaScriptItem {
    static isScriptItem = true;
    _label;
    _id;

    constructor(label = null) {
        this._label = label !== null ? label : uuidv4();
        this._id = uuidv5(this._label, Sarga_NAMESPACE);
    }

    label() {
        return this._label;
    }

    id() {
        return this._id;
    }
}

export class SargaScriptLine extends SargaScriptItem {
    fn;
    constructor(fn, label = null) {
        super(label);
        this.fn = fn;
    }

    do(state) {
        return this.fn(state);
    }
}

export const SargaScriptDeclarationMixin = {
    isDeclaration() {
        return true;
    }
}

export class SargaBlock extends SargaScriptItem {
    static isBlock = true;
    items;
    images;
    audioFiles;
    sourceString;

    declarationItems;

    constructor(name) {
        super(name);
        this.items = [];
        this.images = [];
        this.declarationItems = [];
    }

    addItem(item) {
        this.items.push(item);
    }

    addDeclarationItem(item) {
        this.declarationItems.push(item);
    }

    addImage(imgUrl) {
        this.images.push({
            name: imgUrl.substring(imgUrl.lastIndexOf('/') + 1, imgUrl.lastIndexOf('.')).toLowerCase(),
            url: imgUrl
        });
    }

    addItems(items) {
        for (let item of items) {
            this.addItem(item);
        }
    }

    name = this.label;
}

export class SargaConcept extends SargaBlock {
    static isConcept = true;

    constructor(name) {
        super(name);
    }
}

export class SargaBook extends SargaBlock {
    static isBook = true;
    constructor(name) {
        super(name);
        this.blocks = [];
    }
}

export class SargaBlockRunner {
    _block;
    _location;
    _heap;

    constructor(block, heap) {
        if (!block.constructor.isBlock) {
            throw ('not a block');
        }
        this._block = block;
        this._location = -1;
        this._heap = heap;
    }

    preload(s) {
        for (let item of this._block.declarationItems) {
            item.do(this._heap);
        }

        for (let heapKey of this._heap.keys()) {
            const heapVal = this._heap.get(heapKey);
            console.log(`${heapKey} -> ${heapVal}`);
            if (heapVal && heapVal.hasPreload && heapVal.hasPreload()) {
                heapVal.preload(s);
            }
        }
    }

    setup(s) {
        for (let heapKey of this._heap.keys()) {
            const heapVal = this._heap.get(heapKey);
            console.log(`${heapKey} -> ${heapVal}`);
        }
    }

    next() {
        if (this._location >= this._block.items.length - 1) {
            return false;
        } else {
            this._location += 1;
            return true;
        }
    }

    current() {
        return this._block.items[this._location];
    }

    runCurrent() {
        let ci = this.current();
        if (ci.do) {
            return ci.do(this._heap);
        } else {
            //throw(`${ci} does not have a do method`);
        }
    }

    showAll(s) {
        for (let heapKey of this._heap.keys()) {
            const heapVal = this._heap.get(heapKey);
            if (heapVal && heapVal.hasShow && heapVal.hasShow()) {
                console.log(`showing ${heapKey}`);
                heapVal.runShow(s);
            }
        }
    }

    hasPrevious() {
        return this._location > 0;
    }

    hasNext() {
        return this._location < this._block.items.length;
    }

    dispose() {
        this._location = -1;
        this._heap.dispose();
        this._heap = null;
    }
}

export class SargaRunner {
    block;
    blockRunnerStack;

    _topHeap;
    _play;
    images;

    constructor(block) {

        registerBaseFactories();

        this.block = block;
        this._topHeap = new SargaHeap();
        this.blockRunnerStack = [new SargaBlockRunner(this.block, this._topHeap)];
        this.images = [];

        for (let img of this.block.images) {
            this.images[img.name] = s.loadImage(img.url);
        }
    }

    preload(s) {
        const currentBlk = this.blockRunnerStack[this.blockRunnerStack.length - 1];
        currentBlk.preload(s);
    }

    setup(s) {
        if (!this._topHeap.has("Bubble")) {
            const bubbleObj = createSargaObject("speechbubble", "Bubble");
            this._topHeap.addName("Bubble", bubbleObj);
            bubbleObj.show();
            let margin = s.width/10;
            bubbleObj.x = margin;
            bubbleObj.width = s.width - (2 * margin);
            bubbleObj.y = s.height - 100;
        }
        if (!this._topHeap.has("Play")) {
            this._play = createSargaObject("toggle", "Play");
            this._topHeap.addName("Play", this._play);
        }
        this._play.on();

        const currentBlk = this.blockRunnerStack[this.blockRunnerStack.length - 1];
        currentBlk.setup(s);
    }

    tick(s) {
        // s.fill(128);
        // s.text("play status -> " + this._play.switch, 100, 100);

        // play all statements as long as play switch is on
        if (this._play.switch) {
            let currentItem = null;
            const res = this.next();
            if (res) {
                currentItem = this.current();
                while (currentItem.constructor.isBlock) {
                    console.log('encountered a block, auto next');
                    this.next();
                    currentItem = this.current();
                }
                // console.log(currentItem);
                const args = this.runCurrent();
                // display items with show
                const currentBlk = this.blockRunnerStack[this.blockRunnerStack.length - 1];
                currentBlk.showAll(s);
            }
        }

        // s.background(128, 0, 0);
        // let img = s.loadImage('www/assets/images/bg01.png', img => {
        //     console.log(img);
        //     s.image(img, 0, 0, s.width, s.height);
        // });

        // this._play.off();
    }

    play() {
        this._play.on();
    }

    next() {
        if (this.blockRunnerStack.length === 0) {
            return false;
        }

        const currentBlk = this.blockRunnerStack[this.blockRunnerStack.length - 1];
        if (currentBlk.hasNext()) {
            let curRes = currentBlk.next();
            if (!curRes) {
                this.blockRunnerStack.pop();
            }
        } else {
            this.blockRunnerStack.pop();
        }

        if (this.blockRunnerStack.length === 0) {
            return false;
        }
        return true;
    }

    current() {
        if (this.blockRunnerStack.length === 0) {
            throw ('no current item');
        }

        const currentBlk = this.blockRunnerStack[this.blockRunnerStack.length - 1];
        const currentItem = currentBlk.current();
        if (currentItem.constructor.isBlock) {
            // if current item is a block, push onto stack
            console.log('current item is a block, adding new block runner to stack');
            currentBlk.next();
            const br = new SargaBlockRunner(currentItem);
            this.blockRunnerStack.push(br);
            console.log(this.blockRunnerStack);
        }
        return currentItem;
    }

    runCurrent() {
        const currentBlk = this.blockRunnerStack[this.blockRunnerStack.length - 1];
        return currentBlk.runCurrent();
    }

    previous() {
        throw ('not implemented');
    }

    hasNext() {
        // if no items in stack
        if (this.blockRunnerStack.length < 1) {
            return false;
        }

        const currentBlk = this.blockRunnerStack[this.blockRunnerStack.length - 1];

        // if current block has more items
        // or there are more than one block on the stack
        // return true else false
        if (currentBlk.hasNext()) {
            return true;
        } else if (this.blockRunnerStack.length > 1) {
            return true;
        } else {
            return false;
        }
    }

    hasPrevious() {
        // if no items in stack
        if (this.blockRunnerStack.length < 1) {
            return false;
        }

        const currentBlk = this.blockRunnerStack[this.blockRunnerStack.length - 1];

        // if current block has previous items
        // or there are more than one block on the stack
        // return true else false
        if (currentBlk.hasPrevious()) {
            return true;
        } else if (this.blockRunnerStack.length > 1) {
            return true;
        } else {
            return false;
        }
    }

    location() {

    }
}