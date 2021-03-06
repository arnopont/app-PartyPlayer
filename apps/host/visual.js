/*
 * Code contributed to the webinos project.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * (C) Copyright 2012, TNO
 *
 * Author: Daryll Rinzema
 */

//main visual engine

/**
 * The visual baseclass. Holds name and selector vars / functions. Not used directly,
 *
 *	@class Visual
 *	@example 
 *	//used for functional pattern
 *	var childClass = function(){
 *		var varName; //define private field
 *		var privateMethod = function(){}; //define private function
 *		var that = Visual('VisualFunnel', 'div#funnel'); //construct class using Visual as baseclass
 *		that.publicMethod = function(){}; //define public function
 *		return that; //return it
 *	}
 *	//calling the method is done like
 *	childClass.publicMethod();
 *	@param name string the name of the visual class
 *	@param selector string the base element the code looks for when appending extra elements
**/
var Visual = function(name, selector){
	this.name = name;
	this.selector = selector; 

	var that = {};
	
	/**
	 *	string Returns The selector
	 *
	 *	@methodOf Visual
	**/
	that.getSelector = function(){
		return selector;
	};
	/**
	 *	string Returns The name
	 *
	 *	@methodOf Visual
	**/
	that.getName = function(){
		return name;
	};
	/**
	 *	Replaces the current the selector with the given selector
	 *
	 *	@methodOf Visual
	 *	@param newSelector string the selector replacing the current selector
	**/
	that.replaceSelector = function(newSelector){
		selector = newSelector;
		return selector;
	};
	
	return that;
}

