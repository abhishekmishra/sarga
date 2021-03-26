// import { p5 } from 'p5'; //TODO: check why this doesn't work
import { loadBook, SATBConcept, SATBBlockRunner, SATBScriptLine, SATBSays } from '../src/satblib';
import { Basic0Book } from '../samples/basic0/index';

class BlockDisplay {
    block;
    state;
    blockRunner;

    constructor(block) {
        this.block = block;
        this.state = {};
    }

    setup() {
        this.state = {
            'character': null,
            'character_modifiers': [],
            'text': null,
            'scene': [],
            'music': null
        };
        this.blockRunner = new SATBBlockRunner(this.block);
    }

    next() {
        const res = this.blockRunner.next();
        if (res) {
            const args = this.blockRunner.current().do(this.state);
            if (args.character) {
                this.state.character = args.character;
            }
            if (args.text) {
                this.state.text = args.text;
            }
        } else {
            this.state.text = "OVER";
        }
    }

    draw(s) {
        s.fill(255);
        if (this.state.text === null) {
            s.text('no text', 100, s.height - 100);
        } else {
            s.text(this.state.character, 10, s.height - 100);
            s.text(this.state.text, 100, s.height - 100);
        }
    }
}

const sketch = (s) => {
    let concept0 = null;
    let blockDisplay = null;
    s.setup = () => {
        s.createCanvas(500, 500);
        concept0 = new SATBConcept("umm");
        for (let i = 0; i < 5; i++) {
            concept0.addItem(new SATBSays('hello world' + i));
        }
        blockDisplay = new BlockDisplay(concept0);
        blockDisplay.setup();
    }

    s.keyPressed = () => {
        blockDisplay.next();
    }

    s.draw = () => {
        s.background(0);
        // s.fill(255);
        // s.circle(100, 100, 50);
        s.textSize(20);
        blockDisplay.draw(s);
    }
}

const sketchInstance = new p5(sketch);