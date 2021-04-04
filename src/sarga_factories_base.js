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
// console.log(`sarga factory items -> ${Array.from(getSargaFactoryNames())}`);

// const obj = createSargaObject('vanilla', 'id0', { k: 'blah', v: 'bluh' });
// const char1 = createSargaObject('character', 'id1', { k: 'name', v: 'narrator' });
// console.log(obj);
// console.dir(char1);
// console.log(char1.getDisplayName());