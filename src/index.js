// import { p5 } from 'p5'; //TODO: check why this doesn't work
import {loadBook} from '../src/satblib';
import {Basic0Book} from '../samples/basic0/index';

const sketch = (s) => {
    s.setup = () => {
        s.createCanvas(500, 500);
        loadBook(Basic0Book);
    }

    s.draw = () => {
        s.background(0);
        s.circle(100, 100, 50);
    }
}

const sketchInstance = new p5(sketch);