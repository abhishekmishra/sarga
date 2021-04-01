export class SargaHeap {
    _heap;
    _parent;

    constructor(parent = null) {
        this._parent = parent;
        this._heap = {};
    }

    isTopLevel() {
        if (this._heap === null) {
            throw (`Attempt to use disposed heap.`);
        }

        return this._parent === null;
    }

    addName(name, value) {
        if (this._heap === null) {
            throw (`Attempt to use disposed heap.`);
        }

        if (this.hasLocal(name)) {
            throw (`${name} already exists`);
        } else {
            this._heap[name] = value;
        }
    }

    // this should not be used by objects
    // only by the runtime
    // scope will not support mutable values.
    _setValue(name, value) {
        this._heap[name] = value;
    }

    _setTopLevelValue(name, value) {
        if (this.isTopLevel()) {
            this._setValue(name, value);
        } else {
            this._parent._setTopLevelValue(name, value);
        }
    }

    hasLocal(name) {
        if (this._heap === null) {
            throw (`Attempt to use disposed heap.`);
        }

        return this._heap.hasOwnProperty(name);
    }

    has(name) {
        if (this._heap === null) {
            throw (`Attempt to use disposed heap.`);
        }

        let v = this.hasLocal(name);
        if (!v && !this.isTopLevel()) {
            v = this._parent.has(name);
        }
        return v;
    }

    get(name) {
        if (this._heap === null) {
            throw (`Attempt to use disposed heap.`);
        }

        if (!this.has(name)) {
            return null;
        }
        if (this.hasLocal(name)) {
            return this._heap[name];
        }
        if (!this.isTopLevel()) {
            return this._parent.get(name);
        }
        return null;
    }

    keys() {
        let ret = {
            _heapObject: this
        };
        ret[Symbol.iterator] = function* () {
            console.log(this._heapObject);
            if (!this._heapObject.isTopLevel()) {
                for (let k in this._heapObject.parent.keys()) {
                    yield k;
                }
            }
            for (let key in this._heapObject._heap) {
                yield key;
            }
        }
        return ret;
    }

    dispose() {
        this._heap = null;
    }
}

// let top = new SargaHeap();
// console.log("######### HEAP TESTS ########");

// console.log(`new heap top, top has blah -> ${top.has('blah')}`);
// top.addName("blah", "bluh");
// console.log(`set blah, now top has blah -> ${top.has('blah')}`);

// let child1 = new SargaHeap(top);

// console.log(`new heap child1 with parent top, child1 has blah -> ${child1.has('blah')}, value = ${child1.get('blah')}`);
// console.log(`new heap child1 with parent top, child1 has local blah -> ${child1.hasLocal('blah')}, value = ${child1.get('blah')}`);

// if (!child1.hasLocal('blah')) {
//     child1.addName('blah', 'bleh');
// }

// console.log(`child1 set local 'blah', child1 has local blah -> ${child1.hasLocal('blah')}, value = ${child1.get('blah')}`);

// child1.dispose();

// try {
//     child1.get('blah');
// } catch (e) {
//     console.log("Exception using disposed heap -> [" + e  + "]");
// }

// top.dispose();
// child1 == null;
// top == null;

// console.log("######### HEAP TESTS ########");