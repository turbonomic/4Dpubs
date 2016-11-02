angular
    .module ('4D')
    .factory ('ExtensionService', ['TocService', function( TocService) {

        return {

            utcConverter : function() {
                var str = 'UTC time in ms: <input type="button" value="Calculate" onclick="vmtHelpCustom.doUTC(this.parentNode)" /> ';
                str += 'dd:<input name="dd" size="1"/> mm:<input name="mm" size="1"/> yyyy:<input name="yyyy" size="2"/> ';
                return(str);
            },

            buildRefList : function(s) {
                var str = "";
                if(undefined !== s) {
                    str = str+"<p><b>"+s+":</b></p>";
                }

                var toks = window.location.href.split("#");
                var key = TocService.getCurrentNodeKey();
                if(undefined === key) {
                    return;
                    // TO DO: Post a listener, and respond after the TOC has been built???
                    // SHould the TOC be synchronous?
                    //
                    //key = TocService.guessKeyForLocation()
                    //jQuery.ui.fancytree.info("buildRefList GUESS NODE KEY: "+key);
                }
                var children = TocService.getChildrenOfNodeByKey(key);
                if(null === children || children.length === 0) {
                    return;
                }
                str = str+"<ul>";
                for(var i=0; i<children.length; i++) {
                    str = str+"<li><a href="+toks[0]+"#topic="+children[i].key+">" + children[i].title+"</a></li>";
                }
                str = str+"</ul>";
                return(str);
            }


        }

    }
]);