freeboard.loadDatasourcePlugin({
	"type_name"   : "dynamic_message_topic",
	"display_name": "Dynamic Message Topic",
	"description" : "A topic streaming payloads over a websocket",

	

	"settings"    : [
		{
			name         : "topic_name",
			display_name : "Message Topic",
			type         : "text",
			default_value: "device/tool1",
			description  : "Set your message topic"
		}
	],
	newInstance   : function(settings, newInstanceCallback, updateCallback) {
		newInstanceCallback(new dynamicMessageTopicPlugin(settings, updateCallback));
	}
});

var dynamicMessageTopicPlugin = function(settings, updateCallback)
{

	var self = this;
	var currentSettings = settings;
	var lastMessage = {};


    var connectCallback = function(err, data) {
    	if(err) {
    		console.log("Error connecting to messaging: " + JSON.stringify(data));
    	} else {
    		console.log("Connected to messaging");
    		messaging.subscribe(currentSettings.topic_name, {}, stateMessageReceived); 
    	}   
    };

    // Create a new messaging object for each topic datasource
    var messaging = cb.Messaging({"useSSL":false}, connectCallback);
    console.log("Connecting to messaging");

    var topic = currentSettings.topic_name;
    var count = 1; 
    var time  = (new Date).getTime();    
    var historyCallback = function(err, data){
    	if(err){
			alertMessage("Error retreiving last Message: " + JSON.stringify(data));
    	}else{
    		if(typeof data !== 'undefined' && data.constructor === Array && data.length > 0){
    			lastMessage = JSON.parse(data[0].message);
    		}
    		updateCallback(lastMessage);
    	}
    }

    messaging.getMessageHistory(topic, time, count, historyCallback);
	
	var stateMessageReceived = function(message) {
		var lastMessage;
		try {
			 lastMessage = JSON.parse(message);
		} catch(e) {
			lastMessage = message;
		}

	 	updateCallback(lastMessage);
	    
	}

	
	self.sendData = function(data){
		if (typeof data == "object"){
			data = JSON.stringify(data);
		}

		messaging.publish(currentSettings.topic_name, data);
		updateCallback(data);
	}
	


	self.onSettingsChanged = function(newSettings)
	{

		messaging.unsubscribe(currentSettings.topic_name);
		currentSettings = newSettings;
		messaging.subscribe(currentSettings.topic_name, {}, stateMessageReceived); 
	}


	self.updateNow = function()
	{


		lastMessage;
	}

	self.onDispose = function()
	{

		// clearInterval(refreshTimer);
		// refreshTimer = undefined;
		messaging.unsubscribe(currentSettings.topic_name, {});
	}


	// createRefreshTimer(currentSettings.refresh_time);
}




