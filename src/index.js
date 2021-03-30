import * as p5 from 'p5';
import { sketch } from './sketch';
import ohm from 'ohm-js';
import Sudina from './sudina_grammar.ohm';
import test0 from 'raw-loader!../samples/test0.sudina';
import test1 from 'raw-loader!../samples/test1.sudina';
import test2 from 'raw-loader!../samples/test2.sudina';

// const sketchInstance = new p5(sketch);

const satbSemantics = Sudina.createSemantics().addOperation('eval', {
    Script(firstBlock, ws, restBlocks) {
        return firstBlock.eval();
    },

    Block(begin_block, stmts, end_block) {
        // console.log(a, begin_block, c, end_block, e);
        const blkName = begin_block.eval();
        const blkStmts = stmts.eval();
        const block = {
            type: "block",
            name: blkName,
            statements: blkStmts
        };
        // console.log(block);
        return block;
    },

    BeginBlock(begin_kw, block_name, eol) {
        return block_name.source.contents;
    },

    Statements(firstStmt, restStmts) {
        let stmts = [];
        stmts.push(firstStmt.eval());
        for (const s of restStmts.children) {
            stmts.push(s.eval());
        }
        return stmts;
    },

    Statement(a) {
        return a.eval();
    },

    StmtWithLabel(label, stmt) {
        return { label: label.eval(), statement: stmt.eval() };
    },

    Label(hash, identifier) {
        return identifier.sourceString;
    },

    StmtWithoutLabel(stmt) {
        return { label: null, statement: stmt.eval() };
    },

    StartStmt(startkw, blockid) {
        return {
            type: "statement",
            statement: ["start", blockid.sourceString]
        }
    },

    LayerStmt(layerkw, layercmd) {
        return this.sourceString;
    },

    PlayStmt(playkw, audiokw, audioid) {
        return {
            type: "statement",
            statement: ["play", "audio", audioid.sourceString]
        };
    },

    SaysStmt(saysWho, saysWhat) {
        return {
            type: "statement",
            statement: ["says", saysWho.sourceString, saysWhat.sourceString]
        };
    },

    SaysWhat(q1, expr, q2) {
        return expr.sourceString;
    },

    CharacterDeclaration(characterKW, characterName, characterColour) {
        return {
            type: "declaration",
            statement: ["character", characterName.sourceString, characterColour.sourceString]
        };
    },

    ChoiceStmt(choicekw, choiceLabel, choices) {
        return {
            type: "statement",
            statement: ["choice", choiceLabel.sourceString, choices.eval()]
        };
    },

    ChoiceOption(optionkw, optionLabel, eols, optionStmt) {
        return {
            type: "fragment",
            statement: ["option", optionLabel.sourceString, optionStmt.eval()]
        }
    },

    VariableDeclaration(varkw, varName, varValue) {
        let val = varValue.eval();
        return {
            type: "declaration",
            statement: ["var", varName.sourceString, val]
        };
    },

    VariableAssignment(setKW, varName, varValue) {
        let val = varValue.eval();
        return {
            type: "declaration",
            statement: ["set", varName.sourceString, val]
        };
    },

    number(value) {
        return this.sourceString;
    },

    AskFragment(askkw, askText) {
        return {
            type: "fragment",
            statement: ["ask", askText.eval()]
        };
    },

    PriExp_paren(open, value, close) {
        return this.sourceString;
    },

    AddExp_plus(left, sign, right) {
        return this.sourceString;
    },

    AddExp_minus(left, sign, right) {
        return this.sourceString;
    },

    AvatarDeclaration(avatarKW, avatarName, avatarDefn) {
        let val = avatarDefn.eval();
        return {
            type: "declaration",
            statement: ["avatar", avatarName.sourceString, val]
        };
    },

    AvatarDefinition(avatarType, avatarProperties) {
        return {
            type: avatarType.sourceString,
            properties: avatarProperties.sourceString
        };
    },

    AttachDeclaration(attachKW, charOrPropId, avatarId) {
        return {
            type: "declaration",
            statement: ["attach", charOrPropId.sourceString, avatarId.sourceString]
        }
    },

    MessageStmt(msgKW, id, avatarProperties) {
        return {
            type: "statement",
            statement: ["msg", id.sourceString, avatarProperties.sourceString]
        }
    }
});
console.log(Sudina);
console.log(satbSemantics);

const examples = [
    test0,
    test1,
    test2];

for (let eg of examples) {
    const m = Sudina.match(eg);
    console.log(`${eg} -> ${m.succeeded()}`);

    if (!m.succeeded()) {
        console.log(Sudina.trace(eg).toString());
    } else {
        // console.log(satbGrammar.trace(eg).toString());
        const res = satbSemantics(m).eval()
        console.log(JSON.stringify(res, null, 2));
    }
}