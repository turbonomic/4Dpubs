/**
 * Created by kalel on 10/25/16.
 */



(function () {
    angular.module('4D').directive('searchDirective', function (SearchService, TocService) {
        return {
            restrict: 'EA',
            templateUrl: 'app/components/widgets/widgets.search.html',
            scope: {
                highlightclass: '@',
                highlightsrc: '@',
                andorclass: '@',
                andorsrc: '@',
                searchterm: '@',
                searchobj: '='
            },
            controller: function($scope, $sce, $attrs){


                $scope.highlightsrc = "./assets/Doc/graphics/Icons/highlightDone.png";
                $scope.highlightclass = "highlightButtonOn";
                $scope.andorclass = "And";
                $scope.andorsrc = "./assets/Doc/graphics/Icons/find_and.png";
                $scope.searchterm = "";

                $scope.searchobj = {};

                var obj = $scope.searchobj;

                var spec = {};
                spec.terms = "open";
                spec.searchType = "And";

                var haveMatch = false;

                var vmtLiStart = "<li class=\"SearchList\"><a href = \""+SearchService.getRootDocName()+"#topic=";
                var vmtLiStartHttp = "<li class=\"SearchList\"><a href = \"#topic=";
                var vmtLiEnd = "</a></li>";

                $scope.setAndOr = function(event) {
                    event.preventDefault();

                    if($scope.andorclass === "Or") {
                        $scope.andorclass = "And";
                        //alert("Changed class to " + $scope.class);
                        $scope.andorsrc = "./assets/Doc/graphics/Icons/find_and.png";
                    } else if($scope.andorclass === "And") {
                        $scope.andorclass = "Or";
                        //alert("Changed class to " + $scope.class);
                        $scope.andorsrc = "./assets/Doc/graphics/Icons/find_or.png";
                    } else {
                        $scope.andorclass = "And";
                        //alert("Initialized class to " + $scope.class);
                        $scope.andorsrc = "./assets/Doc/graphics/Icons/find_and.png";
                    }

                    var boolButton = document.getElementById("andOrButton");
                };

                $scope.doHighlight = function(event) {
                    event.preventDefault();

                    if($scope.highlightclass === "highlightButtonOn") {
                        $scope.highlightclass = "highlightButtonOff";
                        $scope.highlightsrc = "./assets/Doc/graphics/Icons/highlightToDo.png";
                        SearchService.undoHighlight();
                    } else if($scope.highlightclass === "highlightButtonOff") {
                        $scope.highlightclass = "highlightButtonOn";
                        $scope.highlightsrc = "./assets/Doc/graphics/Icons/highlightDone.png";
                        SearchService.doHighlight($scope.searchterm);
                    }

                };

                $scope.callSearch = function(event) {
                    event.preventDefault();

                    spec.terms = $scope.searchterm;

                    console.log("SPEC Term: "+spec.terms);

                    var x = SearchService.doSearch(spec.terms, spec.searchType);
                    var len = x.length;
                    console.log("SEARCH RESULT LENGTH: "+len);

                    var out = "";
                    if(undefined === len || len < 1 ) {
                        console.log("Search lengeth is zero");
                        out = '<i>No matches found for</i> \"'+spec.terms+'\".';
                    } else {
                        out = '<ul>';
                        for(var i=0; i<len; i++) {
                            var node = TocService.getTocNodeByKey('../'+x[i].file);
                            if(null !== node) { // Map to role-based TOC...
                                if(x[i].file.substr(0, 4) === "http") {
                                    //out = out+vmtLiStartHttp+x[i].file+"&isSearch=1\">"+x[i].name+vmtLiEnd;
                                    out = out+vmtLiStartHttp+x[i].file+"?showHighlight=true\">"+x[i].name+vmtLiEnd;
                                } else {
                                    //out = out+vmtLiStart+x[i].file+"&isSearch=1\">"+x[i].name+vmtLiEnd;
                                    out = out+vmtLiStart+x[i].file+"?showHighlight=true\">"+x[i].name+vmtLiEnd;
                                }
                                haveMatch = true;
                            }
                        }
                        out = out+"</ul>";
                        if(false == haveMatch) {
                            console.log("Search gor zero matching nodes from TOC");
                            out = '<i>No matches found for</i> \"'+spec.terms+'\".';
                        }
                    }
                    obj.content = $sce.trustAsHtml(out);

                };


            }
        };

    });
}).call(this);
