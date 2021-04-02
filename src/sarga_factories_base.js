import { SargaRuntimeObject, registerSargaFactory, sargaMixins } from './sarga_factory';

registerSargaFactory('vanilla', (id, ...args) => {
    return new SargaRuntimeObject(id, ...args);
});

registerSargaFactory('image', (id, ...args) => {
    let obj = new SargaRuntimeObject(id, ...args);

    sargaMixins(obj, [
        'ScreenLocation',
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
        'ScreenLocation',
        'Show',
        'Preload',
        'Image',
        'Speech'
    ]);

    return obj;
});

registerSargaFactory('counter', (id, ...args) => {
    let obj = new SargaRuntimeObject(id, ...args);

    sargaMixins(obj, [
        'Counter',
        'ScreenLocation',
    ]);

    // TODO: implement counter visible on screen
    // Object.assign(obj, ShowMixin);
    // obj.initShowMixin();

    // Object.assign(obj, SpeechBubbleMixin);
    // obj.initSpeechBubbleMixin();

    return obj;
});

registerSargaFactory('speechbubble', (id, ...args) => {
    let obj = new SargaRuntimeObject(id, ...args);

    sargaMixins(obj, [
        'ScreenLocation',
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