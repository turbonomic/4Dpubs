/**
 * Created by kalel on 9/3/16.
 */
angular
    .module ('4D')
    .factory ('TocService', ['$window', '$rootScope', function($window, $rootScope) {


        var _tocTree = undefined;

        var currentNode;

        return{


            getCurrentNode : function() {
                return currentNode;
            },

            getCurrentNodeKey : function() {
                if(undefined === currentNode || null === currentNode) {
                    return undefined;
                }
                return currentNode.key;
            },

            initToc : function(div) {
                jQuery.ui.fancytree.info("INIT TOC");

                var tocResponse = function(node) {

                    currentNode = node;
                    console.log("tocResponse: "+node.key);
                    node.setExpanded();
                    //$window.location.replace("#!"+node.key.replace('../',''));
                    //*//////////
                    $rootScope.$broadcast('tocResponse', {
                        //data: $window.location.href.split('#')[0]+"#topic="+node.key
                        //data: "#!topic="+node.key
                        // "data-123".replace('data-','');
                        data: "#!"+node.key.replace('../','') // Strip leading ../
                    });
                    //*/////////////
                };

                var activatedItem = function(event, data) {
                    if(undefined === data) {
                        jQuery.ui.fancytree.error("UNDEFINED DATA TO HANDLE TOC EVENT!");
                    } else {
                        //alert("vmtHelpCustom.tocResponse("+data.node+");");
                        currentNode = data.node;
                        tocResponse(data.node);
                    }
                };

                div.fancytree(
                    {source: []}, // Make an empty tree...
                    {activate: activatedItem},
                    {minExpandLevel:1},
                    {icons: false}
                );
                _tocTree = div.fancytree("getTree");
            },

            buildMainToc : function(cleanedStr, rootDocName, topTopicDir) {
                var rootNode = _tocTree.getRootNode();
                var rootKey = rootNode.key;

                currentNode = rootNode;


                jQuery.ui.fancytree.info("buildMainToc Root Node:\n"+$window.location.href.split('#')[0]+"#topic="+rootNode.key)
                //jQuery.ui.fancytree.info(cleanedStr);

                //jQuery.ui.fancytree.info("HOME TOC:\n"+cleanedStr);

                //var vmtLinkStart = rootDocName+"#topic="+topTopicDir;
                var vmtLinkStart = rootDocName+"#!"+topTopicDir;
                var vmtLinkEnd = "";

                var theKey = "";
                var theNode;
                var itemsList = cleanedStr.split('|');
                var item = [];
                for(var i=0; i<itemsList.length; i++) {
                    item = itemsList[i].split('+');
                    if(item.length === 3) {
                        if(item[1] === "root") {
                            theKey = rootKey;
                        } else {
                            theKey = item[1];
                        }
                        theNode = _tocTree.getNodeByKey(theKey);
                        theNode.addChildren({
                            title: item[2],
                            tooltip: item[2],
                            key: item[0],
                            //key: item[0].replace('../',''),
                            isFolder: true
                        });
                    }
                }
            },

            getChildrenOfNodeByKey : function(keyStr) {
                jQuery.ui.fancytree.info("getChildrenOfNodeByKey: "+keyStr);
                var keyNode = _tocTree.getNodeByKey(keyStr);
                if(null === keyNode) {
                    return(null);
                }
                var children = keyNode.getChildren();
                return(children);
            },

            getTocNodeByKey : function(keyStr) {
                return _tocTree.getNodeByKey(keyStr);
            },

            expandAll : function() {
                _tocTree.getRootNode().visit(function(node){
                    node.setExpanded(true);
                });
            },

            collapseAll : function() {
                _tocTree.getRootNode().visit(function(node){
                    node.setExpanded(false);
                });
            },

            highlightNodeForDefaultTopic : function(url) {
                if(undefined === _tocTree) { return; }
                // First clear current selection
                _tocTree.getRootNode().visit(function(node){
                    node.setActive(false);
                    node.setSelected(false);
                });
                var keyStr = url;
                /*////////////////
                var toks = url.split('=');
                var s = toks[1];
                toks = s.split('#');
                var keyStr = toks[0];
                //*///////////////
                /*////////////////
                //
                // Temporary hack to find the node in the TOC if it's
                // for a file in a different dir.
                // TO DO: Fix XREF in the XSLT to handle multiple topic dirs.
                //
                var keyStr = this.guessKeyForLocation();
                console.log("HIGHLIGHTING NODE: "+url);
                var hackKeyStr = keyStr.substring(11,18);
                if(hackKeyStr === "_Target") {
                    var hack = keyStr.split("/");
                    keyStr = "../_Target_Configuration_Topics/"+hack[hack.length - 1];
                }
                //*//////////////////
                console.log("HIGHLIGHTING NODE: "+url);
                console.log("highlightNodeForDefaultTopic: "+keyStr);
                var node = _tocTree.getNodeByKey(keyStr);

                // Now select the current one
                if(null !== node && undefined !== node) {
                    node.makeVisible();
                    node.scrollIntoView();
                    node.setSelected();
                }
            }

        };
    }
]);