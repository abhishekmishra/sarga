import { sketch } from '../src/sketch';
// import * as ohm from 'ohm-js';

// const sketchInstance = new p5(sketch);

const visualTbGmrText = `
SATBGrammar {
    block = ws* begin_block_stmt statements end_block_stmt ws*

    begin_block_stmt = ws* "begin" space+ identifier eol

    end_block_stmt = ws* "end" eol*

    statements = stmt_with_label+

    stmt_with_label = ws* label stmt_or_block -- stmt
        | stmt_or_block

    stmt_or_block = says_stmt | 
        play_stmt |
        layer_stmt |
        start_stmt |
        block

    label = "[" identifier "]" ws+

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

    says_stmt = ws* (someone ":" ws+)? quote expr_or_word (ws+ expr_or_word)* quote

    someone = identifier

    quote = "\\""

    expr_or_word = expression | word

    word = (alnum | punctuation)*

    expression = "$" identifier
    
    identifier = letter alnum*

    punctuation = "'" | "," | "."

    ws = " " | "\t" | eol_char

    comment = ";" 

    eol = eol_char+

    eol_char = "\\n" | "\\r"
    
    // script = "{" script "}"
}
`;

const satbGrammar = ohm.grammar(visualTbGmrText);
console.log(satbGrammar);

const examples = [
    `begin blah

    layer clear
    play audio audio0

    [x] noone: "hello $world for $date period."
    nobody: "hello $world for $date period."
    "hello $world for $date period."

    begin bluh
        "dude"
    end

    noone: "woah"
    start bluh
end
`,
`
begin x
    [a] oy: "hello"
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
    if(!m.succeeded()) {
        console.log(satbGrammar.trace(eg).toString());
    }
}