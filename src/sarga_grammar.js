import ohm from 'ohm-js';
import SargaGrammar from './sarga_grammar.ohm';
import { evalOperation } from './sarga_operations';

const SargaSemantics = SargaGrammar.createSemantics().addOperation('eval', evalOperation);
// console.log(Sarga);
// console.log(SargaSemantics);

export default {
    SargaGrammar,
    SargaSemantics
};