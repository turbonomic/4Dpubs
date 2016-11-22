/**
 * Created by kalel on 10/21/16.
 */

// Original JavaScript code by Chirp Internet: www.chirp.com.au
// Please acknowledge use of this code by including this header.
/**
 * The ID is for the element that contains the text you want to highlight.
 * @param id
 * @param tag
 * @constructor
 */
var Hilightor = function(id, tag) {
    var that = this;

    var targetNode = document.getElementById(id) || document.body;
    var hiliteTag = tag || "EM";
    var skipTags = new RegExp("^(?:" + hiliteTag + "|SCRIPT|FORM|SPAN)$");
    var highlightStart = '<span class="searchHighlight">';
    var highlightEnd = '</span>';

    this.input;

    // recursively apply word highlighting
    that.hiliteWords = function(node)
    {
        if(node == undefined || !node) {
            console.log("Hilightor.hiliteWords god a null node");
            return;
        }
        if(skipTags.test(node.nodeName)) return;

        if(node.hasChildNodes()) {
            for(var i=0; i < node.childNodes.length; i++)
                that.hiliteWords(node.childNodes[i]);
        }
        if(node.nodeType == 3) { // NODE_TEXT
            var nv = node.nodeValue;
            if(nv !== undefined && nv !== "" && nv !== " ") {
                var wordLists = stemStringToParallelLists(nv, that.input);
                if(undefined !== wordLists) {
                    var output = wordLists.highlightForListOfStemmedWords(that.input, highlightStart, highlightEnd);
                    if(undefined !== output) {
                        var newSpan = document.createElement('span');
                        newSpan.setAttribute('class', 'search_highlight_wrapper'); // Needed to inject the highlight...
                        newSpan.innerHTML = " "+output+" ";
                        node.parentNode.insertBefore(newSpan, node);
                        node.parentNode.removeChild(node);
                    }
                }
            }
        }
    };

    // remove highlighting
    this.remove = function() {
        var arr = document.getElementsByClassName('searchHighlight');
        while(arr.length && (el = arr[0])) {
            var parent = el.parentNode;
            parent.replaceChild(el.firstChild, el);
            parent.normalize();
        }
        arr = document.getElementsByClassName('search_highlight_wrapper');
        while(arr.length && (el = arr[0])) {
            var parent = el.parentNode;
            parent.replaceChild(el.firstChild, el);
            parent.normalize();
        }
    };

    // start highlighting at target node
    this.apply = function(input)
    {
        console.log("HIGHLIGHTER IS APPLYING TO this word: "+input);
        if(input == undefined || !input) return;
        that.input = input;
        that.remove();
        //this.setRegex(input);
        if(targetNode == undefined || !targetNode) {
            console.log("Highlightor.apply can't find a target node.");
            return;
        }
        that.hiliteWords(targetNode);
    };

};


var stemUnstemmedList = function(list) {
    var len = list.length;
    var w = "";
    var retList = new Array();
    for(var i=0; i<len; i++) {
        w = doStem(list[i]);
        if(undefined === w || "" === w) {
            retList[i] = "NOT_A_VALID_WORD";
        } else {
            retList[i] = w;
        }
    }
    return(retList);
};

var stemStringOfWords = function(s) {
    if(undefined === s || "" === s) return(undefined);
    var inputStr = s.replace(/^\s+|\s+$/g,'');
    var input = inputStr.split(" ");
    var len = input.length;
    if(0 === len) return(undefined);

    var retList = new Array();
    for(var i=0; i<len; i++) {
        retList[i] = doStem(input[i]);
    }
    var retStr = "";
    for(i=0; i<len; i++) {
        retStr = retStr+" "+retList[i];
    }
    if(undefined !== retStr && "" !== retStr) {
        retStr = retStr.replace(/^\s+|\s+$/g,'');
    }
    return(retStr);
};

