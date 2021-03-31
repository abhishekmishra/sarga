import { SargaRunner } from './sarga_runtime';

export class SargaBlockDisplay {
    block;
    state;
    blockRunner;
    images;

    constructor(block) {
        this.block = block;
        this.state = {};
        this.images = [];
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
        for (let img of this.block.images) {
            this.images[img.name] = s.loadImage(img.url);
        }
        console.log(this.images);
    }

    setup(s) {
        this.state = {
            'character': null,
            'character_modifiers': [],
            'text': null,
            'scene': [],
            'music': null,
            'pause': false
        };
        this.blockRunner = new SargaRunner(this.block);
    }

    keyPressed() {
        this.state.pause = false;
    }

    draw(s) {
        if (!this.state.pause) {
            let currentItem = null;
            const res = this.blockRunner.next();
            if (res) {
                currentItem = this.blockRunner.current();
                while (currentItem.constructor.isBlock) {
                    console.log('encountered a block, auto next');
                    this.blockRunner.next();
                    currentItem = this.blockRunner.current();
                }
                console.log(currentItem);
                const args = currentItem.do(this.state);
                switch (args.command) {
                    case "say":
                        if (args.character) {
                            this.state.character = args.character;
                        }
                        if (args.text) {
                            this.state.text = args.text;
                        }
                        if (args.pause) {
                            this.state.pause = args.pause;
                        }
                        break;
                    case "scene":
                        this.state.scene = [];
                        if (args.image) {
                            this.state.scene.push(this.images[args.image]);
                        }
                    case "show":
                        if (args.image) {
                            this.state.scene.push(this.images[args.image]);
                        }
                }
            } else {
                this.state.text = "OVER";
            }
        }

        s.fill(255);
        if (this.state.text === null) {
            s.text('no text', 100, s.height - 100);
        } else {
            for (let img of this.state.scene) {
                s.image(img, 0, 0, s.width, s.height);
            }
            s.text(this.state.character, 10, s.height - 100);
            s.text(this.state.text, 100, s.height - 100);
        }
    }
}
