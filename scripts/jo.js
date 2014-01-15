(function( window, undefined ){

	var Joot;

	var Jo = function( selector, context, Joot ){
		return new Jo.fn.init(selector, context, Joot);
	};

	Jo.fn = Jo.prototype = {
		Jo: "0.1",
		constructor: Jo,
		init: function( selector, context ){

			if( !selector ) return this;

			if( isFunction(selector) ){

				var oldOnLoad = window.onload;

				window.onload = function(){
					
					if( isFunction(oldOnLoad) ) oldOnLoad();

					selector.call(this, Jo);

				};
				
			};

			this.selector = selector;
			this.nodes = new Array();

			if( isString(selector) ){

				this.nodes = getNodes(selector);
			
			}
			else if( isObject(selector) ){

				this.nodes = [selector];

			};

			return this;

		},
		find: function( selector ){

			var newNodes = new Array();

			this.each(function(){

				newNodes = newNodes.concat(getNodes(selector, this));
	
			});

			this.nodes = newNodes;

			return this;

		},
		item: function( number ){

			if( number <= this.nodes.length ){

				return Jo(this.nodes[number]);

			}
			else {

				return this;

			};

		},
		each: function( fn ){

			for( var key = 0; key < this.nodes.length; key++ ){

				fn.call(this.nodes[key], key);

			};
			
			return this;

		},
		on: function( action, fn, useCapture ){

			if( isEmpty(useCapture) ) useCapture = false;

			this.each(function(){

				if( isEmpty(this.events) ) this.events = new Object();

				this.events[action] = {
					evt: action,
					fn: fn
				};

				if( !isFunction(Jo.specialEvents[action]) && !Jo.support.events(action) ){

					var customEvent = new CustomEvent(action, {
						detail: {},
						bubbles: true,
						cancelable: true
					});

					this.events[action].evt = customEvent;

					window.addEventListener ? this.addEventListener(action, fn, useCapture) : this.attachEvent(action, fn, useCapture);

				}
				else if( isFunction(Jo.specialEvents[action]) && !Jo.support.events(action) ){

					var specialEvent = Jo.specialEvents[action].call(this, fn);

					this.events[action].evt = specialEvent.action;

					action = specialEvent.action;
					fn = specialEvent.fn;


					window.addEventListener ? this.addEventListener(action, fn, useCapture) : this.attachEvent("on" + action, fn, useCapture);

				}
				else {

					window.addEventListener ? this.addEventListener(action, fn, useCapture) : this.attachEvent("on" + action, fn, useCapture);
	
				};

			});

			return this;

		},
		off: function( action, fn, useCapture ){

			if( isEmpty(useCapture) ) useCapture = false;

			this.each(function(){

				if( !isEmpty(this.events[action]) ){
	
					window.removeEventListener ? this.removeEventListener(this.events[action].evt, fn, useCapture) : this.detachEvent("on" + action, this.events[action], useCapture);
					delete this.events[action];

				};

			});

			return this;

		},
		trigger: function( action ){

			this.each(function(){

				if( !isEmpty(this.events[action]) ){

					if( !isFunction(Jo.specialEvents[action]) && !Jo.support.events(action) ){

						this.dispatchEvent(this.events[action].evt);

					}
					else {

						this.events[action].fn.call(this, event);

					};

				};

			});

			return this;

		},
		attr: function( name, value ){


			if( isString(name) ){

				if( !isEmpty(value) ){

					this.each(function(){

						this.setAttribute(name, value);
						
					});

				}
				else {

					return this.nodes[0].style[name];

				};

			}
			else if( isObject(name) ){

			};

			return this;

		},
		css: function( name, value ){

			if( isString(name) ){

				if( !isEmpty(value) ){

					this.each(function(){

						this.style[name] = value;

					});

				}
				else {

					return this.nodes[0].style[name];

				};

			}
			else if( isObject(name) ){

				this.each(function(){

					for( var parameter in name ) this.style[parameter] = name[parameter];

				});

			};

			return this;

		},
		is: function( selector ){

			var returned = isEmpty(selector) ? false : true;

			selector = prepareSelector(selector).replace(/([#\.:\[])([^#\.:\[]+)/ig, function(all, type, curiosity){

				if( type === "." && curiosity.match(/\]$/ig) ){

					return all;

				};

				return "|" + all;

			}).split("|");

			this.each(function(){

				for( var key in selector ){

					// is tag
					if( selector[key].match(/^\w/i) ){

						if( selector[key].toLowerCase() !== this.tagName.toLowerCase() ) returned = false;

					}
					// is id
					else if( selector[key].match(/^#/) ){

						if( selector[key].substring(1) !== this.id ) returned = false;

					}
					// is class
					else if( selector[key].match(/^\./) ){

						if( this.classList.contains(selector[key].substring(1)) === false ) returned = false;

					}
					// is attr
					else if( selector[key].match(/^\[/) ){

						var attribute = selector[key].substring(1).slice(0,-1).split("=");

						if( !isEmpty(attribute[1]) ){

							attribute[1] = attribute[1].replace(/^[\"\']/, "").replace(/[\"\']$/, "");

						};

						if( isEmpty(this.attributes.getNamedItem(attribute[0])) ){

							returned = false

						}
						else if( !isEmpty(attribute[1]) ){

							if( this.attributes.getNamedItem(attribute[0]).nodeValue !== attribute[1] ) returned = false;

						};	

					}
					// is pseudo
					else if( selector[key].match(/^:/) ){

						if( selector[key] === ":first-child" ){

							if( this.parentNode.firstElementChild !== this ) returned = false;

						}
						else if( selector[key] === ":last-child" ){

							if( this.parentNode.lastElementChild !== this ) returned = false;

						}
						else if( selector[key].match(/^:nth-child?\([^\)]+\)$/ig) ){

							var toFound = this;
							var $NodeList = $(this.parentNode).find("> *" + selector[key]);

							var found = false;

							$NodeList.each(function(){

								if( this === toFound ) found = true;

							});

							if( found === false ) returned = false;

						}
						else if( selector[key] === ":first-of-type" ){
							
							if( Jo(this.parentNode).find(">:first-of-type").item(0).nodes[0] !== this ){

								returned = false;

							};

						}
						else if( selector[key] === ":last-of-type" ){

							if( Jo(this.parentNode).find(">:last-of-type").item(0).nodes[0] !== this ){

								returned = false;

							};

						}
						else if( selector[key].match(/^:nth-of-type?\([^\)]+\)$/ig) ){

							var toFound = this;
							var $NodeList = $(this.parentNode).find("> *" + selector[key]);

							var found = false;

							$NodeList.each(function(){

								if( this === toFound ) found = true;

							});

							if( found === false ) returned = false;

						};

					};
				
				};

			});

			return returned;

		}
	};

	Joot = Jo(document);

	function isEmpty( source ){

		if( isObject(source) || isArray(source) ){
			
			for( var length in source ) return false;

			return true;

		}
		else if( source === undefined || source === null || source === "" ){
			return true;
		}
		else {
			return false;
		};

	};

	function isString( source ){

		if( source instanceof String || typeof source === "string" ){
			return true;
		}
		else {
			return false;
		};

	};

	function isObject( source ){

		if( source instanceof Object || typeof source === "object" ){
			return true;
		}
		else {
			return false;
		};

	};

	function isArray( source ){

		if( source instanceof Array || typeof source === "array" ){
			return true;
		}
		else {
			return false;
		};

	};

	function isFunction( source ){

		if( source instanceof Function || typeof source === "function" ){
			return true;
		}
		else {
			return false;
		};

	};

	function isJo( source ){

		if( source instanceof Jo && typeof source === "object" ){
			return true;
		}
		else {
			return false;
		};

	};

	function prepareSelector( selector ){

		var returned = selector.replace(/\s+/ig, " ").split(",");

		for( var key = 0; key < returned.length; key++ ){

			returned[key] = returned[key].split(/\s/ig);

			for( var subkey = 0; subkey < returned[key].length; subkey++ ){

				returned[key][subkey] = returned[key][subkey].replace(/([#\.:\[])([^#\.:\[\|\>]+)/ig, function(all, type, curiosity){

					if( type === "." && curiosity.match(/\]$/ig) ) return all;
					return "|" + all;

				}).split("|");

				for( var lastkey = 0; lastkey < returned[key][subkey].length; lastkey++ ){

					returned[key][subkey][lastkey] = returned[key][subkey][lastkey].replace(/^:(first|last|nth|only)(-child|-of-type)?(\([0-9n\+\-]+\))?/ig, function(all, target, type, number){

						return ":" + target + (isEmpty(type) ? "-child" : type) + (isEmpty(number) ? "" : number);

					});

				};

				returned[key][subkey] = returned[key][subkey].join("");

			};

			returned[key] = returned[key].join(" ");

		};

		return returned.join(",");

	};

	function getNodes( selector, origin ){	

		selector = prepareSelector(selector);

		if( isEmpty(origin) ) origin = document;

		var returned = new Array();
		var originId = origin.id ? origin.id : null;
		var removeIdAfter = false;
		var oldOrigin = origin;

		if( selector.match(/^\s*>/ig) ){

			if( isEmpty(originId) ){

				removeIdAfter = true;
				originId = origin.id = "Jo_" + Math.random().toString(36).substr(2,9) + new Date().getTime().toString(36);

			};

			selector = "#" + origin.id + selector;
			origin = document;

		};

		var nodes = origin.querySelectorAll(selector);

		if( removeIdAfter === true ) oldOrigin.removeAttribute("id");

		for( var node = 0; node < nodes.length; node++ ){
			returned.push(nodes[node]);
		};

		return returned;

	};

	function isChildOf( children, parent ){

		return parent.contains ? parent.contains(children) : !!(parent.compareDocumentPosition(children) & 16);

	};

	Jo.infos = function(){

		console.log({
			Jo: "0.1",
			author: "Jordan Delcros",
			author_github: "JordanDelcros",
			author_website: "http://www.jordan-delcros.com"
		});

	};

	Jo.support = {

		events: function( event ){

			if( event in document || "on" + event in document ) return true;

			return false;

		}

	};

	Jo.specialEvents = {

		ready: function( fn ){

			if( document.readyState === "complete" ){

				fn();

			}
			else {

				return {
					action: "DOMContentLoaded",
					fn: fn
				};

			};

		},
		mouseenter: function( fn ){

			return {
				action: "mouseover",
				fn: Jo.specialEvents.mousehover(fn)
			};

		},
		mouseleave: function( fn ){

			return {
				action: "mouseout",
				fn: Jo.specialEvents.mousehover(fn)
			};

		},
		mousehover: function( fn ){

			return function( event ){

				var evt = event || window.event;
				var target = evt.target || evt.srcElement;
				var relatedTarget = evt.relatedTarget || evt.fromElement;

				if( (this === target || isChildOf(target, this)) && !isChildOf(relatedTarget, this) ){

					fn.call(this);

				}
				else {

					return false;

				};

			};

		}

	};

	Jo.fn.init.prototype = Jo.fn;

	if( isObject(window) && isObject(window.document) ) window.Jo = window.$ = Jo;

})( window );