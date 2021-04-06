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
                s.createCanvas(s.windowWidth * 0.95, s.windowHeight * 0.5);
                let sourceStrDiv = s.createElement('div', this.block.sourceString);
                sourceStrDiv.style('white-space', 'pre-wrap');               
                sourceStrDiv.style('margin', '0px');
                sourceStrDiv.style('padding', '0px');
                sourceStrDiv.style('height', '250px');
                sourceStrDiv.style('overflow', 'auto');
                this.setup(s);
            }

            s.keyPressed = () => {
                this.keyPressed();
            }

            s.draw = () => {
                // s.background(0);
                // s.textSize(20);
                this.draw(s);
            }
        }
    }

    preload(s) {
        this.blockRunner.preload(s);
    }

    setup(s) {
        this.blockRunner.setup(s);
    }

    keyPressed() {
        this.blockRunner.play();
    }

    draw(s) {
        this.blockRunner.tick(s);
    }
}
