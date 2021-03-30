import * as p5 from 'p5';
import { sketch } from './sketch';
import test0 from 'raw-loader!../samples/test0.sudina';
import test1 from 'raw-loader!../samples/test1.sudina';
import test2 from 'raw-loader!../samples/test2.sudina';
import {Sudina, SudinaSemantics} from './sudina_main';

// const sketchInstance = new p5(sketch);

const examples = [
    test0,
    test1,
    test2
];

for (let eg of examples) {
    const m = Sudina.match(eg);
    console.log(`${eg} -> ${m.succeeded()}`);

    if (!m.succeeded()) {
        console.log(Sudina.trace(eg).toString());
    } else {
        // console.log(satbGrammar.trace(eg).toString());
        const res = SudinaSemantics(m).eval()
        console.log(JSON.stringify(res, null, 2));
    }
}