import { SargaRuntimeObject, registerSargaFactory, sargaMixins, sargaMixin } from './sarga_factory';

function sargaFactoryEntry(name, mixins = []) {
    registerSargaFactory(name, (id, ...args) => {
        let obj = new SargaRuntimeObject(id);
        sargaMixins(obj, mixins);
        obj.update(...args);
        return obj;
    });
}

registerSargaFactory('vanilla', (id, ...args) => {
    return new SargaRuntimeObject(id, ...args);
});

registerSargaFactory('image', (id, ...args) => {
    let obj = new SargaRuntimeObject(id, ...args);

    sargaMixins(obj, [
        'Location',
        'Show',
        'Preload',
        'Image'
    ]);

    return obj;
});


registerSargaFactory('character', (id, ...args) => {
    let obj = new SargaRuntimeObject(id, ...args);

    sargaMixins(obj, [
        'DisplayName',
        'Location',
        'Show',
        'Preload',
        'Image',
        'Speech'
    ]);

    return obj;
});

// registerSargaFactory('counter', (id, ...args) => {
//     let obj = new SargaRuntimeObject(id, ...args);

//     sargaMixins(obj, [
//         'Counter',
//     ]);

//     return obj;
// });

sargaFactoryEntry('counter', ['Counter']);

sargaFactoryEntry('fillbg', ['Fill']);

registerSargaFactory('speechbubble', (id, ...args) => {
    let obj = new SargaRuntimeObject(id, ...args);

    sargaMixins(obj, [
        'Location',
        'Dimension',
        'Show',
        'SpeechBubble'
    ]);

    return obj;
});

registerSargaFactory('toggle', (id, ...args) => {
    let obj = new SargaRuntimeObject(id, ...args);

    sargaMixins(obj, [
        'Toggle',
    ]);

    return obj;
});

registerSargaFactory('numparser', (id, ...args) => {
    let obj = new SargaRuntimeObject(id, ...args);

    sargaMixin(obj, "Debug");

    Object.assign(obj, {
        parse(text) {
            if (text === undefined || text === null) {
                throw (`input is undefined or null`);
            }
            if (typeof text === "string") {
                return parseFloat(text);
            } else if (typeof text === "number") {
                return text;

            } else {
                throw (`Cannot parse object of type ${typeof text}`);
            }
        }
    });

    return obj;
});

// console.log(`sarga factory items -> ${Array.from(getSargaFactoryNames())}`);

// const obj = createSargaObject('vanilla', 'id0', { k: 'blah', v: 'bluh' });
// const char1 = createSargaObject('character', 'id1', { k: 'name', v: 'narrator' });
// console.log(obj);
// console.dir(char1);
// console.log(char1.getDisplayName());