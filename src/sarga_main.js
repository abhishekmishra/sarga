import ohm from 'ohm-js';
import Sarga from './sarga_grammar.ohm';
import { evalOperation } from './sarga_operations';

const SargaSemantics = Sarga.createSemantics().addOperation('eval', evalOperation);
// console.log(Sarga);
// console.log(SargaSemantics);

export {
    Sarga,
    SargaSemantics
};