var stemStringToParallelLists = function(inStr) {
    if(undefined === inStr || "" === inStr) return(undefined);
    var s = inStr.replace(/\n/g, " "); // Strip unwanted \n
    s = s.replace(/^\s+|\s+$/g,''); // Will have to add spaces before and after when putting back into node.
    if(undefined === s || "" === s) return(undefined);

    var unstemmedList = s.split(" ");
    var len = unstemmedList.length;
    if(0 === len) return(undefined);
    var stemmedList = this.stemUnstemmedList(unstemmedList);

    var retObj = {};
    retObj.that = this;
    retObj.len = len;
    retObj.unstemmedList = unstemmedList;
    retObj.stemmedList = stemmedList;

    retObj.getUnstemmedWord = function(w) {
        for(var i=0; i<this.len; i++) {
            if(this.stemmedList[i] === w) {
                return(this.unstemmedList[i]);
            }
        }
        return(undefined);
    };

    retObj.highlightForListOfStemmedWords = function(stemmedSearchTerms, hlStart, hlEnd) {
        var foundHit = false;
        var highlightUnstemmedHits = function(stemmedWord, hlStart, hlEnd) {
            for(var i=0; i<retObj.len; i++) {
                if(retObj.stemmedList[i] === stemmedWord) {
                    retObj.unstemmedList[i] = hlStart+retObj.unstemmedList[i]+hlEnd;
                    foundHit = true;
                }
            }
            return(foundHit);
        };
        var searchTerms = stemmedSearchTerms.replace(/^\s+|\s+$/g,'')
        var list = searchTerms.split(" ");
        var listLen = list.length;
        if(listLen < 1) {
            return;
        }
        for(var ii=0; ii<listLen; ii++) {
            highlightUnstemmedHits(list[ii], hlStart, hlEnd);
        }

        var retStr = "";
        for(i=0; i<this.len; i++) {
            retStr = retStr+this.unstemmedList[i]+" ";
        }
        if(foundHit === true) {
            return(retStr);
        } else {
            return(undefined);
        }
    };
    return(retObj);
};


//
// Client side must replicate stemming that was done to create search database.
//
var doStem = function(w) {
    var len = w.length;
    var sBuf = "";
    var code;
    for(var i=0; i<len; i++) {
        code = w.charCodeAt(i);
        if ( ((code >= 65) && (code <= 90)) || ((code >= 97) && (code <= 122)) ) {
            sBuf=sBuf+w.charAt(i);
        } else {
            break;
        }
    }
    return(stemmer(sBuf.toLowerCase()));
};



