
angular
    .module ('4D')
    .factory ('TransformService', ['$http', '$q', 'ConrefService', function($http, $q, ConrefService) {

        const DITA_ADDWORKLOAD_WALKTHROUGH_PATH = "tasks/addworkload_plan.xml";
        const DITA_RECONFIGURE_WALKTHROUGH_PATH = "tasks/reconfigure_plan.xml";
        const DITA_DECOMMISSION_WALKTHROUGH_PATH = "tasks/decomission_plan.xml";
        const DITA_MIGRATION_WALKTHROUGH_PATH = "tasks/migration_plan.xml";


        const _baseUrl = "assets/Doc/"; // To Do: Put into a config file
        const _walkthroughXsl = "xsl/walkthroughBasic.xsl";

        /**
         * Cache of XSLT files -- don't hit the server if we have a file in the cache
         * @type {{}}
         * @private
         */
        var _xslList = {};

        /**
         * A global array to store paramaters to pass to the transform file.
         * Each item is an obj... {name: foo, val: bar }
         * This begins undefined, and after each transformation it will be reser to
         * undefined.  In that way, the default transform uses no params.
         * @type {{}}
         */

        /**
         * Test for IE...  If it has ActiveX then it's IE.
         * @type {boolean}
         */
        var hasActiveX = false;
        if (Object.hasOwnProperty.call(window, "ActiveXObject") || window.ActiveXObject) {
            hasActiveX = true;
        }

        /**
         * Test for IE version before 10
         * @type {boolean}
         */
        var isLessThan10 = false;
        if(document.all && !window.atob) {
            isLessThan10 = true;
        }

        /**
         * Get a string version of a DOM node.  Uses the browser.
         * @param xmlNode
         * @returns {*}
         */
        var xml2Str = function(xmlNode) {
            try { // Gecko-based browsers, Safari, Opera.
                return (new XMLSerializer()).serializeToString(xmlNode);
            }
            catch (e) {
                try { // Internet Explorer.
                    return xmlNode.xml;
                }
                catch (e) {//Strange Browser ??
                    alert('Xmlserializer not supported');
                }
            }
            return false;
        };


        /**
         * Call the appropriate XSLT Transform for the given browser. Then return the result as a string.
         * @param xml
         * @param xsl
         * @returns {string}
         */
        var runTransform = function(xml, xsl, topicPath, shortFilename, relTopicStr, xmlDocName, xslDoc, transformParams) {
            var ret;
            // code for IE
            if (hasActiveX)
            {
                //alert("IE!!!");
                var ex = processXmlMS(xml, xsl, topicPath, shortFilename, relTopicStr, xmlDocName, xslDoc, transformParams);
                ret = ConrefService.processConrefs(resultDocument, topicPath, xsl, false, xslDoc, isLessThan10); // true for is MS IE...
                //var retNodeText = refResolver.doConRefs(ex, in_xmlDocStr, xsl, true, xslDoc, isLessThan10); // true for is MS IE...
                //func(retNodeText);
                //ret = ex;
            }

            // code for Mozilla, Firefox, Opera, etc.
            else if (document.implementation && document.implementation.createDocument)
            {
                var resultDocument = processXmlMoz(xml, xsl, "", "", "", transformParams);
                //
                // Process CONREFs...
                //
                ret = ConrefService.processConrefs(resultDocument, topicPath, xsl, false);
            }
            return xml2Str(ret);
        };


        /**
         * Run XSLT through a mozilla browser.
         * @param xmlDoc Doc object for the XML to transform
         * @param xsl Doc object for the XSLT stylesheet
         * @param topicPath Optional Property String for the path to the xml file
         * @param shortFilename Optional Property  String for a property to set in the transform
         * @param relTopicStr Optional Property String for a property to set in the trans
         * @returns {DocumentFragment}
         */
        var processXmlMoz = function(xmlDoc, xsl, topicPath, shortFilename, relTopicStr, transformParams) {
            var xsltProcessor = new XSLTProcessor();
            var paramsList = transformParams;
            xsltProcessor.importStylesheet(xsl);

            if(undefined === transformParams || transformParams.length < 1) {
                paramsList = [];
            }

            // Set some passed params if they exist...
            if(undefined !== topicPath && "" !== topicPath)
                paramsList.push({name: "topicPath", val: topicPath});
            if(undefined !== shortFilename && "" !== shortFilename)
                paramsList.push({name: "shortFilename", val: shortFilename});
            if(undefined !== relTopicStr && "" !== relTopicStr)
                paramsList.push({name: "topicNameParam", val: relTopicStr});

            if(undefined !== paramsList && paramsList.length > 0) {
                for(var i=0; i < paramsList.length; i++) {
                    console.log("Setting xsl param "+paramsList[i].name +":"+ paramsList[i].val);
                    xsltProcessor.setParameter(null, paramsList[i].name, paramsList[i].val);
                }
            }


            /*///////////// There were globals in the old VMTHelp.
             if(undefined !== that.dv_val && "" !== that.dv_val)
             xsltProcessor.setParameter(null, "dv_vals", that.dv_val);
             if(undefined !== that.dv_attr && "" !== that.dv_attr)
             xsltProcessor.setParameter(null, "dv_attr", that.dv_attr);
             if(undefined !== spec.rootDocName && "" !== spec.rootDocName)
             xsltProcessor.setParameter(null, "rootHtmlDoc", spec.rootDocName);
             //*////////////

            var ret = xsltProcessor.transformToFragment(xmlDoc, document);
            return(ret);
        };

        /**
         * Run XSLT through an IE browser.  Checks for versions less than v10, and treats them
         * differently...  Passes paths to xml and xslt rather than passing nodes.
         * @param xmlDoc Doc object for the XML to transform
         * @param xsl Doc object for the XSLT stylesheet
         * @param topicPath Optional Property String for the path to the xml file
         * @param shortFilename Optional Property  String for a property to set in the transform
         * @param relTopicStr Optional Property String for a property to set in the transform
         * @param xmlDocName String for the XML doc, to use in pre-10 IE
         * @param xslDocName String for the XSLT to use in pre-10 IE
         * @returns {DocumentFragment}
         */
        var processXmlMS = function(xmlDoc, xsl, topicPath, shortFilename, relTopicStr, xmlDocName, xslDocName, transformParams) {
            var paramsList = transformParams;
            var objSrcTree = new ActiveXObject('MSXML2.FreeThreadedDOMDocument.6.0');
            objSrcTree.async = false;
            objSrcTree.setProperty("ProhibitDTD", false);
            objSrcTree.setProperty("AllowXsltScript", true);
            objSrcTree.validateOnParse=false;
            if(isLessThan10) { // Cannot pass DOM - must pass filename for IE lower than v10
                objSrcTree.load(xmlDocName);
            } else {
                objSrcTree.load(xmlDoc);
            }
            if (objSrcTree.parseError.errorCode != 0) {
                var myErr = objSrcTree.parseError;
                alert("Error loading XML file: "+shortFilename+":\n" + myErr.reason);
            }

            var objXSLT=new ActiveXObject('MSXML2.FreeThreadedDOMDocument.6.0');
            objXSLT.async = false;
            objSrcTree.setProperty("ProhibitDTD", false);
            objXSLT.setProperty("AllowXsltScript", true);
            objXSLT.validateOnParse=false;
            if(isLessThan10) { // Cannot pass DOM - must pass filename
                objXSLT.load(xslDocName);
            } else {
                objXSLT.load(xsl);
            }
            if (objXSLT.parseError.errorCode != 0) {
                var myErr = objXSLT.parseError;
                alert("Error loading XSLT file: " +xsl+":\n" + myErr.reason);
            }

            var xslMachine = new ActiveXObject("Msxml2.XSLTemplate.6.0");
            xslMachine.stylesheet = objXSLT;
            var xslproc = xslMachine.createProcessor();
            xslproc.input = objSrcTree;


            if(undefined === transformParams || transformParams.length < 1) {
                paramsList = [];
            }
            // Set some passed params if they exist...
            if(undefined !== topicPath && "" !== topicPath)
                paramsList.push({name: "topicPath", val: topicPath});
            if(undefined !== shortFilename && "" !== shortFilename)
                paramsList.push({name: "shortFilename", val: shortFilename});
            if(undefined !== relTopicStr && "" !== relTopicStr)
                paramsList.push({name: "topicNameParam", val: relTopicStr});

            if(undefined !== paramsList && paramsList.length > 0) {
                for(var i=0; i < paramsList.length; i++) {
                    console.log("Setting xsl param "+paramsList[i].name +":"+ paramsList[i].val);
                    xsltProcessor.setParameter(null, paramsList[i].name, paramsList[i].val);
                }
            }

            /*/////////// There were globals in the old VMTHelp.
             if(undefined !== that.dv_val && "" !== that.dv_val)
             xslproc.addParameter("dv_vals", that.dv_val);
             if(undefined !== that.dv_attr && "" !== that.dv_attr)
             xslproc.addParameter("dv_attr", that.dv_attr);
             if(undefined !== spec.rootDocName && "" !== spec.rootDocName)
             xslproc.addParameter("rootHtmlDoc", spec.rootDocName);
             //*///////////

            xslproc.transform();
            return(xslproc.output);
        };


        var getLastPathTok = function(s) {
            var toks = s.split('/');
            var len = toks.length;
            var ret = "";
            for(var i=0; i<len-1; i++) {
                ret = toks[i]+'/';
            }
            return(ret);
        };

        var getShortFilename = function(s) {
            var toks = s.split('/');
            var len = toks.length;
            var ret = "";
            for(var i=0; i<len; i++) {
                ret = toks[i]+'/';
            }
            return(ret);
        };


        /**
         * Debug Purposes -- To Remove...
         * @param obj
         */
        var inspectObject = function (obj) {
            var str = "";
            for(var k in obj)
                //if (obj.hasOwnProperty(k)) //omit this test if you want to see built-in properties
                str +="PROPERTY: " + k + " = " + obj[k] + "\n\n";
            alert("INSPECTING OBJECT: \n"+str);
        };


        return{

            inspectObj : function(object) {
                inspectObject(object);
            },

            /**
             * Set up a returnObj that can be passed through the promise chain.
             * @param xslPath
             * @param xmlPath
             */
            initTransformChain : function (xslPath, xmlPath, transformParams) {
                var deferred = $q.defer();
                var returnObj = {};
                returnObj.resp = "initTransformChain: ";
                returnObj.params = {};
                returnObj.params.xslPath = _baseUrl + xslPath;
                returnObj.params.xmlPath = _baseUrl + xmlPath;
                returnObj.params.topicParent = getLastPathTok(xmlPath);
                returnObj.params.shortFilename = getShortFilename(xmlPath);
                returnObj.params.relTopicStr = getLastPathTok(xmlPath);
                returnObj.params.transformParams = transformParams;

                deferred.resolve(returnObj);

                return deferred.promise;
            },
            /**
             * Get an an XSLT file to use in a promise chain that transforms an XML file. The
             * params object must incude the paths to the XSLT file and the XML file.
             * @param res Object with params and resp properties. The params prop is any set of
             * params that need to be ferried along the promise chain.  The response prop is the
             * native promise response (what $http would give you, for example).
             * @returns {*}
             */
            loadXslDoc : function(res) {
                var deferred = $q.defer();
                var returnObj = {};
                returnObj.resp = "LoadXslDoc: ";
                returnObj.params = res.params;

                var xslError = function(response) {
                    returnObj.resp = res.resp+response.data;
                    $q.reject(returnObj);
                    console.log("ERROR GETTING XSLT FILE: "+returnObj.resp);
                    console.log("XSLT FILE PATH: "+res.params.xslPath);
                    deferred.reject(returnObj);
                };
                //If the stylesheet is not already cached, put the GET result into the cache.
                //@param result
                var cacheXsl = function(result) {
                    _xslList[res.params.xslPath] = jQuery.parseXML(result.data);
                    returnObj.res = _xslList[res.params.xslPath];
                    deferred.resolve(returnObj);
                };

                if(undefined !== _xslList[res.params.xslPath]) { // Just use the cache...
                    returnObj.res = _xslList[res.params.xslPath];
                    deferred.resolve(returnObj);
                } else {
                    $http({
                        method: 'GET',
                        url: res.params.xslPath
                    }).then(cacheXsl,xslError);
                }
                return deferred.promise;
            },

            /**
             * A simple wrapper to chain into a transform process.
             * @param res
             * @returns {*}
             */
            getTopic : function(res) {
                var deferred = $q.defer();
                var returnObj = {};
                returnObj.params = res.params;
                returnObj.resp = "getTopic: ";

                var xmlError = function(response) {
                    returnObj.resp = res.resp+response;
                    $q.reject(returnObj);
                    console.log("ERROR GETTING TOPIC FILE: "+returnObj.resp);
                    console.log("TOPIC FILE PATH: "+res.params.xmlPath);
                    deferred.reject(returnObj);
                };

                var setRespObj = function(result) {
                    returnObj.resp = result;
                    deferred.resolve(returnObj);
                };

                $http({method: 'GET', url: res.params.xmlPath}).then(setRespObj, xmlError);
                return deferred.promise;
            },

            /**
             * Wrapper to call the transform process.  The promise returns the transformed data
             * as a string...  Usually either HTML or JSON.
             * @param res
             * @returns {deferred.promise|{then}}
             */
            doTransform : function(res) {
                var deferred = $q.defer();
                var returnObj = {};
                returnObj.params = res.params;

                // xml, xsl, topicPath, shortFilename, relTopicStr, xmlDocName, xslDoc
                returnObj.resp = runTransform(jQuery.parseXML(res.resp.data),
                    _xslList[res.params.xslPath],
                    res.params.topicParent,
                    res.params.shortFilename,
                    res.params.relTopicStr, "", "",
                    res.params.transformParams);
                deferred.resolve(returnObj);
                return(deferred.promise);
            },

            /**
             * Transform the identified XML via the identified XSLT stylesheet.
             * Ultimately passes the transform through the given callback.
             * @param content
             * @param xsl
             * @param callback
             */
            transformFile : function(content, xsl, callback, transformParams) {
                xmlFile = null;
                xslPath = _baseUrl + xsl;
                xmlPath = _baseUrl + content;

                var superDeferred = $q.defer();

                var errorCallback = function(response) {
                    console.error("transformFile: ERROR TRANSFORMING FILE!!!");
                };
                //
                // Perform the transform in a promise chain.
                //
                //*///////////////
                this.initTransformChain(xsl, content, transformParams)
                    .then(this.loadXslDoc, errorCallback)
                    .then(this.getTopic, errorCallback)
                    .then(this.doTransform, errorCallback)
                    .then(callback, errorCallback)
                ;

                superDeferred.resolve("success");
                return(superDeferred.promise);
                //*////////////
            },


            getWalkthroughXsl: function() {
                return _walkthroughXsl;
            },

            getBaseUrl : function() {
                return _baseUrl;
            }
        };
    }

    ]);