/**
 *	The class handling all the frontend css and jQuery for the funnel. Uses Visual as baseclass.
 *	See for this mechanism the Visual documentation.
 *	
 *	@example
 *	//See Visual for more in-depth example
 *	var funnelViz = visualFunnel('name', 'div#funnel');
 *	funnelViz.function(parameters);
 *	@class visualFunnel
 *	@param name the name of the visual class
 *	@param selector the base element the code looks for when appending extra elements
**/
var visualFunnel = function(name, selector){
	var funnelSize, step, allCircles;
	var that = Visual(name, selector);
	
	/**
	 *	Builds the path the DOM funnel element moves along
	 *
	 *	@private plus @function startArc 
	 *	
	 *	@private
	 *	@param selector string The DOM funnel element to animate
	 *	@param circle int The numbered circle to animate along (larger circle number is larger circle is larger radius)
	**/
	var startArc = function(selector, circle){
		//console.log("start arc");
		var r = circle*step/2;
		var arc_params = {
			center: [funnelSize/2-75,funnelSize/2-25],
			radius: r,
			start: 180,
			end: -180,
			dir: -1
		};
		//$(selector).appendTo('#funnel .funnelcircle[circle=' + circle-- + ']');
		$(selector).animate({path : new $.path.arc(arc_params)}, 5000, function(){
			//console.log("end of arc");
			funnel.switchCircle($(selector).attr('_funnelItemID'), true);
			//funnelViz.nextCircle(selector);
		});
	};
	
	/**
	 *	Builds the DOM and (background) css for the funnel. This function creates the given circles
	 *	with an even amount of whitespace between them. It also assigns the given values
	 *	to itself for future reference
	 *
	 *	@methodOf visualFunnel
	 *	@param funnel int The max width the funnel is (also uses this number for height)
	 *	@param maxCircles int The maximum number of circles the funnel will hold
	**/
	that.setupCircles = function(funnel, maxCircles){
		funnelSize = funnel;
		allCircles = maxCircles;
		step = funnelSize / maxCircles;
		$('div#funnel').css({
			width: funnelSize,
			height: funnelSize
		});
		for(var i = 0; i < allCircles; i++){
			$('<div class="funnelCircle" circle=' + (i+1) + '></div>').appendTo('div#funnel').css({
				width: ((i+1) * step),
				height: ((i+1) * step)
			});
		}
	};
	/**
	 *	Builds the DOM and css for a funnelItem. It also creates an element object holding the last circle and
	 *	the selector of the element.
	 *	When these things are build, it invokes the startArc function. The element object will be returned
	 *	for future reference
	 *
	 *  string Returns the DOM element
	 *
	 *	@methodOf visualFunnel
	 *	@param key int The ID of the funnelItem as in funnelList, used as a custom attribute at the DOM element
	 *	for future reference
	**/	
	that.renderSingle = function(key){
		var element = {};
		element.selector = 'div[_funnelItemID=' + key + ']';
		element.circle = allCircles;
		//console.log("render at: " + element.circle);
		user = pc.getUser(funnel.getFunnelListItem(key).userID);
		item = pc.getItem(funnel.getFunnelListItem(key).itemID);
		 //.userID).alias;
		//log(user.alias); 
		userCover = '<img src='+user.thumbnail+' width=40, height=40/>';
		trackCover = '<img src='+item.item.cover+' width=40, height=40/>';
		track = '"'+item.item.artist+" - "+item.item.title+'"';
		$('<div class="funnelObject" _funnelItemID=' + key + '>'+userCover+' '+trackCover+'<br>'+track+'</div>').appendTo('.funnelCircle[circle=' + element.circle + ']');
		startArc(element.selector, element.circle);
		return element;
	};
	/**
	 *	Destroys the DOM element for the given funnelItem. It also stops any animations
	 *  boolean Returns if succesful yes/no
	 *
	 *	@methodOf visualFunnel
	 *	@param selector string The selector of the DOM funnel element to look for
	**/
	that.destroySingle = function(selector){
		console.log("remove element: " +selector);
		$(selector).stop(true);
		$(selector).remove();
	};
	/**
	 *	Moves the given DOM element to the given circle
	 *	It stops any animations. It then starts the startArc function.
	 *
	 *	@methodOf visualFunnel
	 *	@param selector string The selector of the DOM funnel element to look for
	 *	@param circle int The circle to update to
	**/
	that.updateCircle = function(selector, circle){
		//console.log("stop current animation");
		$(selector).stop(true);
		//console.log("update circle to: " + circle);
		startArc(selector, circle);
	};
	/**
	 *	Updates the given DOM element to show the votes and display a blink depending on value
	 *
	 *	@methodOf visualFunnel
	 *  @param value int the total value that needs to be updated to
	 *	@param selector string The selector of the DOM funnel element to look for
	 *
	 *  @TODO build selector update
	 *  @TODO build blink
	**/	
	that.showVote = function(value, selector){
	    if(value >= 0){
	        //make green blink for selector
	        console.log(selector + " green");   
	    } else if (value < 0){
	        //make red blink for selector
	        console.log(selector + " red");   	        
	    }
	};
	
	return that;
}

/**
 *  The class updating the player frontend & css. Same build as the funnel, with Visual as baseclass
**/
var visualPlayer = function(name, selector){
	var that = Visual(name, selector);
	
	that.buildPlayer = function(){
        $(selector).html('<audio id="playback" autoplay onended="player.getSong()" controls="controls">' + 
	    '<source src="" type="audio/ogg">' +
	    '<source src="" type="audio/mpeg">' +
	    'Your browser does not support the audio element.</audio>');
	    
	    var playerSelector = '#playback';
	    return playerSelector;	    
	};
	
	that.updatePlayer = function(url, playerSelector){
	    $(playerSelector).attr('src', url);
	};
	
	that.setupButton = function(){
	    $(selector).append('<button id="setupButton">Play next track</button>');
	    $('#setupButton').bind('click', player.getSong());
    }
	
	return that;
}

//initialize the visual parts, assigning them to a var
var funnelViz = visualFunnel("VisualFunnel", 'div#funnel');
var playerViz = visualPlayer("VisualPlayer", 'div#player');
