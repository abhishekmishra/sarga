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
        for(let item of items) {
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
    location;

    constructor() {
        this.block = null;
        this.location = [];
    }

    runBlock(block) {
        this.block = block;
        this.location = [this.block.id()];
    }

    showNext() {
        let currentLoc = this.location;
    }

    showPrevious() {

    }

    hasNext() {

    }

    hasPrevious() {

    }

    location() {

    }
}