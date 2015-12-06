// javascript file for automatic note comments
function Comments()
{
    // set initial variables
    this.m_strSavedXML = '';
    this.m_bEditorOn = false;
    this.m_strMyColor = undefined;
};

// function for showing changes between two strings
Comments.prototype.highlightChanges = function(strOld, strEdited) {
    // set up variables;
    var strStart = "";
    var strMiddle = "";
    var strEnd = "";
    var strOutput = "";
    var intOldLength = strOld.length;
    var intEditedLength = strEdited.length;
    // keep track of whether we are in the middle of a tag
    var intTagOpen = 0;
    var intTagClose = 0;
    
    // set username color if not done already
    if (!this.m_strMyColor) {
        this.m_strMyColor = this.colorUserName(Ubernote.m_strUserName);
    }
    var strSpanStart = '<span style="background-color:' + this.m_strMyColor + ';">';

    // if no old data or strings are the same, return edited
    if ((strOld == null) || (strEdited == strOld)) {
        strOutput = strEdited;
    } else { // else changes have been made
        // forwards string match to set opening colored span tag
        for (var i = 0; i < intOldLength; i++) {
            // if match is found, only try to set tag trackers
            if (strOld.charAt(i) == strEdited.charAt(i)) {
                if (strOld.charAt(i) == "<") {
                    intTagOpen = i;
                }
                if (strOld.charAt(i) == ">") {
                    intTagClose = i;
                }
            } else {
                // if we are in the middle of a tag, go back to the beginning of it
                if (intTagOpen > intTagClose) {
                    strStart = strEdited.substring(0, intTagOpen) + strSpanStart;
                    strMiddle = strEdited.substring(intTagOpen);
                } else { // else add the opening colored span tag here
                    strStart = strEdited.substring(0, i) + strSpanStart;           
                    strMiddle = strEdited.substring(i);
                }
                break;
            }
        }
        
        var intMiddleLength = strMiddle.length;
        // reset these variables for use in backwards match
        intTagOpen = 0;
        intTagClose = 0;
        
        // backwards string match to set closing colored span tag
        for (var j = 0; j < intEditedLength; j++) {
            // if match is found, only try to set tag trackers
            if (strOld.charAt(strOld.length - j) == strEdited.charAt(strEdited.length - j)) {
                if (strEdited.charAt(intEditedLength - j) == "<") {
                    intTagOpen = j;
                }
                if (strEdited.charAt(intEditedLength - j) == ">") {
                    intTagClose = j;
                }        
            } else {
                // if we are in the middle of a tag, go back to end of it
                if (intTagClose > intTagOpen) {
                    strEnd = strSpanEnd + strMiddle.substring(intMiddleLength - (intTagClose - 1), intMiddleLength);
                    strMiddle = strMiddle.substring(0, intMiddleLength - (intTagClose - 1));            
                } else { // else add the closing colored span tag here
                    strEnd = strSpanEnd + strMiddle.substring(intMiddleLength - (j - 1), intMiddleLength);
                    strMiddle = strMiddle.substring(0, intMiddleLength - (j - 1));
                }
                break;
            }
        }
        
        // if html tags are in the middle, fix the spans to go around them
        strMiddle = strMiddle.replace(/<([^>]+)>/gi, '</span><$1>' + strSpanStart);
        // delete useless spans that may get added
        strOutput = strStart + strMiddle + strEnd;
        strOutput = strOutput.replace('</span>' + strSpanStart, '', 'g');
        strOutput = strOutput.replace(strSpanStart + '</span>', '', 'g');
        // delete double spans
        var intDoubleSpan = 0;
        var intStartLength = strSpanStart.length;
        while (strOutput.indexOf(strSpanStart + strSpanStart) != -1) {
            intDoubleSpan = strOutput.indexOf(strSpanStart + strSpanStart);
            strOutput = strOutput.substring(0, intDoubleSpan) + strOutput.substring(intDoubleSpan + intStartLength, strOutput.length).replace(strSpanEnd + strSpanEnd, strSpanEnd);
        }
    }
    
    // set saved xml to get ready for future changes    
    this.m_strSavedXML = strOutput;
    return strOutput;
};

// returns a nice color for highlighting usernames
Comments.prototype.colorUserName = function(strUserName) {
    // set up variables
    var intUserNumber = 0;
    var intRed, intGreen, intBlue;
    
    // use the characters in the username to determine the initial seed
    for (var i = 0; i < strUserName.length; i++) {
        intUserNumber += (strUserName.charCodeAt(i) * 181); // intUserNumber is our seed number based on the username
    }
 
    // make sure all numbers are greater than 176 (B0 in base 16), since we don't want dark colors
    intRed = (255 - (intUserNumber % 112));
    intGreen = (255 - ((intUserNumber * intRed) % 112)); // reseed with intRed
    intBlue = (255 - ((intUserNumber * intGreen) % 112)); // reseed with intGreen
    
    // pick a primary color: the highest number of RGB and set it no less than 240 (F0 in base 16)
    if (intRed > intGreen && intRed > intBlue) { // red highest
        intRed = 255 - (intUserNumber % 16);
        if ((intRed + intGreen + intBlue) > 725) { // if colors are too light (sum > 725) then darken the lowest one
            if (intGreen < intBlue) {
                intGreen -= (16 + (intUserNumber % 54));
            } else {
                intBlue -= (16 + (intUserNumber % 54));            
            }
        }
    } else if (intGreen > intBlue) { // green highest
        intGreen = 255 - (intUserNumber % 16);
        if ((intRed + intGreen + intBlue) > 725) { // if colors are too light (sum > 725) then darken the lowest one
            if (intRed < intBlue) {
                intRed -= (16 + (intUserNumber % 54));
            } else {
                intBlue -= (16 + (intUserNumber % 54));            
            }
        }
    } else { // blue highest
        intBlue = 255 - (intUserNumber % 16);
        if ((intRed + intGreen + intBlue) > 725) { // if colors are too light (sum > 725) then darken the lowest one
            if (intGreen < intRed) {
                intGreen -= (16 + (intUserNumber % 54));
            } else {
                intRed -= (16 + (intUserNumber % 54));            
            }
        }
    }
    
    // return the number in hex color format: #FFFFFF
    return '#' + intRed.toString(16) + intGreen.toString(16) + intBlue.toString(16);
};

// stores old note text after editor click or focus
Comments.prototype.storeXML = function( in_objNoteText ) {
        //try { // try to get note data, throws error if new note is created
            // if editor is off, then set note data
            if (Comments.m_bEditorOn == false) {
                // get note's xml from correct place
                Comments.m_strSavedXML = in_objNoteText.getXML();
            }
        //} catch (e) {
            // do nothing
        //}
};

// create Comments object to work with
var Comments = new Comments();