angular
    .module ('4D')
    .factory ('SearchService', ['$window', '$rootScope', 'TransformService', function($window, $rootScope, TransformService) {


        var sDat;


        var words;
        var that = this;
        var tmpVal = [];
        var retVal = [];
        var _searchType;
        var _searchTermStr = "";
        var rootDoc = "";

        var getWordWeights = function(word) {
            var w = doStem(word);
            if("And" === _searchType) {
                tmpVal = [];
            }
            for(var i=0; i<sDat.len; i++) {

                var bodyVal = sDat.searchData[i].body[w];
                var titleVal = sDat.searchData[i].title[w];
                var keywordsVal = sDat.searchData[i].keywords[word];
                var val = 0;
                if(undefined !== bodyVal) val = parseInt(bodyVal);
                if(undefined !== titleVal) val = parseInt(val) + (20 * parseInt(titleVal));
                if(undefined !== keywordsVal) val = parseInt(val) + (20 * parseInt(keywordsVal));

                if(0 !== val) {
                    var item = {};
                    item.and = 0;
                    item.score = val;
                    item.file = sDat.searchData[i].file;
                    item.name = sDat.searchData[i].name;
                    tmpVal.push(item);
                    //console.log("getWordWeights - Pushing entry into list: "+item.name +" :: "+item.file);
                }
            }
        };

        /**
         * Call getWordWeights for an OR search
         */
        var getOrWeight = function() {
            tmpVal = [];
            var len = words.length;
            for(var i=0; i<len; i++) {
                getWordWeights(words[i]);
            }
        };

        /**
         * Call getWordWeights for an AND search
         * @param words
         */
        var getAndWeight = function(words) {
            console.log("GETTING AND WEIGHT FOR: "+words[0]);
            var len = words.length;
            if(len === 0) {
                console.log("getAndWeight: No Search Terms!");
                return;
            }
            getWordWeights(words[0]);
            mergeHits(); // first word hits go straight into retVal...
            for(var i=1; i<len; i++) { // refine the list...
                andWordIntoList(words[i]);
            }
        };

        /**
         * Step through all the tmpVal items and look for duplicate filenames.
         * Merge these and add up the weights in retVal
         */
        var mergeHits = function() {
            retVal = [];
            var len = tmpVal.length;
            for(var i=0; i<len; i++) {
                if(i===0) {
                    retVal.push(tmpVal[i]);
                } else {
                    var retIndex = getRetValFileIndex(tmpVal[i].file);
                    if(-1 === retIndex) {
                        retVal.push(tmpVal[i]);
                    } else {
                        retVal[retIndex].score = parseInt(retVal[retIndex].score) + parseInt(tmpVal[i].score);
                    }
                }
            }
        };

        /**
         * Called for AND search, for subsequent words in the list of words to search.
         * getWordWeights reset tehe tempList to an empty array, and then gets hists.
         * For all the hits, then search through retList for any with a matching file...
         * Set the .and value to 1, then delete all that have .and === 0.
         * @param w
         */
        var andWordIntoList = function(w) {
            console.log("ADDING AND WORD: "+w);
            getWordWeights(w);
            var len = tmpVal.length;
            for(var i=0; i<len; i++) {
                var retIndex = getRetValFileIndex(tmpVal[i].file);
                if(-1 !== retIndex) {
                    tmpVal[i].score = parseInt(retVal[retIndex].score) + parseInt(tmpVal[i].score);
                    tmpVal[i].and = 1;
                }
            }
            retVal = [];
            retVal.length = 0;
            for(i=0; i<len; i++) {
                if(tmpVal[i].and === 1) {
                    tmpVal[i].and = 0; // Clear the flag
                    retVal.push(tmpVal[i]);
                }
            }
        };

        var getRetValFileIndex = function(s) {
            var retLen = retVal.length;
            for(var i=0; i<retLen; i++) {
                if(retVal[i].file === s) {
                    return(i);
                }
            }
            return(-1);
        };

        var sortHits = function() {
            retVal.sort(function(obj1, obj2) {
                // Descending sort...
                return(obj2.score - obj1.score);
            });
        };

        //
        // Client side must replicate stemming that was done to create search database.
        //
        var doStem = function(w) {
            var len = w.length;
            var sBuf = "";
            var code;
            for(var i=0; i<len; i++) {
                code = w.charCodeAt(i);
                if ( ((code >= 65) && (code <= 90)) || ((code >= 97) && (code <= 122)) ) {
                    sBuf=sBuf+w.charAt(i);
                } else {
                    break;
                }
            }
            return(stemmer(sBuf.toLowerCase()));
        };




        return {
            setRootDocName : function(s) {
                rootDoc = s;
            },

            getRootDocName : function() {
                return rootDoc;
            },

            loadSearch : function(str) {
                sDat  = JSON.parse(str);
                sDat.len = sDat.searchData.length;
                console.log("SEARCH LENGTH: "+sDat.len);

                /*/////////////// BOGUS CALL TO TEST ////////////////
                this.doSearch("open copy food", "And");

                console.log("SEARCH RESLUT LENGTH: "+retVal.length);
                //*////////////////////////////
            },

            doSearch : function(wordsStr, searchType) {
                _searchTermStr = wordsStr
                _searchType = searchType;
                var s = wordsStr.replace(/^\s+|\s+$/g,'');
                if(undefined === s || "" === s) return(undefined);
                words = s.split(" ");
                __searchType = searchType;

                if(_searchType === "Or") {
                    getOrWeight();
                    mergeHits();
                } else if(_searchType === "And") {
                    getAndWeight(words);
                }

                sortHits();
                return(retVal);
            },

            undoHighlight : function() {
                var myHilightor = new Hilightor("result");
                myHilightor.remove();
                myHilightor = null;
            },

            doHighlight : function(s) {
                var myHilightor = new Hilightor("result");
                console.log("doHighlight calling myHighlightor.apply with: "+stemStringOfWords(s));
                myHilightor.apply(stemStringOfWords(s));
                myHilightor = null;
            },
            setHighlightForUrl : function(params) {
                if(params === undefined) {
                    return;
                }
                console.log("Setting Highlight for URL!!!!");
                var highlightParam = params.showHighlight;
                console.log("HIGHLIGHT PARAM IS: "+highlightParam);
                if (undefined !== highlightParam && 'true' === highlightParam) {
                    console.log("Setting Highlight for URL -- Words: "+_searchTermStr);
                    this.doHighlight(_searchTermStr);
                    console.log("DONE Setting Highlight for URL -- Words: "+_searchTermStr);
                }
            }

        };

    }
]);
