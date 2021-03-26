import { v4 as uuidv4 } from 'uuid';

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

class SATBLambda {
    static isLambda = true;

    fn;
    label;

    constructor(fn, label=null) {
        this.fn;
        this.label = label;
        this.id = uuidv4();
    }
}

class SATBScene {
    static isScene = true;
    name;
    sceneScript;

    constructor(name) {
        this.name = name;
        this.sceneScript = [];
    }

    say(sentence, character, ...args) {
        this.sceneScript.push
    }
}

export class SATBBook {
    static isBook = true;
    name;
    constructor(name) {
        this.name = name;
    }
}