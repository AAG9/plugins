var dialWidgetPlugin = function(settings, updateCallback)
{
	var self = this;
	var currentSettings = settings;
	var controlState = 0;

	var tickArray = [];
	var angle = {
		"min": 0,
		"max": 270,
		"current": 0
	}

	var sensitivity = 10;
	var minLabel = "Low";
	var maxLabel = "High";

	// Widget heading
	var $widgetHeading = $("<h4>").addClass("widget-heading").text(settings.dial_name).css("margin-bottom", "-35px");

	// Knob frame
	var $displayElement = $("<div>").addClass("knob-surround");

		var $knob = $("<div>").addClass("knob").bind('mousewheel DOMMouseScroll', function(event){

				var scrollTo = null;

			    if (event.type == 'mousewheel') {
			        scrollTo = (event.originalEvent.wheelDelta * -1);
			    }
			    else if (event.type == 'DOMMouseScroll') {
			        scrollTo = 40 * event.originalEvent.detail;
			    }

			    if (scrollTo) {
			        event.preventDefault();
			        $(this).scrollTop(scrollTo + $(this).scrollTop());
			    }

				if (event.originalEvent.wheelDelta > 0 || event.originalEvent.detail < 0) { self.moveKnob('up');} 
				else { self.moveKnob('down');}
			});
		var $minIndicator = $("<span>").addClass("min").text(minLabel).css("color","green");
		var $maxIndicator = $("<span>").addClass("max").text(maxLabel).css("color","red");
		var $ticks = $("<div>").addClass("ticks");
		for(var i = 0; i < sensitivity; i++){
			var $tick = $("<div>").addClass("tick");
			$ticks.append($tick);
			tickArray.push($tick);
		}

	$displayElement.append([$knob, $minIndicator, $maxIndicator, $ticks]);

	// Value Indicator
	var $valueIndicator = $("<h4>")
			.css({
				"margin-top": "-35px",
				"text-align": "center"
			}).text("loading...");

	self.updateSpeed = function(speed) {
		controlState = speed;
		speed = speed / 3;
		var submitPayload = {"controlState": controlState,   "deviceId": currentSettings.device_id,   "state": speed};
		if(settings.topic_name !== undefined){
			updateCallback(submitPayload, "topic_name");
		}
	}

	self.moveKnob = function(direction){
	  
	  if(direction == 'up') {
	    if((angle.current + 2) <= angle.max) {
	      angle.current += 2;
	      self.setAngle();
	    }
	  }
	  
	  else if(direction == 'down') {
	    if((angle.current - 2) >= angle.min) {
	      angle.current -= 2;
	      self.setAngle();
	    }
	  }
	}

	self.setAngle = function(supressCallback) {

		// rotate knob
		$knob.css({
			'-moz-transform':'rotate('+angle.current+'deg)',
			'-webkit-transform':'rotate('+angle.current+'deg)',
			'-o-transform':'rotate('+angle.current+'deg)',
			'-ms-transform':'rotate('+angle.current+'deg)',
			'transform':'rotate('+angle.current+'deg)'
			});

		// highlight ticks
		var activeTicks = (Math.round(angle.current / 30) + 1);
		var i = 0;
		for(i; i < activeTicks; i++){
			tickArray[i].addClass("activetick");
		}
		for(i; i < sensitivity; i++){
			tickArray[i].removeClass("activetick");
		}

		// update % value in text
		var pc = Math.round( (angle.current / angle.max) * 100);
		$valueIndicator.text(pc+'%');
		if(!supressCallback){
			self.updateSpeed(pc);
		}
	}

	self.render = function(containerElement)
	{
		$(containerElement).append([$widgetHeading, $displayElement, $valueIndicator]);
	}

	self.getHeight = function()
	{
		return 6;
	}

	self.onSettingsChanged = function(newSettings)
	{
		currentSettings = newSettings;
		$widgetHeading.text(settings.dial_name);
	}

	self.onCalculatedValueChanged = function(settingName, newValue)
	{
		if(newValue !== undefined && newValue.controlState !== undefined){
			angle.current = Math.round( (newValue.controlState / 100) * angle.max);
			self.setAngle(true);
		}	
	}

	// **onDispose()** (required) : Same as with datasource plugins.
	self.onDispose = function()
	{
	}
}

freeboard.loadWidgetPlugin({
	// Same stuff here as with datasource plugin.
	"type_name"   : "dial_widget",
	"display_name": "Dial",
    "description" : "A dial that connects to a message topic",
	// **external_scripts** : Any external scripts that should be loaded before the plugin instance is created.
	"external_scripts": [			
		"lib/js/thirdparty/dial.js"
	],
	// **fill_size** : If this is set to true, the widget will fill be allowed to fill the entire space given it, otherwise it will contain an automatic padding of around 10 pixels around it.
	"fill_size" : false,
	"settings"    : [
		{
			"name"        : "dial_name",
			"display_name": "Dial Name",
			"type"        : "text",
			"required"	  : true
		},
		{
			"name"			: "topic_name",
			"display_name"  : "Topic",
			"type"			: "calculated",
			"description"	: "Topic datasource which publishes and Subscribes to a topic"
		},
		{
			"name"			: "device_id",
			"display_name"  : "Device Id",
			"default_value"	: "dial1",
			"type"			: "text"
		}
	],
	// Same as with datasource plugin, but there is no updateCallback parameter in this case.
	newInstance   : function(settings, newInstanceCallback, updateCallback)
	{
		newInstanceCallback(new dialWidgetPlugin(settings, updateCallback));
	}
});
