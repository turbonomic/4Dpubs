

var vmtMapSpec = function() {
    
    var mapVals = this;
    
    var map = {};
    


    //////////////////////////////////////// 
    // DEFAULT TOPIC
    //
    map.DEFAULT_DEDICATED = {};
    map.DEFAULT_DEDICATED.topic="_Content/4D_Intro.xml";

    
    /*//// TEMPLATE MAP ENTRY -- hash is optional //////////
    map.xx={};
    map.xx.topic="_Topics/something";
    map.xx.hash="";
    //*///
    
    var getMapTopicParams = function(itemId) {
        var ret = {};
        ret.topic = map[itemId].topic;
        ret.hash = map[itemId].hash;
        return(ret);
    };
    mapVals.getMapTopicParams = getMapTopicParams;
    
    var getMapFullTopicSpec =  function(itemId) {
        var ret = "topic="+map[itemId].topic;
        if(undefined !== map[itemId].hash) {
            ret = ret+"&hash="+map[itemId].hash;
        }
        return(ret);
    };
    mapVals.getMapFullTopicSpec = getMapFullTopicSpec;
    
    var getMapEntry = function(itemId) {
        return(map[itemId]);
    };
    mapVals.getMapEntry = getMapEntry;
    
    vmtMapSpec = function() {
        return(mapVals);
    };
    
    return(mapVals);

}