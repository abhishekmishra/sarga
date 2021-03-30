import * as p5 from 'p5';
import { sketch } from './sketch';
import test0 from 'raw-loader!../samples/test0.sarga';
import test1 from 'raw-loader!../samples/test1.sarga';
import test2 from 'raw-loader!../samples/test2.sarga';
import sargatut from 'raw-loader!../samples/sargatut.sarga';
import { Sarga, SargaSemantics } from './sarga_main';
import { SargaBlock, says } from './sarga_runtime';

// const sketchInstance = new p5(sketch);

const examples = [
    // test0,
    // test1,
    // test2
    sargatut
];

/**
 * Create a runnable script out of the input
 * sarga script text.
 * 
 * @param { input text } text 
 */
function sargaParse(name, text) {
    // phase 1 - match with grammar.
    const match = Sarga.match(text);
    console.log(`"${text.substring(0, 15)} ..." -> ${match.succeeded()}`);

    // if parse phase 1 succeeded
    // proceed to create statements
    let scriptBlock = sargaParsePhase2(text, match);
    scriptBlock["filename"] = name;
    return scriptBlock;
}

/**
 * create objects corresponding to all
 * statements in a script and then
 * send to phase 3
 * 
 * @param { input text } text 
 * @param { ohm match object} match 
 */
function sargaParsePhase2(text, match) {
    if (!match.succeeded()) {
        console.log(Sarga.trace(text).toString());
        throw ('Error parsing script.');
    } else {
        const scriptObj = SargaSemantics(match).eval();
        return parseStatement(scriptObj);
    }
}

function parseStatement(stmt) {
    // console.log("parse -> ");
    // console.log(stmt);
    switch (stmt.type) {

        case "block":
            let b = new SargaBlock(stmt.name);
            if (stmt.statements !== null) {
                for (let i = 0; i < stmt.statements.length; i++) {
                    let childStmt = stmt.statements[i];
                    let childItem = parseStatement(childStmt);
                    if (childItem !== null) {
                        b.addItem(childItem);
                    }
                }
            }
            return b;

        case "statement":
            let stmtType = stmt.statement[0];
            if (stmtType === "says") {
                return says(stmt.statement[2], stmt.statement[1]);
            }
            else {
                return "unparsed stmt";
            }

        case "declaration":
            return null;
    }
}

for (let eg of examples) {
    let sargaScript = sargaParse("inline", eg);
    console.log(sargaScript);
}

