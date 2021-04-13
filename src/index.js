// import p5 from "p5";
// import "p5/lib/addons/p5.sound";
// import sargatut from '../samples/test1.sarga';
// import Sarga from './sarga_main';

const examples = [
    `test is Character
    test: "hello world"
    `
];

for (let eg of examples) {
    // let sargaScript = sargaParse("inline", eg);
    const display = new Sarga.Display(eg);
    display.show();
}