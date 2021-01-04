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
(A) in (B) matches all A inside all B
(A) after (B) matches all A which immediately succeed B

*/
class LegendwordExpression {
    str;
    constructor(queryString) {
        this.str = queryString;
    }
    replace(target, newSubstr) {
        
    }
}
export default LegendwordExpression;