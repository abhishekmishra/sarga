import { Sarga, SargaSemantics } from './sarga_main';
import { SargaBlock, SargaScriptLine, SargaScriptDeclarationMixin } from './sarga_runtime';
import { createSargaObject } from './sarga_factory';

/**
 * Create a runnable script out of the input
 * sarga script text.
 * 
 * @param { input text } text 
 */
export function sargaParse(name, text) {
    // phase 1 - match with grammar.
    const matchResult = Sarga.match(text);
    // console.log(`"${text.substring(0, 15)} ..." -> ${matchResult.succeeded()}`);

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
        // console.log(JSON.stringify(scriptObj, null, 2));
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
                        if (childItem.isDeclaration && childItem.isDeclaration()) {
                            b.addDeclarationItem(childItem);
                        } else {
                            b.addItem(childItem);
                        }
                    }
                }
            }
            return b;

        case "statement":
            // console.log(JSON.stringify(stmt, null, 2));
            return (createStatementObject(stmt));

        case "declaration":
            console.log(JSON.stringify(stmt, null, 2));
            const varName = stmt.statement[1];
            const type = stmt.statement[2].toLowerCase();
            const properties = stmt.statement[3];

            let declarationLine = new SargaScriptLine((heap) => {
                heap[varName] = createSargaObject(type, varName, ...properties);
                // console.log(heap[varName]);
            });

            Object.assign(declarationLine, SargaScriptDeclarationMixin);

            return declarationLine;
    }
}

function createStatementObject(stmt) {
    let stmtType = stmt.statement[0];
    let line = null;
    switch (stmtType) {
        case "says":
            const saysWho = stmt.statement[1];
            const saysWhat = stmt.statement[2];
            line = new SargaScriptLine((heap) => {
                // console.log(`before says |${saysWho}| = ${saysWhat}`);
                if (saysWho && saysWho.length > 0) {
                    heap["_currentSpeaker"] = saysWho[0];
                    heap[saysWho].text = saysWhat;
                } else {
                    heap[heap["_currentSpeaker"]].text = saysWhat;
                }
            });
            return line;
        case "show":
            const showWhat = stmt.statement[1];
            const updateProps = stmt.statement[2];

            line = new SargaScriptLine((heap) => {
                // console.log(`show ${showWhat} = ${heap[showWhat]}`);
                if (updateProps && updateProps.length > 0) {
                    heap[showWhat].update(...updateProps);
                }
                heap[showWhat].show();
            });
            return line;
        default:
            return "unparsed stmt";
    }
}