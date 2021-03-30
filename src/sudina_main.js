import ohm from 'ohm-js';
import Sudina from './sudina_grammar.ohm';
import { evalOperation } from './sudina_operations';

const SudinaSemantics = Sudina.createSemantics().addOperation('eval', evalOperation);
console.log(Sudina);
console.log(SudinaSemantics);

export {
    Sudina as Sudina,
    SudinaSemantics
};