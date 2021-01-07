/* eslint-disable */

/*
Legendword Expression Specifications (2021 Ver. 1)

Special Criteria
* everything between its left criterion and its right criterion ( if the criterion is not provided, it uses the start of string and end of string )
    e.g. a*b matches all substrings which begin with a and end with b, regardless of what's in between (even spaces and newlines won't affect it).
    e.g. *b matches from the beginning of string to the first letter b.
*<> same as *, but allows the right criterion to use <> restrictions
    e.g. a*<><n> matches all substrings with begin with a and end with a number.
*<w> everything within a word
    e.g. a*<w>b matches all substrings which begin with a and end with b but do not include spaces or newlines: "weaes;bsbff" yields "es;", "rsta uvwb" yields none.
? any character (only one)
?<n> any number (only one)
?<c> any letter (only one)
?<[12cd]> any of 1, 2, c, or d (only one)
?<n[ab]> any number or a or b (only one)

Match Restrictions
<n> number (0-9)
<c> letter (a-z and A-Z)
<w> whole word (everything except SPACE and NEWLINE)
< > space
<s> space
<l> newline (\n)

Match Group
[] matches anything inside of it

Capture Group
() represents a capture group

Capture Group Connections
(A) or (B) matches any of A, or any of B (prioritizes the one on the left)
(A) in (B) matches all A inside all B [todo]
(A) after (B) matches all A which immediately succeed B [todo]

*/
class LegendwordExpression {
    expr;
    restrictionReference = {
        'n': '0123456789',
        'c': 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
        'w': ' \n\r',
        ' ': ' ',
        's': ' ',
        'l': '\n\r'
    };
    constructor(queryString) {
        this.expr = queryString;
        this.analyzeCaptureGroups();
    }
    analyzeQuery(expr) {
        let query = [];
        var pendingMatchGroup = {}, //[]
            pendingSpecialGroup = {}, //? or *
            pendingRestrictionGroup = {}; //<>
        /* Group Structure
            pendingMatchGroup: {
                type: 1,
                val: [],
                plain: true
            }
            pendingSpecialGroup: {
                type: 2,
                -   val: null if no restriction
                -   val: pendingRestrictionGroup if has <>
                -   single: true if ?
                -   single: false if *
            }
            pendingRestrctionGroup: {
                type: 1,
                val: [] array of plain values, but not using plain:true because of reverse
                reverse: true/false (true->rule becomes 'everything except val')
            }
        */
        var mode = [-1]; //-1: None, 0: [], 1: <> 2: ? or *
        for (let i=0;i<expr.length;i++) {
            let c = expr[i];
            let curMode = mode[mode.length-1];
            if (c == '[') {
                if (curMode === 2) {
                    query.push(pendingSpecialGroup);
                    mode.pop();
                }
                else if (curMode === 0) {
                    throw "QueryParseException";
                }
                pendingMatchGroup = {
                    type: 1, //any one of val
                    val: [],
                    plain: true
                };
                mode.push(0);
            }
            else if (c == ']') {
                if (curMode !== 0) {
                    throw "QueryParseException";
                }
                if (mode.length > 2 && mode[mode.length - 2] === 1) {
                    if (pendingRestrictionGroup.reverse == true) {
                        pendingRestrictionGroup.val = pendingRestrictionGroup.val.filter(v => !pendingMatchGroup.val.includes(v));
                    }
                    else {
                        pendingRestrictionGroup.val = pendingRestrictionGroup.val.concat(pendingMatchGroup.val.filter(v => !pendingRestrictionGroup.val.includes(v)));
                    }
                    mode.pop();
                }
                else {
                    query.push(pendingMatchGroup);
                    mode.pop();
                }
            }
            else if (c == '?') {
                if (curMode !== -1) {
                    throw "QueryParseException";
                }
                pendingSpecialGroup = {
                    type: 2, //? group
                    val: null,
                    single: true //true: ?, false: *
                };
                mode.push(2);
            }
            else if (c == '<') {
                if (curMode === 0 || curMode === 1) {
                    throw "QueryParseException";
                }
                pendingRestrictionGroup = {
                    type: 1,
                    val: [],
                    reverse: false
                };
                mode.push(1);
            }
            else if (c == '>') {
                if (curMode !== 1) {
                    throw "QueryParseException";
                }
                if (mode.length > 2 && mode[mode.length-2] === 2) { //*<> or ?<>
                    pendingSpecialGroup.val = pendingRestrictionGroup;
                    query.push(pendingSpecialGroup);
                    mode.pop();
                    mode.pop();
                }
                else {
                    query.push(pendingRestrictionGroup);
                    mode.pop();
                }
            }
            else {
                if (curMode === -1) {
                    query.push({
                        type: 0, //just one val
                        val: c,
                        plain: true
                    })
                }
                else if (curMode === 0) {
                    pendingMatchGroup.val.push(c);
                }
                else if (curMode === 1) {
                    if (this.restrictionReference[c] == null) {
                        //no such restriction defined
                    }
                    else {
                        let valarr = this.restrictionReference[c].split('');
                        if (c == 'w') {
                            if (pendingRestrictionGroup.reverse == true) {
                                //todo
                            }
                            else {
                                pendingRestrictionGroup.val = valarr.filter(v => !pendingRestrictionGroup.val.includes(v));
                                pendingRestrictionGroup.reverse = true;
                            }
                        }
                        else if (pendingRestrictionGroup.reverse == true) {
                            pendingRestrictionGroup.val = pendingRestrictionGroup.val.filter(v => !valarr.includes(v)); //remove valarr values from val
                        }
                        else {
                            pendingRestrictionGroup.val = pendingRestrictionGroup.val.concat(valarr.filter(v => !pendingRestrictionGroup.val.includes(v))) //add to val, but do not add duplicates
                        }
                    }
                    //pendingRestrictionGroup.val
                }
                else if (curMode === 2) {
                    query.push(pendingSpecialGroup);
                    mode.pop();
                    query.push({
                        type: 0, //just one val
                        val: c,
                        plain: true
                    })
                }
            }
        }
        console.log("mode: ", mode)
        return query;
    }
    analyzeCaptureGroups() {
        this.groups = [];
        //capture groups
        var groupStart = -1;
        var groupEnd = this.expr.length;
        var lastGroupEnd = -1;
        for (let i=0;i<this.expr.length;i++) {
            let c = this.expr[i];
            if (c == '(') {
                groupStart = i;
            }
            else if (c == ')') {
                groupEnd = i;
                if (this.groups.length == 0) {
                    let expr = this.expr.substring(groupStart+1, groupEnd);
                    this.groups.push({
                        expr: expr,
                        query: this.analyzeQuery(expr)
                    });
                }
                else {
                    let strBetween = this.expr.substring(lastGroupEnd+1, groupStart);
                    if (strBetween.trim() == 'or') {
                        let expr = this.expr.substring(groupStart+1, groupEnd);
                        this.groups.push({
                            expr: expr,
                            query: this.analyzeQuery(expr)
                        });
                    }
                    else if (strBetween.trim() == 'in') {
                        //todo
                    }
                }
                lastGroupEnd = i;
            }
        }
        if (groupStart == -1) { //no capture group
            this.groups.push({
                expr: this.expr,
                query: this.analyzeQuery(this.expr)
            })
        }
    }
    replace(target, newSubstr) {
        
    }
}
export default LegendwordExpression;