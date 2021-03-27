import { SATBBlockRunner, SATBRunner } from '../src/satblib';

export class SATBBlockDisplay {
    block;
    state;
    blockRunner;
    images;

    constructor(block) {
        this.block = block;
        this.state = {};
        this.images = [];
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
        this.blockRunner = new SATBRunner(this.block);
    }

    keyPressed() {
        this.state.pause = false;
    }

    draw(s) {
        if (!this.state.pause) {
            const res = this.blockRunner.next();
            if (res) {
                const args = this.blockRunner.current().do(this.state);
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
