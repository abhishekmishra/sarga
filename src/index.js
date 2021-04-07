// import p5 from "p5";
// import "p5/lib/addons/p5.sound";
import sargatut from '../samples/test0.sarga';
import { sargaParse } from './sarga_parse';
import { SargaBlockDisplay } from './sarga_display';


const examples = [
    sargatut
];


for (let eg of examples) {
    let sargaScript = sargaParse("inline", eg);
    console.log(sargaScript);

    const display = new SargaBlockDisplay(sargaScript);
    const displaySketch = new p5(display.getSketch());
}

