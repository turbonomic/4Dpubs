/**
 * Created by kalel on 8/30/16.
 */
(function () {
    angular.module('4D').directive('treeToc', function (TransformService) {
        return {
            restrict: 'EA',
            templateUrl: 'app/components/widgets/widgets.treeToc.html',
            scope: {
                mapContent: '@',
                mapTransform: '@',
                tocobj: '='
            },
            controller: function($scope, $sce, $attrs){
                var mapCallback = function(response) {
                    alert("TOC: "+response.resp);
                    $scope.tocobj = {content: $sce.trustAsHtml(response.resp)};
                };

                var errorCallback = function(response) {
                    alert("ERROR TRANSFORMING FILE!!!\n"+response.resp.data);
                };

                alert("TRANSFORM: "+$attrs.mapTransform+"\nMAP: "+$attrs.mapContent);
                TransformService.initTransformChain($attrs.mapTransform, $attrs.mapContent)
                    .then(TransformService.loadXslDoc)
                    .then(TransformService.getTopic)
                    .then(TransformService.doTransform)
                    .then(mapCallback, errorCallback)
                ;
            }
        };


    });
}).call(this);
