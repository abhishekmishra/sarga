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
    BeginBlock = BeginKW identifier eol*

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
        | Block

    // A label is of the form #<id>
    Label = "#" identifier

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

    Expr_or_word = Expression | Word

    Word = (alnum | punctuation)+

    Expression = "$[" identifier "]"
    
    identifier = letter alnum*

    punctuation = "'" | "," | "."

    ws = " " | "\t"

    // comment = ";"

    eol = "\\n" | "\\r\\n"   
}
`;

const satbGrammar = ohm.grammar(visualTbGmrText);
const satbSemantics = satbGrammar.createSemantics().addOperation('eval', {
    Script(firstBlock, ws, restBlocks) {
        return firstBlock.eval();
    },

    Block(begin_block, c, end_block) {
        // console.log(a, begin_block, c, end_block, e);
        const blkName = begin_block.eval();
        c.eval();
        console.log('created block ' + blkName);
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
        console.log(stmts);
    },

    Statement(a) {
        return a.eval();
    },

    StmtWithLabel(label, stmt) {
        return { label: label.eval(), statement: stmt.sourceString };
    },

    Label(hash, identifier) {
        return identifier.sourceString;
    },

    StmtWithoutLabel(stmt) {
        return { label: null, statement: stmt.sourceString };
    }
});
console.log(satbGrammar);
console.log(satbSemantics);

const examples = [
        `begin blah

        layer clear
        play audio audio0

        #t oy: "$[hello] humm"
        oy: "$[hello] humm"

        begin bluh
            "dude"
        end

        noone: "woah"
        start bluh
    end
    `,
    `
begin x
    oy: "$[hello] humm"
    oy: "what"
    #t oy: "blah"
end
`,
`
begin z
    "what"
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
    //     `"hello $world for $date
    // "`,
    //     `"hello $character1"`,
    //     `"hello world"`,
    //     `"$a"`,
    //     `" "`,
];

for (let eg of examples) {
    const m = satbGrammar.match(eg);
    console.log(`${eg} -> ${m.succeeded()}`);

    if (!m.succeeded()) {
        console.log(satbGrammar.trace(eg).toString());
    } else {
        // console.log(satbGrammar.trace(eg).toString());
        satbSemantics(m).eval();
    }
}