import { sketch } from '../src/sketch';
// import * as ohm from 'ohm-js';

// const sketchInstance = new p5(sketch);

const visualTbGmrText = `
SATBGrammar {
    // A script can contain one or more blocks
    Script = Block (ws+ Block)*

    // A block has a begin declaration followed by 0 or more statements
    // and end with an end declaration
    Block = BeginBlock Statements? EndBlock

    // begin declaration is of the form
    // begin <blockname>
    BeginBlock = BeginKW identifier? eol*

    // end declaration only contains the keyword
    EndBlock = EndKW

    BeginKW = "begin"
    EndKW = "end"

    // A statements list is made of one or more statements
    Statements = Statement (Statement)*

    // A statement can be with or without label
    Statement = StmtWithLabel | StmtWithoutLabel

    // Statement prefixed with label
    StmtWithLabel = Label StmtWithoutLabel

    // A statement can be on of the given types or a block
    StmtWithoutLabel = SaysStmt 
        | PlayStmt
        | LayerStmt
        | StartStmt
        | CharacterDeclaration
        | VariableDeclaration
        | VariableAssignment
        | ChoiceStmt
        | Block

    VariableAssignment = SetKW identifier ArithmeticExp

    SetKW = "set"

    ArithmeticExp
        = AddExp
    
    AddExp
        = AddExp "+" PriExp  -- plus
        | AddExp "-" PriExp  -- minus
        | PriExp
    
    PriExp
        = "(" ArithmeticExp ")"  -- paren
        | VariableExp
        | number
    
    // A label is of the form #<id>
    Label = "#" identifier

    VariableDeclaration = VarKW identifier VarValue

    VarKW = "var"

    VarValue = AskFragment | SaysWhat | ArithmeticExp

    AskFragment = AskKW SaysWhat

    AskKW = "ask"

    ChoiceStmt = ChoiceKW SaysWhat ChoiceOption+

    ChoiceKW = "choice"

    ChoiceOption = OptionKW SaysWhat eol* StmtWithoutLabel

    OptionKW = "option"

    // A character declaration of the form
    // character <character_name> <character_colour>
    CharacterDeclaration = CharacterKW CharacterName Colour

    CharacterKW = "character"

    CharacterName = identifier

    Colour = "#" hexDigit hexDigit hexDigit hexDigit hexDigit hexDigit

    // The play statement is of the form
    // play audio <audioid>
    PlayStmt = PlayKW AudioKW identifier

    PlayKW = "play"
    AudioKW = "audio"

    // Start statement to run a block
    // start <blockid>
    StartStmt = StartKW identifier

    StartKW = "start"

    // Screen layers statment
    // layer <layer command>
    LayerStmt = LayerKW layer_cmd

    LayerKW = "layer"

    // A layer command can clear, set or unset layers
    layer_cmd = layer_clear_cmd
        | layer_set_cmd
        | layer_unset_cmd
        
    layer_clear_cmd = "clear"

    layer_set_cmd = "set" ws+ layer_number ws+ drawable

    layer_unset_cmd = "unset" ws+ layer_number

    layer_number = digit+

    drawable = identifier

    SaysStmt = SaysWho? SaysWhat

    SaysWhat = quote Expressions quote

    Expressions = Expr_or_word (Expr_or_word)*

    SaysWho = someone ":"

    someone = identifier

    quote = "\\""

    Expr_or_word = VariableExp | Word

    Word = (alnum | punctuation)+

    VariableExp = "$" identifier
    
    identifier = letter alnum*

    punctuation = "'" | "," | "."

    ws = " " | "\t"

    // comment = ";"

    eol = "\\n" | "\\r\\n"   

    number = digit*
}
`;

const satbGrammar = ohm.grammar(visualTbGmrText);
const satbSemantics = satbGrammar.createSemantics().addOperation('eval', {
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

    PriExp_paren (open, value, close) {
        return this.sourceString;
    },

    AddExp_plus(left, sign, right) {
        return this.sourceString;
    },

    AddExp_minus(left, sign, right) {
        return this.sourceString;
    }
});
console.log(satbGrammar);
console.log(satbSemantics);

const examples = [
    `begin blah
        character oy #222222
        character noone #888888

        var x 10
        var y "blah bluh"
        var z ask "get value"

        set y (10 - $x)
        set x 20
        
        layer clear
        play audio audio0

        #t oy: "$hello humm"
        oy: "$hello humm"

        #an choice "blah"
        option "one" "do something"
        option "two" "do something"
        option "three" 
            begin
                "dude"
            end

        begin bluh
            "dude"
        end

        noone: "woah"
        start bluh
    end
    `,
    `
    begin x
        oy: "$hello humm"
        oy: "what"
        #t oy: "blah"
    end
    `,
    `
    begin z
        choice "x"
        option "three" 
        begin x
            "dude"
        end
    end
    `,
    `
    begin z
        play audio blah0
        "what"
    end
    `,
    `
    begin z
        layer clear
        "what"
    end
    `,
    `
    begin z
        layer clear
        "what"
        start d0
    end
`,
`
begin x
set y $z - $x
set y $z + $x
set y 10 - $x
set y 10 + 20
set y (10 - $x)
end
`];

for (let eg of examples) {
    const m = satbGrammar.match(eg);
    console.log(`${eg} -> ${m.succeeded()}`);

    if (!m.succeeded()) {
        console.log(satbGrammar.trace(eg).toString());
    } else {
        // console.log(satbGrammar.trace(eg).toString());
        const res = satbSemantics(m).eval()
        console.log(JSON.stringify(res, null, 2));
    }
}