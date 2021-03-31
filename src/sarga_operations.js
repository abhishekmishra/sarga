export const evalOperation = {
    Script(stmts) {
        const blkStmts = stmts.eval();
        // console.log(blkStmts);
        const block = {
            type: "block",
            name: "script",
            statements: blkStmts,
            sourceString: this.sourceString
        };
        return block;
    },

    Block(begin_block, stmts, end_block) {
        const blkName = begin_block.eval();
        const blkStmts = stmts.eval();

        const block = {
            type: "block",
            name: blkName,
            statements: blkStmts,
            sourceString: this.sourceString
        };
        // console.log(block);
        return block;
    },

    BeginBlock(begin_kw, block_name) {
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
        let statement = stmt.eval();
        statement.label = label.eval();
        return statement;
    },

    Label(hash, identifier) {
        return identifier.sourceString;
    },

    StmtWithoutLabel(stmt) {
        let statement = stmt.eval();
        statement.label = null;
        return statement;
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

    SaysWhat(expr) {
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

    ChoiceOption(optionkw, optionLabel, optionStmt) {
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

    number(value) {
        return this.sourceString;
    },

    AskFragment(askkw, askText) {
        return {
            type: "fragment",
            statement: ["ask", askText.eval()]
        };
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

    Text(pre, str, post) {
        return str.sourceString;
    },
};
