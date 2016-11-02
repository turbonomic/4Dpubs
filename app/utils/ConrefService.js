angular
    .module ('4D')
    .factory ('ConrefService', ['$http', '$q', 'ExtensionService', 'ConfigService',
        function($http, $q, ExtensionService, ConfigService) {
            const _baseUrl = "../assets/Doc/"; // To Do: Put into a config file

            /**
             * Flag to handle IE differently
             * @type {boolean}
             */
            var isMsExplorer = false;

            var getPathOnly = function(s) {
                var toks = s.split('/');
                var len = toks.length;
                var ret = "";
                for(var i=0; i<len-1; i++) {
                    ret = ret+toks[i]+"/";
                }
                return(ret);
            };

            /**
             * Cache of conref files, with its oen calls to load and get a file.
             * @type {{curFile: undefined, list: Array, getFile: conrefFiles.getFile, loadXMLDocForConref: conrefFiles.loadXMLDocForConref}}
             */
            var conrefFiles = {
                curFile : undefined,
                list : new Array(),
                getFile : function(fname) {
                    this.curFile = this.list[fname];
                    if(undefined === this.curFile) {
                        this.loadXMLDocForConref(fname);
                    }
                },
                //
                // Asynchronously load the data file.
                //
                loadXMLDocForConref : function(dname) {
                    var that = this;

                    jQuery.ajax({
                        url: dname,
                        success: function (result) {
                            that.list[dname] = result;
                            that.curFile = that.list[dname];
                            if(undefined === that.curFile) {
                                alert("CURFIlE FAIlED...");
                            }
                        },
                        async: false
                    });
                }
            };

            /**
             * Some conrefs don't have a filename in them. This adds in a filename based on the parent reference.
             * @param node
             * @param parentRef
             */
            var resolveConrefAttrs = function(node, parentRef) {
                if(undefined === node || null === node) return;
                //var cRefList = node.querySelectorAll('[conref]');
                var cRefList = getNodeElemsByAttr(node,'conref');
                var listLen = cRefList.length;
                var i;
                var currentElem;
                var currRef;
                var refToks;
                var refFile, hash;

                for(i=0; i<listLen; i++) {
                    currentElem = cRefList[i];
                    currRef = currentElem.getAttribute("conref");
                    refToks = currRef.split('#');
                    refFile = refToks[0];
                    hash = refToks[1];
                    if(null === refFile || '' === refFile) {
                        currentElem.setAttribute("conref", parentRef+"#"+hash);
                    }
                }
            };

            /**
             * Recursively walk the dom tree
             *
             * @param node
             * @param func
             */
            var walk_the_DOM = function walk(node, func) {
                func(node);
                node = node.firstChild;
                while(node) {
                    walk(node, func);
                    node = node.nextSibling;
                }
            };

            /**
             * Walk the dom to convert it into a string. Use func1 and func2 to
             * create the opening and closing parts of each node string.
             * @param node
             * @param func1
             * @param func2
             */
            var walk_the_DOM_Serialize = function walk(node, func1, func2) {
                var nodeName = undefined;
                if(node.nodeType === 1) {
                    nodeName = node.nodeName;
                } else {
                    nodeName = undefined;
                }
                func1(node);
                node = node.firstChild;
                while(node) {
                    walk(node, func1, func2);
                    node = node.nextSibling;
                }
                func2(nodeName);
            };

            /**
             * Walk the dom starting from node, and get a list of elems of a given name.
             * @param node
             * @param elemName
             * @returns {Array}
             */
            var getNodeElems = function(node, elemName) {
                var results = [];
                var getElem = function(node) {
                    if(node.nodeType === 1 && node.nodeName.toUpperCase() === elemName.toUpperCase())
                        results.push(node);
                };
                walk_the_DOM(node, getElem);
                return(results);
            };

            /**
             * When serializing a node, convert the tree to text. Calls walk_the_DOM_Serialize...
             * @param node
             * @returns {string}
             */
            var nodeToMarkupText = function(node) {
                var ret = "";
                var i;
                var len;
                var openElem = function(node) {
                    switch(node.nodeType) {
                        case 1:
                            ret = ret+'<'+node.nodeName;
                            for (i=0, attrs=node.attributes, len=attrs.length; i<len; i++){
                                ret = ret+' '+attrs.item(i).nodeName+'="'+attrs.item(i).nodeValue+'"';
                            }
                            ret = ret+'>';
                            break;
                        case 3:
                            ret=ret+node.nodeValue;
                            break;
                        case 4:
                            ret=ret+'<![CDATA['+node.nodeValue+']]';
                            break;
                        case 5:
                            ret=ret+node.nodeName;
                            break;
                        case 6:
                            ret=ret+node.nodeName;
                            break;
                        case 12:
                            ret=ret+node.nodeName;
                            break;
                        default:
                            break;
                    }
                };
                var closeElem = function(nodeName) {
                    if(undefined !== nodeName) {
                        ret = ret+'</'+nodeName+'>';
                    }
                };
                walk_the_DOM_Serialize(node, openElem, closeElem);
                return(ret);
            };

            /**
             * Return an array of nodes with the given attr/val
             * @param node
             * @param attr
             * @param val
             * @returns {Array}
             */
            var getNodeElemsByAttr = function(node, attr, val) {
                var results = [];
                var getElem = function(node) {
                    var act = node.nodeType === 1 && node.getAttribute(attr);
                    if(typeof act === 'string' && (act === val || typeof val !== 'string'))
                        results.push(node);
                };
                walk_the_DOM(node, getElem);
                return(results);
            };

            /**
             * Actually perform the conref expansion.
             * Gets a list of conrefs in the node, and expands them. Then tries to get get the list
             * again.  If there are nested conrefs, the list will have a len, otherwise return.
             * @param node
             * @param topicFullPath
             * @param xslDoc
             * @param isMsExplorer
             * @param xslDocName
             * @returns {*}
             */
            var innerDoConRefs = function(node, topicFullPath, xslDoc, isMsExplorer, xslDocName) {
                var i=0;
                var currentElem;
                var cRefList;
                var listLen = 0;
                var count = 0;

                cRefList = getNodeElems(node,'conrefwrapper');

                listLen = cRefList.length;
                while(listLen && listLen > 0) {
                    for(i=0; i<listLen; i++) {
                        currentElem = cRefList[i];
                        if(null === currentElem) {
                            console.log("NULL CURRENT ELEM");
                            return(node);
                        }
                        var frag = getConrefContent(currentElem.getAttribute("reference"), topicFullPath, xslDoc, xslDocName);
                        if(null !== frag && null !== currentElem.parentNode) {
                            var parent = currentElem.parentNode;
                            parent.replaceChild(frag, currentElem);
                        } else {
                            return(node);
                        }
                    }
                    listLen = 0;
                    cRefList = getNodeElems(node,'conrefwrapper');
                    listLen = cRefList.length;
                    count++;
                    if (count === 100) {
                        console.log("COUNT EXCEEDED!!!!!!!!!!");
                        return(node);
                    }
                }
                return(node);
            };

            /**
             * Get the content from a single conref. Either execute a function from the
             * ExtensionService, or get the conref data file and then get the conref fragment from that.
             * @param ref
             * @param topicFullPath
             * @param xslDoc
             * @param xslDocName
             * @returns {null}
             */
            var getConrefContent = function(ref, topicFullPath, xslDoc, xslDocName) {

                //
                // Used for JS conrefs...
                //
                var makeFragFromString = function(str) {
                    var frag = document.createDocumentFragment();
                    var retElem = document.createElement('span');
                    retElem.innerHTML = str;
                    frag.appendChild(retElem);
                    return(frag);
                };

                //
                // Test for Javascript Function magic conref...
                //
                if(-1 !== ref.indexOf("jsFunction")) {
                    var div = document.createElement("div");
                    var fParams = ref.split(":");
                    var pLen = fParams.length;
                    if(0 === pLen) return(null);
                    var arg = '';
                    if(3 === pLen) {
                        arg = fParams[2];
                    }
                    var funcName = fParams[1];
                    console.log("FUNCTION: "+funcName);
                    var reply = ExtensionService[funcName](arg);
                    if(reply) {
                        return(makeFragFromString(reply));
                    }
                    return(null);
                }

                var refToks = ref.split('#');
                var refFile = refToks[0];
                if(null === refFile || '' === refFile) {
                    alert("NO FILE IN CONREF: "+ref);
                    return(null);
                }
                var refHash = refToks[1];
                //
                // Open the file... Append the base url so we can get to the correct file.
                conrefFiles.getFile(_baseUrl+topicFullPath+refFile);

                var refDoc = conrefFiles.curFile;
                if(undefined === refDoc || null === refDoc) {
                    console.log("NULL REPLY FROM loadXMLDocForConref! "+_baseUrl+refFile);
                    return(null);
                }
                return(getConrefFragmentFromDoc(refDoc, refHash, xslDoc, refFile, xslDocName));
            };

            /**
             * For a given conref data file and an ID, get and transform the actual conref fragment.
             * @param xmlDoc
             * @param idStr
             * @param xslDoc
             * @param parentRefFile
             * @param xslDocName
             * @returns {*}
             */
            var getConrefFragmentFromDoc = function(xmlDoc, idStr, xslDoc, parentRefFile, xslDocName) {
                if(null === xmlDoc) {
                    return(null);
                }
                var idToks = idStr.split('/');
                var tLen = idToks.length;
                var conrefFrag = xmlDoc;
                var fragArray;
                if(null === conrefFrag) {
                    return(null);
                }
                for(var i=0; i<tLen; i++) { // Loop down to the last ref id...
                    if(undefined === conrefFrag || null === conrefFrag) {
                        break;
                    }
                    fragArray = getNodeElemsByAttr(conrefFrag, 'id', idToks[i]);
                    conrefFrag = fragArray[0];
                }
                //
                // Before transforming this, need to check all conref attrs for a filename in the reference.
                // If no filename, add the parent filename...
                //
                resolveConrefAttrs(conrefFrag, parentRefFile);
                //
                // Now transform this to HTML...
                //
                if (isMsExplorer) {
                    var input = nodeToMarkupText(conrefFrag);
                    var ex = VMT_Help_App.processXmlStringMS(input, xslDoc, "", "", "", xslDocName);
                    var frag = document.createDocumentFragment();
                    var retElem = document.createElement('span');
                    retElem.innerHTML = ex;
                    frag.appendChild(retElem);
                    return(frag);
                } else {
                    var xsltProcessor=new XSLTProcessor();
                    xsltProcessor.importStylesheet(xslDoc);
                    var resultDocument = xsltProcessor.transformToFragment(conrefFrag,document);
                    return(resultDocument);
                }
            };

            return {

                /**
                 * Wrapper to call the whole process.
                 * @param node
                 * @param topicFillPath
                 * @param xslDoc
                 * @param fromMsExplorer
                 * @param xslDocName
                 * @returns {*}
                 */
                processConrefs : function(node, topicFillPath, xslDoc, fromMsExplorer, xslDocName) {

                    isMsExplorer = fromMsExplorer;

                    var nodeToPass;
                    if(isMsExplorer) { // TO DO: Convert MS node into text...
                        nodeToPass = document.createDocumentFragment();
                        var retElem = document.createElement('div');
                        retElem.innerHTML = node;
                        nodeToPass.appendChild(retElem);
                    } else {
                        nodeToPass = node;
                    }
                    var result = innerDoConRefs(nodeToPass, topicFillPath, xslDoc, isMsExplorer, xslDocName);
                    if(isMsExplorer) {
                        // Must return a string with the node changes...
                        return nodeToMarkupText(result);
                    } else {
                        return result;
                    }
                }

            };
        }
    ]);