import { registerSargaMixin } from './sarga_mixin';

registerSargaMixin("Animate", {
    initAnimateMixin() {
        if (!this.animators) {
            this.animators = []
        }
        if (this.hasTick && this.hasTick()) {
            this.addTickFn((dt) => this.animate(dt));
        }
    },

    animator(...args) {
        let objName = null;
        for (let arg of args) {
            if (arg.k === "name") {
                objName = arg.v;
            }
        }
        console.log(`objname is ${objName}`);
        if (objName !== null) {
            this.animators.push(this._heap.get(objName));
        }
        else {
            throw (`animator name cannot be empty`);
        }
    },

    animate(dt) {
        for (let animatorObj of this.animators) {
            animatorObj.runAnimator(dt);
        }
    }
});

/**
 * needs the following parameters to animate
 * interval - when to toggle
 * target - which object to set
 * attr - which attribute of obj to st
 * val0 to valn-1 - values to apply to the attribute
 */
registerSargaMixin("FixedSequenceAnimator", {
    initFixedSequenceAnimatorMixin() {
        if (!this.timeSinceUpdate) {
            this.timeSinceUpdate = 0;
        }
        if (!this.interval) {
            this.interval = 1000;
        }
        if (!this.index) {
            this.index = 0;
        }
    },

    _setupValues(typeOfTarget) {
        this._parsedValues = [];
        for(let v of this.values.split(',')) {
            v = v.trim();
            if(typeOfTarget === "number") {
                this._parsedValues.push(parseFloat(v));
            } else {
                this._parsedValues.push(v);
            }
        }
    },

    runAnimator(dt) {
        this.timeSinceUpdate += dt;
        // console.log(dt);
        // console.log(this.timeSinceUpdate);
        if (this.timeSinceUpdate > this.interval) {
            // console.log('Time to animate forward, reset time since update');
            if (this.target && this.attr) {
                let tObj = this._heap.get(this.target)
                if (tObj[this.attr]) {
                    // console.log('Animate target is');
                    // console.log(tObj);

                    if(!this._parsedValues) {
                        this._setupValues(typeof tObj[this.attr]);
                        console.log(this._parsedValues);
                    }

                    if(this._parsedValues) {
                        this.index += 1;
                        if(this.index >= this._parsedValues.length) {
                            this.index = 0;
                        }
                        tObj[this.attr] = this._parsedValues[this.index];
                    }
                }
            }
            this.timeSinceUpdate = 0;
        }
    }
})