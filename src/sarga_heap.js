export class SargaHeap {
    heap;
    parent;

    constructor(parent = null) {
        this.parent = parent;
        this.heap = {};
    }

    isTopLevel() {
        if (this.heap === null) {
            throw (`Attempt to use disposed heap.`);
        }

        return this.parent === null;
    }

    addName(name, value) {
        if (this.heap === null) {
            throw (`Attempt to use disposed heap.`);
        }

        if (this.hasLocal(name)) {
            throw (`${name} already exists`);
        } else {
            this.heap[name] = value;
        }
    }

    // this should not be used
    // scope will not support mutable values.
    // _setValue(name, value) {
    //     this.heap[name] = value;
    // }

    hasLocal(name) {
        if (this.heap === null) {
            throw (`Attempt to use disposed heap.`);
        }

        return this.heap.hasOwnProperty(name);
    }

    has(name) {
        if (this.heap === null) {
            throw (`Attempt to use disposed heap.`);
        }

        let v = this.hasLocal(name);
        if (!v && !this.isTopLevel()) {
            v = this.parent.has(name);
        }
        return v;
    }

    get(name) {
        if (this.heap === null) {
            throw (`Attempt to use disposed heap.`);
        }

        if (!this.has(name)) {
            return null;
        }
        if (this.hasLocal(name)) {
            return this.heap[name];
        }
        if (!this.isTopLevel()) {
            return this.parent.get(name);
        }
        return null;
    }

    dispose() {
        this.heap = null;
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