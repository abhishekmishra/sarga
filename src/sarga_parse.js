import { Sarga, SargaSemantics } from './sarga_main';
import { SargaBlock, SargaScriptLine, SargaScriptDeclarationMixin } from './sarga_runtime';
import { createSargaObject, sargaMixin } from './sarga_factory';

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
            return (createStatementObject(stmt));

        case "declaration":
            const declType = stmt.statement[0];
            if (declType === "var") {
                // console.log(JSON.stringify(stmt, null, 2));
                const varName = stmt.statement[1];
                const type = stmt.statement[2].toLowerCase();
                const hasTypes = stmt.statement[3];
                const properties = stmt.statement[4];

                let declarationLine = new SargaScriptLine((heap) => {
                    let obj = createSargaObject(
                        type,
                        varName,
                        { "k": "_heap", "v": heap }
                    );
                    heap.addName(varName, obj);
                    for (let hasType of hasTypes) {
                        sargaMixin(obj, hasType);
                    }
                    obj.update(...properties);
                    // console.log(heap.get(varName));
                });

                Object.assign(declarationLine, SargaScriptDeclarationMixin);

                return declarationLine;
            }
            if (declType === "mixin") {
                // console.log(JSON.stringify(stmt, null, 2));
                const varName = stmt.statement[1];
                const types = stmt.statement[2];
                const properties = stmt.statement[3];

                let declarationLine = new SargaScriptLine((heap) => {
                    // console.log(`types = ${types}, ${types.length}`);
                    let obj = heap.get(varName);
                    if (obj) {
                        for (let type of types) {
                            sargaMixin(obj, type);
                        }
                        obj.update(...properties);
                    } else {
                        throw (`${varName} is not in the heap vro.`);
                    }

                    // console.log(heap.get(varName));
                });

                Object.assign(declarationLine, SargaScriptDeclarationMixin);

                return declarationLine;
            }
            break;
        default:
            throw (`unexpected declaration`);
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
                let speaker = null;
                if (saysWho && saysWho.length > 0) {
                    heap._setTopLevelValue("_currentSpeaker", saysWho[0]);
                    speaker = heap.get(saysWho);
                } else {
                    speaker = heap.get(heap.get("_currentSpeaker"));
                }
                speaker.update({
                    k: "text",
                    v: saysWhat
                });
                speaker.say();
            });
            return line;
        case "show":
            const showWhat = stmt.statement[1];
            const updateProps = stmt.statement[2];

            line = new SargaScriptLine((heap) => {
                // console.log(`show ${showWhat} = ${heap.get(showWhat)}`);
                if (updateProps && updateProps.length > 0) {
                    heap.get(showWhat).update(...updateProps);
                }
                heap.get(showWhat).show();
            });
            return line;
        case "hide":
            const hideWhat = stmt.statement[1];
            line = new SargaScriptLine((heap) => {
                console.log(`hide ${hideWhat}`);
                heap.get(hideWhat).hide();
            });
            return line;
        case "method":
            const objName = stmt.statement[1];
            const methodName = stmt.statement[2];
            const methodArgs = stmt.statement[3];
            line = new SargaScriptLine((heap) => {
                // console.log(`call ${objName} -> ${methodName}`);
                const obj = heap.get(objName);
                if (obj) {
                    if (obj[methodName]) {
                        obj[methodName](...methodArgs);
                    } else {
                        throw (`${objName} does not have method ${methodName}`);
                    }
                } else {
                    throw (`${objName} is not in the heap vro.`);
                }
            });
            return line;
        default:
            return "unparsed stmt";
    }
}