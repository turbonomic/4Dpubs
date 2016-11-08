
var setRootTopicDir = function(path){
	var toks = path.split('/');
	var len = toks.length;
	for(var i = 0; i<len; i++) {
		if(toks[i] === "..") {
			that.conf.rootTopicDir = toks[i + 1];
			console.log("SETTING ROOT TOPIC DIR TO: "+that.conf.rootTopicDir);
			return;
		}
	}
	//console.log("NOT DOTDOT ROOT TOPIC URL!!!"+ path);
	toks = path.split('/');
	if(toks.length === 2){
		that.conf.rootTopicDir = toks[0];
		console.log("SETTING ROOT TOPIC DIR TO: "+that.conf.rootTopicDir);
	} else if(toks.length > 2){
		that.conf.rootTopicDir = "";
		for(var i = 0; i<toks.length - 1; i++) {
			that.conf.rootTopicDir += toks[i];
			if(i < toks.length - 2) {
				that.conf.rootTopicDir += "/";
			}
		}
		console.warn("TOKS Length: "+toks.length);
		console.warn("PATH IS: "+path);
		console.log("SETTING ROOT TOPIC DIR TO: "+that.conf.rootTopicDir);
	}else {
		console.warn("NO VALID ROOT TOPIC DIR FOR: "+path);
		console.warn("TOKS Length: "+toks.length);
	}
};


