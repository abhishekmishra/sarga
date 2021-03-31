import { v5 as uuidv5, v4 as uuidv4 } from 'uuid';
import { SargaHeap } from './sarga_heap';

export const Sarga_NAMESPACE = '5903ea4b-cfed-4c58-991f-0c4624be1b08';

export function loadBook(clazz) {
    let b = new clazz();
    console.log(`loaded book ${b.name}`);
}

class SargaCharacter {
    static isCharacter = true;
    name;
    constructor(name) {
        this.name = name;
    }
}

class SargaInstructor extends SargaCharacter {
    static isInstructor = true;
}

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

export class SargaSays extends SargaScriptLine {
    constructor(tosay = 'nothing', c = 'nobody', label = null) {
        super((state) => {
            return {
                command: 'say',
                character: c,
                text: tosay,
                pause: true
            }
        },
            label);
    }
}

export function says(tosay = 'nothing', c = 'nobody', label = null) {
    return new SargaSays(tosay, c, label);
}

export function scene(img) {
    return new SargaScriptLine((state) => {
        return {
            command: 'scene',
            image: img
        }
    });
}

export function show(img) {
    return new SargaScriptLine((state) => {
        return {
            command: 'show',
            image: img
        }
    });
}

export class SargaBlock extends SargaScriptItem {
    static isBlock = true;
    items;
    images;
    audioFiles;
    sourceString;

    constructor(name) {
        super(name);
        this.items = [];
        this.images = [];
    }

    addItem(item) {
        this.items.push(item);
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
    block;
    location;
    heap;

    constructor(block, parentHeap = null) {
        if (!block.constructor.isBlock) {
            throw ('not a block');
        }
        this.block = block;
        this.location = -1;
        this.heap = new SargaHeap(parentHeap);
    }

    next() {
        if (this.location >= this.block.items.length - 1) {
            return false;
        } else {
            this.location += 1;
            return true;
        }
    }

    current() {
        return this.block.items[this.location];
    }

    runCurrent() {
        let ci = this.current();
        if (ci.do) {
            return ci.do(this.heap);
        } else {
            //throw(`${ci} does not have a do method`);
        }
    }

    hasPrevious() {
        return this.location > 0;
    }

    hasNext() {
        return this.location < this.block.items.length;
    }

    dispose() {
        this.location = -1;
        this.heap.dispose();
        this.heap = null;
    }
}

export class SargaRunner {
    block;
    blockRunnerStack;

    state;
    images;

    constructor(block) {
        this.block = block;
        this.state = {};
        this.blockRunnerStack = [new SargaBlockRunner(this.block)];
        this.images = [];

        for (let img of this.block.images) {
            this.images[img.name] = s.loadImage(img.url);
        }
    }

    setup() {
        this.state = {
            'character': null,
            'character_modifiers': [],
            'text': null,
            'scene': [],
            'music': null,
            'pause': false
        };
    }

    tick() {
        if (!this.state.pause) {
            let currentItem = null;
            const res = this.next();
            if (res) {
                currentItem = this.current();
                while (currentItem.constructor.isBlock) {
                    console.log('encountered a block, auto next');
                    this.next();
                    currentItem = this.current();
                }
                console.log(currentItem);
                const args = this.runCurrent();
                if (args) {
                    switch (args.command) {
                        case "say":
                            if (args.character) {
                                this.state.character = args.character;
                            }
                            if (args.text) {
                                this.state.text = args.text;
                            }
                            if (args.pause) {
                                this.state.pause = args.pause;
                            }
                            break;
                        case "scene":
                            this.state.scene = [];
                            if (args.image) {
                                this.state.scene.push(this.images[args.image]);
                            }
                        case "show":
                            if (args.image) {
                                this.state.scene.push(this.images[args.image]);
                            }
                    }
                }
            } else {
                this.state.text = "OVER";
            }
        }

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