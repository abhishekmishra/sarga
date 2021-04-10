// import p5 from "p5";
// import "p5/lib/addons/p5.sound";
import sargatut from '../samples/test1.sarga';
import { sargaParse } from './sarga_parse';
import { SargaDisplay } from './sarga_display';


const examples = [
    sargatut
];


for (let eg of examples) {
    let sargaScript = sargaParse("inline", eg);
    const display = new SargaDisplay(sargaScript);
    display.show();
}