function TopicCtrl ($scope, $rootScope, $sce, $window, $location, $q, TransformService, TocService, SearchService) {

	that = this;

	this.conf = {};
	this.help_app_spec = {};
	this.topiccontent = "";
	this.toccontent = "";
	this.searchcontent = "";
	this.xslLoc = "xsl/topicToWeb.xsl";


	$window.onload = function(e) {

		if(undefined !== that.conf.winStr && "" !== that.conf.winStr) {
			jQuery.ui.fancytree.info("SETTING LOCATION FOR UNDEFINED: "+that.conf.winStr);
			$window.location=that.conf.winStr;
		}
		jQuery.ui.fancytree.info("ONLOAD!!!! "+history.length);

		that.showDiv('toc');

		console.log("BUILDING TOC...");
		that.buildToc().then(jQuery.ui.fancytree.info("TOC BUILT!!!! "+history.length));
		console.log("LOADING SEARCH...");
		that.loadSearch().then(function(){
			jQuery.ui.fancytree.info("ARF SEARCH BUILT!!!! "+history.length);
			//SearchService.doSearch("open", "And");
		});





		//jQuery.ui.fancytree.info("TOC BUILT!!!! "+history.length);
	};

	$rootScope.$on('$locationChangeSuccess',function(event, url ) {
		jQuery.ui.fancytree.info("$locationChangeSuccess: "+url);
		that.conf = $window.conf; // Leaving open the option to load conf from an external file
		that.showTopicFromUrl(url);
		if(undefined !== that.conf.tocUrl) {
			console.log("USING TOC URL!!! "+that.conf.tocUrl);
			TocService.highlightNodeForDefaultTopic(that.conf.tocUrl);
		} else {
			console.log("USING NORMAL URL!!! "+url);
			TocService.highlightNodeForDefaultTopic(url);
		}
		jQuery.ui.fancytree.info("CHANGE SUCCESS!!!! "+history.length);
	});

	$rootScope.$on('tocResponse', function(event, response) {
		that.conf = $window.conf; // Leaving open the option to load conf from an external file
		$location.replace();
		$window.location = response.data;
	});

	this.showDiv = function(divName) {
		//
		// TO DO: Set divs to show in the parameters
		//
		var divs = ['search', 'toc'];
		for(var x=0; x<divs.length; x++) {
			jQuery('#'+divs[x]).css('display', 'none');
		}
		jQuery('#'+divName).css('display', 'block');
	};

	this.expandToc = function() {
		TocService.expandAll();
	},

		this.collapseToc = function() {
			TocService.collapseAll();
		},

		this.goBack = function() {
			history.back();
		};
	this.goForward = function() {
		history.forward();
	};
	this.showTopic = function() {
		alert(that.topiccontent);
	};
	this.showToc = function() {
		alert(that.toccontent);
	};

	this.loadSearch = function() {

		var deferred = $q.defer();

		var searchCallback = function(response) {
			//console.log("SEARCH RESPONSE!!!: "+ response.resp);
			console.log("LOADING SEARCH IN CALLBACK FROM CONTROLLER!!!");
			SearchService.loadSearch(response.resp);
			SearchService.setRootDocName(that.conf.rootDocName);
			//SearchService.initSearch(jQuery("#searchDiv"));
			//TocService.buildMainToc(response.resp,"index.html",that.rootTopicDir);
		};

		var errorCallback = function(response) {
			console.warn("ERROR TRANSFORMING SEARCH!!!\n"+response.resp.data);
			deferred.reject("FAILURE");
		};

		//console.log("LOADING SEARCH - DATA: "+that.conf.searchFile);
		//console.log("LOADING SEARCH - TRANSFORM: "+that.conf.searchTransform);

		TransformService.initTransformChain(that.conf.searchTransform, that.conf.searchFile)
			.then(TransformService.loadXslDoc)
			.then(TransformService.getTopic)
			.then(TransformService.doTransform)
			.then(searchCallback, errorCallback)
		;


		deferred.resolve("SUCESS");

		return deferred.promise;

	};

	this.buildToc = function() {

		var deferred = $q.defer();

		var tocCallback = function(response) {
			console.log("TOC CALLBACK RESPONSE: "+response.resp);
			TocService.initToc(jQuery("#tocresult"));
			TocService.buildMainToc(response.resp,"index.html",that.rootTopicDir);
		};

		var errorCallback = function(response) {
			jQuery.ui.fancytree.error("ERROR TRANSFORMING TOC!!!\n"+response.resp.data);
			deferred.reject("FAILURE");
		};

		console.log("BUILDING TOC FOR: "+that.conf.defaultMap);
		console.log("TRANSFORMING WITH: "+that.conf.mapTransform);

		TransformService.initTransformChain(that.conf.mapTransform, that.conf.defaultMap)
			.then(TransformService.loadXslDoc)
			.then(TransformService.getTopic)
			.then(TransformService.doTransform)
			.then(tocCallback, errorCallback)
		;


		deferred.resolve("SUCESS");

		return deferred.promise;
	};


	this.showTopicFromUrl = function(inUrl) {
		console.log("SHOWING TOPIC FROM URL");

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
			jQuery.ui.fancytree.info("MAPPED PATH: "+topicPath);
		} else
		if(topicPath.substring(0,6) === 'topic=') { // Old-school xref
			toks = topicPath.split('=');
			var sub = toks[1];
			var subToks = sub.split('/');
			var subLen = subToks.length;
			//console.log("TOPIC PATH TOKS LEN: "+subLen+" for topic path: "+sub);
			if(subToks[0] === '..') {
				topicPath = that.conf.rootTopicDir+"/"+sub; // This is relative to a root topic dir
				jQuery.ui.fancytree.info("OLDSCHOOL XREF PATH 1: "+topicPath);
				setRootTopicDir(topicPath);
			} else if(subToks[0] !== that.conf.rootTopicDir && subLen === 1) { // Make this relative to the root topic dir.
				topicPath = that.conf.rootTopicDir+"/"+sub;
				jQuery.ui.fancytree.info("OLDSCHOOL XREF PATH 2: "+topicPath);
			} else if(subToks[0] !== that.conf.rootTopicDir) { // Make this relative to the root topic dir.
				topicPath = that.conf.rootTopicDir+"/../"+sub;
				jQuery.ui.fancytree.info("OLDSCHOOL XREF PATH 3: "+topicPath);
			} else {
				topicPath = sub;
				jQuery.ui.fancytree.info("OLDSCHOOL XREF PATH 4: "+topicPath);
			}
		} else { // Normal URL
			console.log("NORMAL URL: "+topicPath);
			setRootTopicDir(topicPath);
		}
		jQuery.ui.fancytree.info("FINAL TOPIC PATH: "+topicPath);
		that.populateTopicContent(topicPath, that.conf.topicTransform);
	};

	this.setTocUrl = function(url) {
		var toks = url.split("../");
		for(var i=0; i<toks.length; i++) {
			console.log("TOC URL TOK: "+toks[i]);
		}
		if(toks.length > 1) {
			that.conf.tocUrl = "../"+toks[1];
		} else {
			that.conf.tocUrl = "../"+url;
		}
		//that.conf.tocUrl = "../"+url;
		console.log("SETTING TOC URL: "+that.conf.tocUrl);
	};

	this.populateTopicContent = function(xmlFilePath, xslFilePath){

		that.setTocUrl(xmlFilePath);

		var topicCallback = function(response) {
			//alert("TOPIC: "+response.resp);
			that.topiccontent = $sce.trustAsHtml(response.resp);
		};

		var errorCallback = function(response) {
			jQuery.ui.fancytree.error("ERROR TRANSFORMING FILE!!!\n"+response.resp.data);
			jQuery.ui.fancytree.error("XML FILE PATH: "+response.resp.data);
			jQuery.ui.fancytree.error("XSL FILE PATH "+response.resp.data);
		};

		TransformService.initTransformChain(xslFilePath, xmlFilePath)
			.then(TransformService.loadXslDoc)
			.then(TransformService.getTopic)
			.then(TransformService.doTransform)
			.then(topicCallback, errorCallback)
		;
	};

}


angular
	.module ('4D')
	.controller ('TopicCtrl', TopicCtrl);