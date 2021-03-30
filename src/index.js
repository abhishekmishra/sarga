import * as p5 from 'p5';
import { sketch } from './sketch';
import test0 from 'raw-loader!../samples/test0.sarga';
import test1 from 'raw-loader!../samples/test1.sarga';
import test2 from 'raw-loader!../samples/test2.sarga';
import sargatut from 'raw-loader!../samples/sargatut.sarga';
import { Sarga, SargaSemantics } from './sarga_main';

// const sketchInstance = new p5(sketch);

const examples = [
    // test0,
    // test1,
    // test2
    sargatut
];

for (let eg of examples) {
    const m = Sarga.match(eg);
    console.log(`${eg} -> ${m.succeeded()}`);

    if (!m.succeeded()) {
        console.log(Sarga.trace(eg).toString());
    } else {
        // console.log(satbGrammar.trace(eg).toString());
        const res = SargaSemantics(m).eval()
        console.log(res);
        // console.log(JSON.stringify(res, null, 2));
    }
}