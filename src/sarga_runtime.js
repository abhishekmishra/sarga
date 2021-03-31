import { v5 as uuidv5, v4 as uuidv4 } from 'uuid';

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

    constructor(block) {
        if (!block.constructor.isBlock) {
            throw ('not a block');
        }
        this.block = block;
        this.location = -1;
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

    hasPrevious() {
        return this.location > 0;
    }

    hasNext() {
        return this.location < this.block.items.length;
    }
}

export class SargaRunner {
    block;
    stack;

    constructor(block) {
        this.block = block;
        this.stack = [new SargaBlockRunner(this.block)];
    }

    next() {
        if (this.stack.length === 0) {
            return false;
        }

        const currentBlk = this.stack[this.stack.length - 1];
        if (currentBlk.hasNext()) {
            let curRes = currentBlk.next();
            if (!curRes) {
                this.stack.pop();
            }
        } else {
            this.stack.pop();
        }

        if (this.stack.length === 0) {
            return false;
        }
        return true;
    }

    current() {
        if (this.stack.length === 0) {
            throw ('no current item');
        }

        const currentBlk = this.stack[this.stack.length - 1];
        const currentItem = currentBlk.current();
        if (currentItem.constructor.isBlock) {
            // if current item is a block, push onto stack
            console.log('current item is a block, adding new block runner to stack');
            currentBlk.next();
            const br = new SargaBlockRunner(currentItem);
            this.stack.push(br);
            console.log(this.stack);
        }
        return currentItem;
    }

    previous() {
        throw ('not implemented');
    }

    hasNext() {
        // if no items in stack
        if (this.stack.length < 1) {
            return false;
        }

        const currentBlk = this.stack[this.stack.length - 1];

        // if current block has more items
        // or there are more than one block on the stack
        // return true else false
        if (currentBlk.hasNext()) {
            return true;
        } else if (this.stack.length > 1) {
            return true;
        } else {
            return false;
        }
    }

    hasPrevious() {
        // if no items in stack
        if (this.stack.length < 1) {
            return false;
        }

        const currentBlk = this.stack[this.stack.length - 1];

        // if current block has previous items
        // or there are more than one block on the stack
        // return true else false
        if (currentBlk.hasPrevious()) {
            return true;
        } else if (this.stack.length > 1) {
            return true;
        } else {
            return false;
        }
    }

    location() {

    }
}