/// <reference path="..\..\..\services\patternMatcher.ts" />

describe("PatternMatcher", () => {
    describe("BreakIntoCharacterSpans", () => {
        it("EmptyIdentifier", () => {
            verifyBreakIntoCharacterSpans("");
        });

        it("SimpleIdentifier", () => {
            verifyBreakIntoCharacterSpans("foo", "foo");
        });

        it("PrefixUnderscoredIdentifier", () => {
            verifyBreakIntoCharacterSpans("_foo", "_", "foo");
        });

        it("UnderscoredIdentifier", () => {
            verifyBreakIntoCharacterSpans("f_oo", "f", "_", "oo");
        });

        it("PostfixUnderscoredIdentifier", () => {
            verifyBreakIntoCharacterSpans("foo_", "foo", "_");
        });

        it("PrefixUnderscoredIdentifierWithCapital", () => {
            verifyBreakIntoCharacterSpans("_Foo", "_", "Foo");
        });

        it("MUnderscorePrefixed", () => {
            verifyBreakIntoCharacterSpans("m_foo", "m", "_", "foo");
        });

        it("CamelCaseIdentifier", () => {
            verifyBreakIntoCharacterSpans("FogBar", "Fog", "Bar");
        });

        it("MixedCaseIdentifier", () => {
            verifyBreakIntoCharacterSpans("fogBar", "fog", "Bar");
        });

        it("TwoCharacterCapitalIdentifier", () => {
            verifyBreakIntoCharacterSpans("UIElement", "U", "I", "Element");
        });

        it("NumberSuffixedIdentifier", () => {
            verifyBreakIntoCharacterSpans("Foo42", "Foo", "42");
        });

        it("NumberContainingIdentifier", () => {
            verifyBreakIntoCharacterSpans("Fog42Bar", "Fog", "42", "Bar");
        });

        it("NumberPrefixedIdentifier", () => {
            verifyBreakIntoCharacterSpans("42Bar", "42", "Bar");
        });
    });

    describe("BreakIntoWordSpans", () => {
        it("VarbatimIdentifier", () => {
            verifyBreakIntoWordSpans("@int:", "int");
        });

        it("AllCapsConstant", () => {
            verifyBreakIntoWordSpans("C_STYLE_CONSTANT", "C", "_", "STYLE", "_", "CONSTANT");
        });

        it("SingleLetterPrefix1", () => {
            verifyBreakIntoWordSpans("UInteger", "U", "Integer");
        });

        it("SingleLetterPrefix2", () => {
            verifyBreakIntoWordSpans("IDisposable", "I", "Disposable");
        });

        it("TwoCharacterCapitalIdentifier", () => {
            verifyBreakIntoWordSpans("UIElement", "UI", "Element");
        });

        it("XDocument", () => {
            verifyBreakIntoWordSpans("XDocument", "X", "Document");
        });

        it("XMLDocument1", () => {
            verifyBreakIntoWordSpans("XMLDocument", "XML", "Document");
        });

        it("XMLDocument2", () => {
            verifyBreakIntoWordSpans("XmlDocument", "Xml", "Document");
        });

        it("TwoUppercaseCharacters", () => {
            verifyBreakIntoWordSpans("SimpleUIElement", "Simple", "UI", "Element");
        });
    });

    describe("SingleWordPattern", () => {
        it("PreferCaseSensitiveExact", () => {
            const match = getFirstMatch("Foo", "Foo");

            assert.equal(ts.PatternMatchKind.exact, match.kind);
            assert.equal(true, match.isCaseSensitive);
        });

        it("PreferCaseSensitiveExactInsensitive", () => {
            const match = getFirstMatch("foo", "Foo");

            assert.equal(ts.PatternMatchKind.exact, match.kind);
            assert.equal(false, match.isCaseSensitive);
        });

        it("PreferCaseSensitivePrefix", () => {
            const match = getFirstMatch("Foo", "Fo");

            assert.equal(ts.PatternMatchKind.prefix, match.kind);
            assert.equal(true, match.isCaseSensitive);
        });

        it("PreferCaseSensitivePrefixCaseInsensitive", () => {
            const match = getFirstMatch("Foo", "fo");

            assert.equal(ts.PatternMatchKind.prefix, match.kind);
            assert.equal(false, match.isCaseSensitive);
        });

        it("PreferCaseSensitiveCamelCaseMatchSimple", () => {
            const match = getFirstMatch("FogBar", "FB");

            assert.equal(ts.PatternMatchKind.camelCase, match.kind);
            assert.equal(true, match.isCaseSensitive);
        });

        it("PreferCaseSensitiveCamelCaseMatchPartialPattern", () => {
            const match = getFirstMatch("FogBar", "FoB");

            assert.equal(ts.PatternMatchKind.camelCase, match.kind);
            assert.equal(true, match.isCaseSensitive);
        });

        it("PreferCaseSensitiveCamelCaseMatchToLongPattern1", () => {
            const match = getFirstMatch("FogBar", "FBB");

            assert.isTrue(match === undefined);
        });

        it("PreferCaseSensitiveCamelCaseMatchToLongPattern2", () => {
            const match = getFirstMatch("FogBar", "FoooB");

            assert.isTrue(match === undefined);
        });

        it("CamelCaseMatchPartiallyUnmatched", () => {
            const match = getFirstMatch("FogBarBaz", "FZ");

            assert.isTrue(match === undefined);
        });

        it("CamelCaseMatchCompletelyUnmatched", () => {
            const match = getFirstMatch("FogBarBaz", "ZZ");

            assert.isTrue(match === undefined);
        });

        it("TwoUppercaseCharacters", () => {
            const match = getFirstMatch("SimpleUIElement", "SiUI");

            assert.equal(ts.PatternMatchKind.camelCase, match.kind);
            assert.equal(true, match.isCaseSensitive);
        });

        it("PreferCaseSensitiveLowercasePattern", () => {
            const match = getFirstMatch("FogBar", "b");

            assert.equal(ts.PatternMatchKind.substring, match.kind);
            assert.equal(false, match.isCaseSensitive);
        });

        it("PreferCaseSensitiveLowercasePattern2", () => {
            const match = getFirstMatch("FogBar", "fB");

            assert.equal(ts.PatternMatchKind.camelCase, match.kind);
            assert.equal(false, match.isCaseSensitive);
        });

        it("PreferCaseSensitiveTryUnderscoredName", () => {
            const match = getFirstMatch("_fogBar", "_fB");

            assert.equal(ts.PatternMatchKind.camelCase, match.kind);
            assert.equal(true, match.isCaseSensitive);
        });

        it("PreferCaseSensitiveTryUnderscoredName2", () => {
            const match = getFirstMatch("_fogBar", "fB");

            assert.equal(ts.PatternMatchKind.camelCase, match.kind);
            assert.equal(true, match.isCaseSensitive);
        });

        it("PreferCaseSensitiveTryUnderscoredNameInsensitive", () => {
            const match = getFirstMatch("_FogBar", "_fB");

            assert.equal(ts.PatternMatchKind.camelCase, match.kind);
            assert.equal(false, match.isCaseSensitive);
        });

        it("PreferCaseSensitiveMiddleUnderscore", () => {
            const match = getFirstMatch("Fog_Bar", "FB");

            assert.equal(ts.PatternMatchKind.camelCase, match.kind);
            assert.equal(true, match.isCaseSensitive);
        });

        it("PreferCaseSensitiveMiddleUnderscore2", () => {
            const match = getFirstMatch("Fog_Bar", "F_B");

            assert.equal(ts.PatternMatchKind.camelCase, match.kind);
            assert.equal(true, match.isCaseSensitive);
        });

        it("PreferCaseSensitiveMiddleUnderscore3", () => {
            const match = getFirstMatch("Fog_Bar", "F__B");

            assert.isTrue(undefined === match);
        });

        it("PreferCaseSensitiveMiddleUnderscore4", () => {
            const match = getFirstMatch("Fog_Bar", "f_B");

            assert.equal(ts.PatternMatchKind.camelCase, match.kind);
            assert.equal(false, match.isCaseSensitive);
        });

        it("PreferCaseSensitiveMiddleUnderscore5", () => {
            const match = getFirstMatch("Fog_Bar", "F_b");

            assert.equal(ts.PatternMatchKind.camelCase, match.kind);
            assert.equal(false, match.isCaseSensitive);
        });

        it("AllLowerPattern1", () => {
            const match = getFirstMatch("FogBarChangedEventArgs", "changedeventargs");

            assert.isTrue(undefined !== match);
        });

        it("AllLowerPattern2", () => {
            const match = getFirstMatch("FogBarChangedEventArgs", "changedeventarrrgh");

            assert.isTrue(undefined === match);
        });

        it("AllLowerPattern3", () => {
            const match = getFirstMatch("ABCDEFGH", "bcd");

            assert.isTrue(undefined !== match);
        });

        it("AllLowerPattern4", () => {
            const match = getFirstMatch("AbcdefghijEfgHij", "efghij");

            assert.isTrue(undefined === match);
        });
    });

    describe("MultiWordPattern", () => {
        //mv
        function assertKind(candidate: string, pattern: string, kind: ts.PatternMatchKind, isCaseSensitive = true) {//name
            const matches = getAllMatches(candidate, pattern);
            assert.equal(matches.kind, kind);
            assert.equal(matches.isCaseSensitive, isCaseSensitive);
        }

        it("ExactWithLowercase", () => {
            assertKind("AddMetadataReference", "addmetadatareference", ts.PatternMatchKind.exact, /*isCaseSensitive*/ false);
        });

        it("SingleLowercasedSearchWord1", () => {
            assertKind("AddMetadataReference", "add", ts.PatternMatchKind.prefix, /*isCaseSensitive*/ false);
        });

        it("SingleLowercasedSearchWord2", () => {
            assertKind("AddMetadataReference", "metadata", ts.PatternMatchKind.substring, /*isCaseSensitive*/ false);
        });

        it("SingleUppercaseSearchWord1", () => {
            assertKind("AddMetadataReference", "Add", ts.PatternMatchKind.prefix);
        });

        it("SingleUppercaseSearchWord2", () => {
            assertKind("AddMetadataReference", "Metadata", ts.PatternMatchKind.substring);
        });

        it("SingleUppercaseSearchLetter1", () => {
            assertKind("AddMetadataReference", "A", ts.PatternMatchKind.prefix);
        });

        it("SingleUppercaseSearchLetter2", () => {
            assertKind("AddMetadataReference", "M", ts.PatternMatchKind.substring);
        });

        it("TwoLowercaseWords", () => {
            assertKind("AddMetadataReference", "add metadata", ts.PatternMatchKind.prefix, /*isCaseSensitive*/ false);

            //assertContainsKind(ts.PatternMatchKind.prefix, matches);
            //assertContainsKind(ts.PatternMatchKind.substring, matches);
        });

        it("TwoLowercaseWords", () => {
            assertKind("AddMetadataReference", "A M", ts.PatternMatchKind.prefix);

            //assertContainsKind(ts.PatternMatchKind.prefix, matches);
            //assertContainsKind(ts.PatternMatchKind.substring, matches);
        });

        it("TwoLowercaseWords", () => {
            assertKind("AddMetadataReference", "AM", ts.PatternMatchKind.camelCase);
        });

        it("TwoLowercaseWords", () => {
            assertKind("AddMetadataReference", "ref Metadata", ts.PatternMatchKind.substring, /*isCaseSensitive*/ false);
        });

        it("TwoLowercaseWords", () => {
            assertKind("AddMetadataReference", "ref M", ts.PatternMatchKind.substring, /*isCaseSensitive*/ false);
        });

        it("MixedCamelCase", () => {
            assertKind("AddMetadataReference", "AMRe", ts.PatternMatchKind.camelCase);
        });

        it("BlankPattern", () => {
            assert.equal(getAllMatches("AddMetadataReference", ""), undefined);
        });

        it("WhitespaceOnlyPattern", () => {
            assert.equal(getAllMatches("AddMetadataReference", " "), undefined);
        });

        it("EachWordSeparately1", () => {
            assertKind("AddMetadataReference", "add Meta", ts.PatternMatchKind.prefix, /*isCaseSensitive*/ false);
        });

        it("EachWordSeparately2", () => {
            assertKind("AddMetadataReference", "Add meta", ts.PatternMatchKind.prefix, /*isCaseSensitive*/ false);
        });

        it("EachWordSeparately3", () => {
            assertKind("AddMetadataReference", "Add Meta", ts.PatternMatchKind.prefix);
        });

        it("MixedCasing", () => {
            assert.equal(getAllMatches("AddMetadataReference", "mEta"), undefined);
        });

        it("MixedCasing2", () => {
            assert.equal(getAllMatches("AddMetadataReference", "Data"), undefined);
        });

        it("AsteriskSplit", () => {
            assertKind("GetKeyWord", "K*W", ts.PatternMatchKind.substring);
        });

        it("LowercaseSubstring1", () => {
            const matches = getAllMatches("Operator", "a");

            assert.isTrue(matches === undefined);
        });

        it("LowercaseSubstring2", () => {
            assertKind("FooAttribute", "a", ts.PatternMatchKind.substring, /*isCaseSensitive*/ false);
        });
    });

    describe("DottedPattern", () => {
        it("DottedPattern1", () => {
            getMatchForDottedPattern("Foo.Bar.Baz", "Quux", "B.Q", { kind: ts.PatternMatchKind.prefix, isCaseSensitive: true });
        });

        it("DottedPattern2", () => {
            getMatchForDottedPattern("Foo.Bar.Baz", "Quux", "C.Q", undefined);
        });

        it("DottedPattern3", () => {
            getMatchForDottedPattern("Foo.Bar.Baz", "Quux", "B.B.Q", { kind: ts.PatternMatchKind.prefix, isCaseSensitive: true });
        });

        it("DottedPattern4", () => {
            getMatchForDottedPattern("Foo.Bar.Baz", "Quux", "Baz.Quux", { kind: ts.PatternMatchKind.exact, isCaseSensitive: true });
        });

        it("DottedPattern5", () => {
            getMatchForDottedPattern("Foo.Bar.Baz", "Quux", "F.B.B.Quux", { kind: ts.PatternMatchKind.prefix, isCaseSensitive: true });
        });

        it("DottedPattern6", () => {
            getMatchForDottedPattern("Foo.Bar.Baz", "Quux", "F.F.B.B.Quux", undefined);
        });

        it("DottedPattern7", () => {
            assert.deepEqual(getFirstMatch("UIElement", "UIElement"), { kind: ts.PatternMatchKind.exact, isCaseSensitive: true });
            assert.deepEqual(getFirstMatch("GetKeyword", "UIElement"), undefined);
        });
    });

    function getFirstMatch(candidate: string, pattern: string): ts.MatchInfo { //name
        return ts.createPatternMatcher(pattern).getMatchesForLastSegmentOfPattern(candidate);
    }

    function getAllMatches(candidate: string, pattern: string): ts.MatchInfo {
        return ts.createPatternMatcher(pattern).getMatchesForLastSegmentOfPattern(candidate);
    }

    //name
    function getMatchForDottedPattern(dottedContainer: string, candidate: string, pattern: string, match: ts.MatchInfo | undefined): void { //name
        assert.deepEqual(ts.createPatternMatcher(pattern).getFullMatch(dottedContainer.split("."), candidate), match);
    }

    function spanListToSubstrings(identifier: string, spans: ts.TextSpan[]) {
        return ts.map(spans, s => identifier.substr(s.start, s.length));
    }

    function breakIntoCharacterSpans(identifier: string) {
        return spanListToSubstrings(identifier, ts.breakIntoCharacterSpans(identifier));
    }

    function breakIntoWordSpans(identifier: string) {
        return spanListToSubstrings(identifier, ts.breakIntoWordSpans(identifier));
    }
    function assertArrayEquals<T>(array1: T[], array2: T[]) {
        assert.equal(array1.length, array2.length);

        for (let i = 0; i < array1.length; i++) {
            assert.equal(array1[i], array2[i]);
        }
    }

    function verifyBreakIntoCharacterSpans(original: string, ...parts: string[]): void {
        assertArrayEquals(parts, breakIntoCharacterSpans(original));
    }

    function verifyBreakIntoWordSpans(original: string, ...parts: string[]): void {
        assertArrayEquals(parts, breakIntoWordSpans(original));
    }
});
