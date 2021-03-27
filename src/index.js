// import { p5 } from 'p5'; //TODO: check why this doesn't work
import { SATBBlock, SATBBlockRunner, scene, show, says, SATBScriptLine } from '../src/satblib';
import { Basic0Book } from '../samples/basic0/index';
import { SATBBlockDisplay } from '../src/satbdisplay';

const sketch = (s) => {
    let block0 = new SATBBlock("umm");
    let block1 = new SATBBlock("what");

    block0.addImage('../samples/basic0/assets/images/Hills Layer 01.png');
    block0.addImage('../samples/basic0/assets/images/Hills Layer 02.png');
    block0.addImage('../samples/basic0/assets/images/Hills Layer 03.png');
    block0.addImage('../samples/basic0/assets/images/Hills Layer 04.png');
    block0.addImage('../samples/basic0/assets/images/Hills Layer 05.png');

    // first few items
    block0.addItem(scene('hills layer 01'));
    block0.addItem(show('hills layer 02'));
    block0.addItem(says('hello world 0'));
    block0.addItem(says('hello world 1'));

    //add a block
    block1.addItem(scene('hills layer 02'));
    block1.addItem(show('hills layer 05'));
    block1.addItem(says('hello from block1-0'));
    block1.addItem(says('hello from block1-1'));
    block0.addItem(block1);

    //few more items
    block0.addItem(scene('hills layer 03'));
    block0.addItem(show('hills layer 04'));
    block0.addItem(says('hello world 2'));
    block0.addItem(says('hello world 3'));


    let blockDisplay = new SATBBlockDisplay(block0);

    s.preload = () => {
        blockDisplay.preload(s);
    }

    s.setup = () => {
        s.createCanvas(500, 500);
        blockDisplay.setup(s);
    }

    s.keyPressed = () => {
        blockDisplay.keyPressed();
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