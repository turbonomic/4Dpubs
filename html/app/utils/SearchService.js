/**
 * Created by kalel on 10/21/16.
 */

angular
    .module ('4D')
    .factory ('SearchService', ['$window', '$rootScope', 'TransformService', function($window, $rootScope, TransformService) {


        var sDat;


        var words;
        var that = this;
        var tmpVal = [];
        var retVal = [];
        var _searchType;
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
            }

        };
    }
]);
