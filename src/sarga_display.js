import { SargaRunner } from './sarga_runtime';

export class SargaBlockDisplay {
    block;
    blockRunner;

    constructor(block) {
        this.block = block;
        this.blockRunner = new SargaRunner(this.block);
    }

    getSketch() {
        return (s) => {
            s.preload = () => {
                this.preload(s);
            }

            s.setup = () => {
                s.createCanvas(500, 500);
                let sourceStrDiv = s.createElement('div', this.block.sourceString);
                sourceStrDiv.style('white-space', 'pre-wrap');
                sourceStrDiv.style('border', '2px solid gray');
                sourceStrDiv.style('padding', '2px');
                sourceStrDiv.style('height', '250px');
                sourceStrDiv.style('overflow', 'auto');
                this.setup(s);
            }

            s.keyPressed = () => {
                this.keyPressed();
            }

            s.draw = () => {
                s.background(0);
                s.textSize(20);
                this.draw(s);
            }
        }
    }

    preload(s) {
        this.blockRunner.preload(s);
    }

    setup(s) {
        this.blockRunner.setup();
    }

    keyPressed() {
        this.blockRunner.state.pause = false;
    }

    draw(s) {
        this.blockRunner.tick();       
    }
}
