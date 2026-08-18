/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS205: Consider reworking code to avoid use of IIFEs
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/main/docs/suggestions.md
 */
describe("TOML grammar", function() {
  let grammar = null;

  beforeEach(function() {
    waitsForPromise(() => atom.packages.activatePackage("language-toml"));

    return runs(() => grammar = atom.grammars.grammarForScopeName('source.toml'));
  });

  it("parses the grammar", function() {
    expect(grammar).toBeTruthy();
    return expect(grammar.scopeName).toBe("source.toml");
  });

  it("tokenizes comments", function() {
    let {tokens} = grammar.tokenizeLine("# I am a comment");
    expect(tokens[0]).toEqual({value: "#", scopes: ["source.toml", "comment.line.number-sign.toml", "punctuation.definition.comment.toml"]});
    expect(tokens[1]).toEqual({value: " I am a comment", scopes: ["source.toml", "comment.line.number-sign.toml"]});

    ({tokens} = grammar.tokenizeLine("# = I am also a comment!"));
    expect(tokens[0]).toEqual({value: "#", scopes: ["source.toml", "comment.line.number-sign.toml", "punctuation.definition.comment.toml"]});
    expect(tokens[1]).toEqual({value: " = I am also a comment!", scopes: ["source.toml", "comment.line.number-sign.toml"]});

    ({tokens} = grammar.tokenizeLine("#Nope = still a comment"));
    expect(tokens[0]).toEqual({value: "#", scopes: ["source.toml", "comment.line.number-sign.toml", "punctuation.definition.comment.toml"]});
    expect(tokens[1]).toEqual({value: "Nope = still a comment", scopes: ["source.toml", "comment.line.number-sign.toml"]});

    ({tokens} = grammar.tokenizeLine(" #Whitespace = tricky"));
    expect(tokens[1]).toEqual({value: "#", scopes: ["source.toml", "comment.line.number-sign.toml", "punctuation.definition.comment.toml"]});
    return expect(tokens[2]).toEqual({value: "Whitespace = tricky", scopes: ["source.toml", "comment.line.number-sign.toml"]});
});

  it("tokenizes strings", function() {
    let {tokens} = grammar.tokenizeLine('foo = "I am a string"');
    expect(tokens[4]).toEqual({value: '"', scopes: ["source.toml", "string.quoted.double.toml", "punctuation.definition.string.begin.toml"]});
    expect(tokens[5]).toEqual({value: 'I am a string', scopes: ["source.toml", "string.quoted.double.toml"]});
    expect(tokens[6]).toEqual({value: '"', scopes: ["source.toml", "string.quoted.double.toml", "punctuation.definition.string.end.toml"]});

    ({tokens} = grammar.tokenizeLine('foo = "I\'m \\n escaped"'));
    expect(tokens[4]).toEqual({value: '"', scopes: ["source.toml", "string.quoted.double.toml", "punctuation.definition.string.begin.toml"]});
    expect(tokens[5]).toEqual({value: "I'm ", scopes: ["source.toml", "string.quoted.double.toml"]});
    expect(tokens[6]).toEqual({value: "\\n", scopes: ["source.toml", "string.quoted.double.toml", "constant.character.escape.toml"]});
    expect(tokens[7]).toEqual({value: " escaped", scopes: ["source.toml", "string.quoted.double.toml"]});
    expect(tokens[8]).toEqual({value: '"', scopes: ["source.toml", "string.quoted.double.toml", "punctuation.definition.string.end.toml"]});

    ({tokens} = grammar.tokenizeLine("foo = 'I am not \\n escaped'"));
    expect(tokens[4]).toEqual({value: "'", scopes: ["source.toml", "string.quoted.single.toml", "punctuation.definition.string.begin.toml"]});
    expect(tokens[5]).toEqual({value: 'I am not \\n escaped', scopes: ["source.toml", "string.quoted.single.toml"]});
    expect(tokens[6]).toEqual({value: "'", scopes: ["source.toml", "string.quoted.single.toml", "punctuation.definition.string.end.toml"]});

    ({tokens} = grammar.tokenizeLine('foo = "Equal sign ahead = no problem"'));
    expect(tokens[4]).toEqual({value: '"', scopes: ["source.toml", "string.quoted.double.toml", "punctuation.definition.string.begin.toml"]});
    expect(tokens[5]).toEqual({value: 'Equal sign ahead = no problem', scopes: ["source.toml", "string.quoted.double.toml"]});
    return expect(tokens[6]).toEqual({value: '"', scopes: ["source.toml", "string.quoted.double.toml", "punctuation.definition.string.end.toml"]});
});

  it("does not tokenize equal signs within strings", function() {
    const {tokens} = grammar.tokenizeLine('pywinusb = { version = "*", os_name = "==\'nt\'", index="pypi"}');
    return expect(tokens[20]).toEqual({value: "=='nt'", scopes: ["source.toml", "string.quoted.double.toml"]});
});

  it("tokenizes multiline strings", function() {
    let lines = grammar.tokenizeLines(`foo = """
I am a\\
string
"""\
`
    );
    expect(lines[0][4]).toEqual({value: '"""', scopes: ["source.toml", "string.quoted.double.block.toml", "punctuation.definition.string.begin.toml"]});
    expect(lines[1][0]).toEqual({value: 'I am a', scopes: ["source.toml", "string.quoted.double.block.toml"]});
    expect(lines[1][1]).toEqual({value: '\\', scopes: ["source.toml", "string.quoted.double.block.toml", "constant.character.escape.toml"]});
    expect(lines[2][0]).toEqual({value: 'string', scopes: ["source.toml", "string.quoted.double.block.toml"]});
    expect(lines[3][0]).toEqual({value: '"""', scopes: ["source.toml", "string.quoted.double.block.toml", "punctuation.definition.string.end.toml"]});

    lines = grammar.tokenizeLines(`foo = '''
I am a\\
string
'''\
`
    );
    expect(lines[0][4]).toEqual({value: "'''", scopes: ["source.toml", "string.quoted.single.block.toml", "punctuation.definition.string.begin.toml"]});
    expect(lines[1][0]).toEqual({value: 'I am a\\', scopes: ["source.toml", "string.quoted.single.block.toml"]});
    expect(lines[2][0]).toEqual({value: 'string', scopes: ["source.toml", "string.quoted.single.block.toml"]});
    return expect(lines[3][0]).toEqual({value: "'''", scopes: ["source.toml", "string.quoted.single.block.toml", "punctuation.definition.string.end.toml"]});
});

  it("tokenizes booleans", function() {
    let {tokens} = grammar.tokenizeLine("foo = true");
    expect(tokens[4]).toEqual({value: "true", scopes: ["source.toml", "constant.language.boolean.true.toml"]});

    ({tokens} = grammar.tokenizeLine("foo = false"));
    return expect(tokens[4]).toEqual({value: "false", scopes: ["source.toml", "constant.language.boolean.false.toml"]});
});

  it("tokenizes integers", () => (() => {
    const result = [];
    for (var int of ["+99", "42", "0", "-17", "1_000", "1_2_3_4_5"]) {
      var {tokens} = grammar.tokenizeLine(`foo = ${int}`);
      result.push(expect(tokens[4]).toEqual({value: int, scopes: ["source.toml", "constant.numeric.toml"]}));
    }
    return result;
  })());

  it("tokenizes floats", () => (() => {
    const result = [];
    for (var float of ["+1.0", "3.1415", "-0.01", "5e+22", "1e6", "-2E-2", "6.626e-34", "6.626e-34", "9_224_617.445_991_228_313", "1e1_000"]) {
      var {tokens} = grammar.tokenizeLine(`foo = ${float}`);
      result.push(expect(tokens[4]).toEqual({value: float, scopes: ["source.toml", "constant.numeric.toml"]}));
    }
    return result;
  })());

  it("tokenizes dates", function() {
    let {tokens} = grammar.tokenizeLine("foo = 1979-05-27T07:32:00Z");
    expect(tokens[4]).toEqual({value: "1979-05-27", scopes: ["source.toml", "constant.numeric.date.toml"]});
    expect(tokens[5]).toEqual({value: "T", scopes: ["source.toml", "constant.numeric.date.toml", "keyword.other.time.toml"]});
    expect(tokens[6]).toEqual({value: "07:32:00", scopes: ["source.toml", "constant.numeric.date.toml"]});
    expect(tokens[7]).toEqual({value: "Z", scopes: ["source.toml", "constant.numeric.date.toml", "keyword.other.offset.toml"]});

    ({tokens} = grammar.tokenizeLine("foo = 1979-05-27T00:32:00.999999-07:00"));
    expect(tokens[4]).toEqual({value: "1979-05-27", scopes: ["source.toml", "constant.numeric.date.toml"]});
    expect(tokens[5]).toEqual({value: "T", scopes: ["source.toml", "constant.numeric.date.toml", "keyword.other.time.toml"]});
    expect(tokens[6]).toEqual({value: "00:32:00.999999", scopes: ["source.toml", "constant.numeric.date.toml"]});
    expect(tokens[7]).toEqual({value: "-", scopes: ["source.toml", "constant.numeric.date.toml", "keyword.other.offset.toml"]});
    return expect(tokens[8]).toEqual({value: "07:00", scopes: ["source.toml", "constant.numeric.date.toml"]});
});

  it("tokenizes tables", function() {
    let {tokens} = grammar.tokenizeLine("[table]");
    expect(tokens[0]).toEqual({value: "[", scopes: ["source.toml", "entity.name.section.table.toml", "punctuation.definition.table.begin.toml"]});
    expect(tokens[1]).toEqual({value: "table", scopes: ["source.toml", "entity.name.section.table.toml"]});
    expect(tokens[2]).toEqual({value: "]", scopes: ["source.toml", "entity.name.section.table.toml", "punctuation.definition.table.end.toml"]});

    ({tokens} = grammar.tokenizeLine("  [table]"));
    expect(tokens[0]).toEqual({value: "  ", scopes: ["source.toml"]});
    return expect(tokens[1]).toEqual({value: "[", scopes: ["source.toml", "entity.name.section.table.toml", "punctuation.definition.table.begin.toml"]});
});
    // and so on

  it("tokenizes table arrays", function() {
    const {tokens} = grammar.tokenizeLine("[[table]]");
    expect(tokens[0]).toEqual({value: "[[", scopes: ["source.toml", "entity.name.section.table.array.toml", "punctuation.definition.table.array.begin.toml"]});
    expect(tokens[1]).toEqual({value: "table", scopes: ["source.toml", "entity.name.section.table.array.toml"]});
    return expect(tokens[2]).toEqual({value: "]]", scopes: ["source.toml", "entity.name.section.table.array.toml", "punctuation.definition.table.array.end.toml"]});
});

  it("tokenizes keys", function() {
    let {tokens} = grammar.tokenizeLine("key =");
    expect(tokens[0]).toEqual({value: "key", scopes: ["source.toml", "variable.other.key.toml"]});
    expect(tokens[1]).toEqual({value: " ", scopes: ["source.toml"]});
    expect(tokens[2]).toEqual({value: "=", scopes: ["source.toml", "keyword.operator.assignment.toml"]});

    ({tokens} = grammar.tokenizeLine("1key_-34 ="));
    expect(tokens[0]).toEqual({value: "1key_-34", scopes: ["source.toml", "variable.other.key.toml"]});
    expect(tokens[1]).toEqual({value: " ", scopes: ["source.toml"]});
    expect(tokens[2]).toEqual({value: "=", scopes: ["source.toml", "keyword.operator.assignment.toml"]});

    ({tokens} = grammar.tokenizeLine("ʎǝʞ ="));
    expect(tokens[0]).toEqual({value: "ʎǝʞ =", scopes: ["source.toml"]});

    ({tokens} = grammar.tokenizeLine("  ="));
    return expect(tokens[0]).toEqual({value: "  =", scopes: ["source.toml"]});
});

  return it("tokenizes quoted keys", function() {
    let {tokens} = grammar.tokenizeLine("'key' =");
    expect(tokens[0]).toEqual({value: "'", scopes: ["source.toml", "string.quoted.single.toml", "punctuation.definition.string.begin.toml"]});
    expect(tokens[1]).toEqual({value: "key", scopes: ["source.toml", "string.quoted.single.toml", "variable.other.key.toml"]});
    expect(tokens[2]).toEqual({value: "'", scopes: ["source.toml", "string.quoted.single.toml", "punctuation.definition.string.end.toml"]});
    expect(tokens[3]).toEqual({value: " ", scopes: ["source.toml"]});
    expect(tokens[4]).toEqual({value: "=", scopes: ["source.toml", "keyword.operator.assignment.toml"]});

    ({tokens} = grammar.tokenizeLine("'ʎǝʞ' ="));
    expect(tokens[0]).toEqual({value: "'", scopes: ["source.toml", "string.quoted.single.toml", "punctuation.definition.string.begin.toml"]});
    expect(tokens[1]).toEqual({value: "ʎǝʞ", scopes: ["source.toml", "string.quoted.single.toml", "variable.other.key.toml"]});
    expect(tokens[2]).toEqual({value: "'", scopes: ["source.toml", "string.quoted.single.toml", "punctuation.definition.string.end.toml"]});
    expect(tokens[3]).toEqual({value: " ", scopes: ["source.toml"]});
    expect(tokens[4]).toEqual({value: "=", scopes: ["source.toml", "keyword.operator.assignment.toml"]});

    ({tokens} = grammar.tokenizeLine("'key with spaces' ="));
    expect(tokens[0]).toEqual({value: "'", scopes: ["source.toml", "string.quoted.single.toml", "punctuation.definition.string.begin.toml"]});
    expect(tokens[1]).toEqual({value: "key with spaces", scopes: ["source.toml", "string.quoted.single.toml", "variable.other.key.toml"]});
    expect(tokens[2]).toEqual({value: "'", scopes: ["source.toml", "string.quoted.single.toml", "punctuation.definition.string.end.toml"]});
    expect(tokens[3]).toEqual({value: " ", scopes: ["source.toml"]});
    expect(tokens[4]).toEqual({value: "=", scopes: ["source.toml", "keyword.operator.assignment.toml"]});

    ({tokens} = grammar.tokenizeLine("'key with colons:' ="));
    expect(tokens[0]).toEqual({value: "'", scopes: ["source.toml", "string.quoted.single.toml", "punctuation.definition.string.begin.toml"]});
    expect(tokens[1]).toEqual({value: "key with colons:", scopes: ["source.toml", "string.quoted.single.toml", "variable.other.key.toml"]});
    expect(tokens[2]).toEqual({value: "'", scopes: ["source.toml", "string.quoted.single.toml", "punctuation.definition.string.end.toml"]});
    expect(tokens[3]).toEqual({value: " ", scopes: ["source.toml"]});
    expect(tokens[4]).toEqual({value: "=", scopes: ["source.toml", "keyword.operator.assignment.toml"]});

    ({tokens} = grammar.tokenizeLine("'' ="));
    expect(tokens[0]).toEqual({value: "'", scopes: ["source.toml", "string.quoted.single.toml", "punctuation.definition.string.begin.toml"]});
    expect(tokens[1]).toEqual({value: "'", scopes: ["source.toml", "string.quoted.single.toml", "punctuation.definition.string.end.toml"]});
    expect(tokens[2]).toEqual({value: " ", scopes: ["source.toml"]});
    expect(tokens[3]).toEqual({value: "=", scopes: ["source.toml", "keyword.operator.assignment.toml"]});

    ({tokens} = grammar.tokenizeLine('"key" ='));
    expect(tokens[0]).toEqual({value: '"', scopes: ["source.toml", "string.quoted.double.toml", "punctuation.definition.string.begin.toml"]});
    expect(tokens[1]).toEqual({value: "key", scopes: ["source.toml", "string.quoted.double.toml", "variable.other.key.toml"]});
    expect(tokens[2]).toEqual({value: '"', scopes: ["source.toml", "string.quoted.double.toml", "punctuation.definition.string.end.toml"]});
    expect(tokens[3]).toEqual({value: " ", scopes: ["source.toml"]});
    expect(tokens[4]).toEqual({value: "=", scopes: ["source.toml", "keyword.operator.assignment.toml"]});

    ({tokens} = grammar.tokenizeLine('"ʎǝʞ" ='));
    expect(tokens[0]).toEqual({value: '"', scopes: ["source.toml", "string.quoted.double.toml", "punctuation.definition.string.begin.toml"]});
    expect(tokens[1]).toEqual({value: "ʎǝʞ", scopes: ["source.toml", "string.quoted.double.toml", "variable.other.key.toml"]});
    expect(tokens[2]).toEqual({value: '"', scopes: ["source.toml", "string.quoted.double.toml", "punctuation.definition.string.end.toml"]});
    expect(tokens[3]).toEqual({value: " ", scopes: ["source.toml"]});
    expect(tokens[4]).toEqual({value: "=", scopes: ["source.toml", "keyword.operator.assignment.toml"]});

    ({tokens} = grammar.tokenizeLine('"key with spaces" ='));
    expect(tokens[0]).toEqual({value: '"', scopes: ["source.toml", "string.quoted.double.toml", "punctuation.definition.string.begin.toml"]});
    expect(tokens[1]).toEqual({value: "key with spaces", scopes: ["source.toml", "string.quoted.double.toml", "variable.other.key.toml"]});
    expect(tokens[2]).toEqual({value: '"', scopes: ["source.toml", "string.quoted.double.toml", "punctuation.definition.string.end.toml"]});
    expect(tokens[3]).toEqual({value: " ", scopes: ["source.toml"]});
    expect(tokens[4]).toEqual({value: "=", scopes: ["source.toml", "keyword.operator.assignment.toml"]});

    ({tokens} = grammar.tokenizeLine('"key with colons:" ='));
    expect(tokens[0]).toEqual({value: '"', scopes: ["source.toml", "string.quoted.double.toml", "punctuation.definition.string.begin.toml"]});
    expect(tokens[1]).toEqual({value: "key with colons:", scopes: ["source.toml", "string.quoted.double.toml", "variable.other.key.toml"]});
    expect(tokens[2]).toEqual({value: '"', scopes: ["source.toml", "string.quoted.double.toml", "punctuation.definition.string.end.toml"]});
    expect(tokens[3]).toEqual({value: " ", scopes: ["source.toml"]});
    expect(tokens[4]).toEqual({value: "=", scopes: ["source.toml", "keyword.operator.assignment.toml"]});

    ({tokens} = grammar.tokenizeLine('"key wi\\th escapes" ='));
    expect(tokens[0]).toEqual({value: '"', scopes: ["source.toml", "string.quoted.double.toml", "punctuation.definition.string.begin.toml"]});
    expect(tokens[1]).toEqual({value: "key wi", scopes: ["source.toml", "string.quoted.double.toml", "variable.other.key.toml"]});
    expect(tokens[2]).toEqual({value: "\\t", scopes: ["source.toml", "string.quoted.double.toml", "variable.other.key.toml", "constant.character.escape.toml"]});
    expect(tokens[3]).toEqual({value: "h escapes", scopes: ["source.toml", "string.quoted.double.toml", "variable.other.key.toml"]});
    expect(tokens[4]).toEqual({value: '"', scopes: ["source.toml", "string.quoted.double.toml", "punctuation.definition.string.end.toml"]});
    expect(tokens[5]).toEqual({value: " ", scopes: ["source.toml"]});
    expect(tokens[6]).toEqual({value: "=", scopes: ["source.toml", "keyword.operator.assignment.toml"]});

    ({tokens} = grammar.tokenizeLine('"key with \\" quote" ='));
    expect(tokens[0]).toEqual({value: '"', scopes: ["source.toml", "string.quoted.double.toml", "punctuation.definition.string.begin.toml"]});
    expect(tokens[1]).toEqual({value: "key with ", scopes: ["source.toml", "string.quoted.double.toml", "variable.other.key.toml"]});
    expect(tokens[2]).toEqual({value: '\\"', scopes: ["source.toml", "string.quoted.double.toml", "variable.other.key.toml", "constant.character.escape.toml"]});
    expect(tokens[3]).toEqual({value: " quote", scopes: ["source.toml", "string.quoted.double.toml", "variable.other.key.toml"]});
    expect(tokens[4]).toEqual({value: '"', scopes: ["source.toml", "string.quoted.double.toml", "punctuation.definition.string.end.toml"]});
    expect(tokens[5]).toEqual({value: " ", scopes: ["source.toml"]});
    expect(tokens[6]).toEqual({value: "=", scopes: ["source.toml", "keyword.operator.assignment.toml"]});

    ({tokens} = grammar.tokenizeLine('"" ='));
    expect(tokens[0]).toEqual({value: '"', scopes: ["source.toml", "string.quoted.double.toml", "punctuation.definition.string.begin.toml"]});
    expect(tokens[1]).toEqual({value: '"', scopes: ["source.toml", "string.quoted.double.toml", "punctuation.definition.string.end.toml"]});
    expect(tokens[2]).toEqual({value: " ", scopes: ["source.toml"]});
    return expect(tokens[3]).toEqual({value: "=", scopes: ["source.toml", "keyword.operator.assignment.toml"]});
});
});
