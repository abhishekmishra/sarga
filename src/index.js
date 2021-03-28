import { sketch } from '../src/sketch';
// import * as ohm from 'ohm-js';

// const sketchInstance = new p5(sketch);

const visualTbGmrText = `
SATBGrammar {
    Script = Block (ws+ Block)*

    Block = BeginBlock Statements? EndBlock

    BeginBlock = begin_kw identifier eol*

    begin_kw = "begin" space+

    EndBlock = "end" ws* eol*

    Statements = Statement (Statement)*

    Statement = StmtWithLabel | StmtWithoutLabel

    StmtWithLabel = Label StmtWithoutLabel

    StmtWithoutLabel = says_stmt 
        | play_stmt
        | layer_stmt
        | start_stmt
        // |
        //block

    Label = "#" identifier

    play_stmt = ws* "play" ws+ "audio" ws+ identifier

    start_stmt = ws* "start" ws+ identifier

    layer_stmt = ws* "layer" ws+ layer_cmd

    layer_cmd = layer_clear_cmd
        | layer_set_cmd
        | layer_unset_cmd
        
    layer_clear_cmd = "clear"

    layer_set_cmd = "set" ws+ layer_number ws+ drawable

    layer_unset_cmd = "unset" ws+ layer_number

    layer_number = digit+

    drawable = identifier

    says_stmt = (someone ":" ws+)? quote expr_or_word (ws+ expr_or_word)* quote eol+

    someone = identifier

    quote = "\\""

    expr_or_word = expression | word

    word = (alnum | punctuation)*

    expression = "$" identifier
    
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
    //     `begin blah

    //     layer clear
    //     play audio audio0

    //     [x] noone: "hello $world for $date period."
    //     nobody: "hello $world for $date period."
    //     "hello $world for $date period."

    //     begin bluh
    //         "dude"
    //     end

    //     noone: "woah"
    //     start bluh
    // end
    // `,
    `
begin x
    oy: "what"
    #t oy: "blah"
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