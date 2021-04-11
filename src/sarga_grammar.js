import SargaGrammar from './sarga_grammar.ohm';
import { evalOperation } from './sarga_operations';

const SargaSemantics = SargaGrammar.createSemantics().addOperation('eval', evalOperation);

export default {
    SargaGrammar,
    SargaSemantics
};