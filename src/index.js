import * as p5 from 'p5';
import sargatut from 'raw-loader!../samples/sargatut.sarga';
import { Sarga, SargaSemantics } from './sarga_main';
import { SargaBlock, says } from './sarga_runtime';
import { SargaBlockDisplay } from './sarga_display';


const examples = [
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
    const matchResult = Sarga.match(text);
    console.log(`"${text.substring(0, 15)} ..." -> ${matchResult.succeeded()}`);

    // if parse phase 1 succeeded
    // proceed to create statements
    let scriptBlock = sargaParsePhase2(text, matchResult);
    scriptBlock["filename"] = name;
    return scriptBlock;
}

/**
 * create objects corresponding to all
 * statements in a script and then
 * send to phase 3
 * 
 * @param { input text } text 
 * @param { ohm matchResult object} match 
 */
function sargaParsePhase2(text, matchResult) {
    if (!matchResult.succeeded()) {
        // console.log(Sarga.trace(text).toString());
        console.log(matchResult.message);
        throw ('Error parsing script.');
    } else {
        const scriptObj = SargaSemantics(matchResult).eval();
        return parseStatement(scriptObj);
    }
}

function parseStatement(stmt) {
    switch (stmt.type) {

        case "block":
            let b = new SargaBlock(stmt.name);
            b.sourceString = stmt.sourceString;
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

    const display = new SargaBlockDisplay(sargaScript);
    const displaySketch = new p5(display.getSketch());
}

