/**
 * Created by kalel on 9/4/16.
 */
angular
    .module ('4D')
    .factory ('TopicService', ['$window', 'TransformService', function($window, TransformService) {


        return {
/*////////////
                showTopicFromUrl : function(inUrl, rootTopicDir, topicTransform) {
                if(undefined === inUrl || "" === inUrl) {
                    return;
                }
                var toks = inUrl.split('#');
                if(undefined === toks[1] || "" === toks[1]) {
                    return;
                }

                var topicPath = toks[1];

                if('/' === topicPath.charAt(0)) { // needed hack...
                    topicPath = topicPath.substr(1);
                }
                if('!' === topicPath.charAt(0)) { // needed hack...
                    topicPath = topicPath.substr(1);
                }
                if(topicPath.substring(0,6) === 'MAPPED') { // Look up in the list of mapped topics.
                    toks = topicPath.split('&');
                    topicPath = getMapEntry(toks[1]).topic;
                } else
                if(topicPath.substring(0,6) === 'topic=') { // Old-school xref
                    toks = topicPath.split('=');
                    var sub = toks[1];
                    var subToks = sub.split('/');
                    if(subToks[0] === '..') {
                        topicPath = rootTopicDir+"/"+sub; // This is relative to the root topic dir
                    } else if(subToks[0] !== rootTopicDir) { // Make this relative to the root topic dir.
                        topicPath = rootTopicDir+"/../"+sub;
                    } else {
                        topicPath = sub;
                    }
                }
                that.populateTopicContent(topicPath, topicTransform);
            },

            populateTopicContent : function(xmlFilePath, xslFilePath){
                var topicCallback = function(response) {
                    //alert("TOPIC: "+response.resp);
                    that.topiccontent = $sce.trustAsHtml(response.resp);
                };

                var errorCallback = function(response) {
                    alert("ERROR TRANSFORMING FILE!!!\n"+response.resp.data);
                };

                TransformService.initTransformChain(xslFilePath, xmlFilePath)
                    .then(TransformService.loadXslDoc)
                    .then(TransformService.getTopic)
                    .then(TransformService.doTransform)
                    .then(topicCallback, errorCallback)
                ;
        }
        //*/////////////

        };
    }
]);
