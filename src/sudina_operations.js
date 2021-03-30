export const evalOperation = {
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
            statement: ["says", saysWho.sourceString, saysWhat.eval()]
        };
    },

    SaysWhat(q1, expr, q2) {
        return expr.eval();
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
    },

    Expressions(first, rest) {
        let exprArr = [];
        exprArr.push(first.eval());
        console.log(rest);
        for (let r of rest.children) {
            console.log('expr ->' + r.sourceString);
            // exprArr.push(r);
        }
        console.log(exprArr);
        return exprArr;
    },

    ExpressionAtom(item) {
        return {
            atom: item.sourceString
        }
    }
};