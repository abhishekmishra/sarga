import { v5 as uuidv5, v4 as uuidv4 } from 'uuid';

export const SATB_NAMESPACE = '5903ea4b-cfed-4c58-991f-0c4624be1b08';

export function loadBook(clazz) {
    let b = new clazz();
    console.log(`loaded book ${b.name}`);
}

class SATBCharacter {
    static isCharacter = true;
    name;
    constructor(name) {
        this.name = name;
    }
}

class SATBInstructor extends SATBCharacter {
    static isInstructor = true;
}

class SATBScriptItem {
    static isScriptItem = true;
    _label;
    _id;

    constructor(label = null) {
        this._label = label !== null ? label : uuidv4();
        this._id = uuidv5(this._label, SATB_NAMESPACE);
    }

    label() {
        return this._label;
    }

    id() {
        return this._id;
    }
}

export class SATBScriptLine extends SATBScriptItem {
    fn;
    constructor(fn, label = null) {
        super(label);
        this.fn = fn;
    }

    do(state) {
        return this.fn(state);
    }
}

export class SATBSays extends SATBScriptLine {
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
    return new SATBSays(tosay, c, label);
}

export function scene(img) {
    return new SATBScriptLine((state) => {
        return {
            command: 'scene',
            image: img
        }
    });
}

export function show(img) {
    return new SATBScriptLine((state) => {
        return {
            command: 'show',
            image: img
        }
    });
}

export class SATBBlock extends SATBScriptItem {
    static isBlock = true;
    items;
    images;
    audioFiles;

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

export class SATBConcept extends SATBBlock {
    static isConcept = true;

    constructor(name) {
        super(name);
    }
}

export class SATBBook extends SATBBlock {
    static isBook = true;
    constructor(name) {
        super(name);
        this.blocks = [];
    }
}

export class SATBBlockRunner {
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

export class SATBRunner {
    block;
    stack;

    constructor(block) {
        this.block = block;
        this.stack = [new SATBBlockRunner(this.block)];
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
        if (currentItem.isBlock) {
            // if current item is a block, push onto stack
            const br = new SATBBlockRunner(currentBlk.current());
            this.stack.push(br);
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