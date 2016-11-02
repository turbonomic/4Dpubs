(function () {
    angular.module('4D').directive('topicWin', function (TransformService) {
        return {
            restrict: 'EA',
            templateUrl: 'app/components/widgets/widgets.topicWin.html',
            scope: {
                contentFile: '@',
                transformFile: '@',
                type: '@',
                label: '@',
                debug: '@',
                id: '@',
                style: '@',
                contentOutput: '=',
                obj: '='
            },
            controller: function($scope, $sce, $attrs){
                //VARIABLES
                $scope.theLabel = $attrs.label;
                $scope.myId = $attrs.id;
                 var lastXsl = undefined;

                /**
                 * Set the value to the model, and show the identified element.
                 */
                $scope.showTopicWin = function() {
                    //$scope.obj = {content: $scope.getContent($attrs.contentFile, $attrs.transformFile)};
                    $scope.obj.content = $scope.getContent($attrs.contentFile, $attrs.transformFile);
                    jQuery('#topicWin-panel').show();
                    alert($scope.getContent($attrs.contentFile, $attrs.transformFile));
                    //$scope.populate();
                };

                $scope.populateTopicContent = function(content, xsl) {
                    if(content !== undefined && xsl !== undefined) {
                        lastXsl = xsl;
                        $scope.getContent(content, xsl);
                    } else {
                        $scope.getContent($attrs.contentFile, $attrs.transformFile);
                    }
                };

                $scope.xrefToTopic = function(content) {
                    if(content !== undefined && lastXsl !== undefined) {
                        $scope.getContent(content, lastXsl);
                    }
                };

                /**
                 * Call the SaxonService to get content for the model as trusted HTML.
                 * @param xmlTaskFilePath
                 * @param xslFilePath
                 * @returns {string}
                 */
                $scope.getContent = function(xmlTaskFilePath, xslFilePath) {

                    var topicCallback = function(response) {
                        $scope.obj = {content: $sce.trustAsHtml(response.resp)};
                    };

                    var errorCallback = function(response) {
                        alert("ERROR TRANSFORMING FILE!!! "+response.resp);
                    };

                    switch ($attrs.type) {
                        case "baseWin":
                            return $sce.trustAsHtml(SaxonService.transformToHtmlString(xmlTaskFilePath, xslFilePath, $attrs.debug));
                            break;
                        case "jsonString":
                        case "nonSax":

                            TransformService.initTransformChain(xslFilePath, xmlTaskFilePath)
                                .then(TransformService.loadXslDoc)
                                .then(TransformService.getTopic)
                                .then(TransformService.doTransform)
                                .then(topicCallback, errorCallback)
                            ;
                            //TransformService.transformFile(xmlTaskFilePath, xslFilePath, topicCallback, $attrs.debug);
                            break;
                        default:
                            break;
                    }
                };

                $scope.getLabel = function() {
                    return $attrs.label;
                };

                /**
                 * Hide the topic window
                 */
                $scope.closeTopicWin = function(){
                    jQuery('#topicWin-panel').hide();
                };
            }
        };
    });
}).call(this);