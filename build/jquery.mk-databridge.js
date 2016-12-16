/**
 * Databridge is a jQuery plugin to read data from forms, and to set data to it.
 * Supports nested objects, boolean and array checkboxes,
 * on fly data formatting and conversion.
 * Works with any elements with attributes name or data-name, not only inputs.
 *
 * Usage:
	// apply data to DOM
	$('.selector').databridge(dataObject);
	// read data from DOM
	var dataObject = $('.selector').databridge();
 */


(function( $ ) {


	var _MODE_SET = 'set';
	var	_MODE_GET = 'get';


	var databridge = {
		/** текущий корневой элемент
		 * @type jQuery */
		$root:null,
		/** текущий набор подэлементов с данными (с атрибутами name)
		 * @type jQuery */
		$inputs:null,
		options:null,
		/** текущий набор с данными
		 * @type object */
		data:null,
		errorsList:[], // list of mapping errors after getting values


		init: function(el,options){
			this.clear();
			this.options = $.extend({}, _defaults, options);
			this.root = el;
			this.$root = $(el);
			this.inputs = _collectElements(this.root,this.options);
			return this;
		},

		clear: function(){
			this.$root = null;
			this.$inputs = null;
			this.options = null;
			this.data = null;
			this._checkboxes = {};
			return this;
		},

		set: function(data){
			this.data = data;
			var self = this;
			// unset all radios, forEach does not work in IE for querySelector
			[].forEach.call( this.root.querySelectorAll('[type=radio]'), function(el){el.checked = false;});

			// apply elements
			this.errorsList = [];
			for(var name in this.inputs){
				if(!this.inputs.hasOwnProperty(name)){continue;}

				var elData = this.inputs[name];
				// find data value suitable for element
				var val = _var( name, data );

				// map data value
				if(elData.mapper){
					val = elData.mapper.call(elData.el, val,_MODE_SET,this);
				}else{
					// converts undefined and null values only if no mapper given
					if(elData.type === 'checkbox'){
						if(undefined === val){val = false;}
						if(null === val){val = false;}
					}else{
						if(undefined === val){val = this.options.undefined;}
						if(null === val){val = this.options.null;}
					}
				}

				// apply data to DOM, calling in context of databridge
				_setVal.call(self,elData,val);
			}
		},

		get: function(){
			this.data = {};
			var self = this;

			// get inputs
			this.errorsList = [];
			for(var name in this.inputs){
				if(!this.inputs.hasOwnProperty(name)){continue;}

				var elData = this.inputs[name];
				var val =  _getElementVal.call(self,elData);

				// map data value
				if(elData.mapper){
					try{
						mappedval = elData.mapper.call(elData.el, val,_MODE_GET,this);
						val = mappedval;
					}catch(e){
						this.errorsList.push({ varname:name,value:val,input:elData.el,message:e.message });
					}
				}

				_appendData( self.data, name, val );
			}

			if(this.errorsList.length)console.warn('Errors during data mapping occured!',this.errorsList);
			return this.data;
		},

		getErrors: function(){
			return (this.errorsList.length)?this.errorsList:null;
		}

	};



	// every item of the list is a object {el,mapper,type}
	_collectElements = function(container, options){
		var list = container.querySelectorAll('[name], [data-name]');
		// group all elements by var names. It is necessery for checkboxes
		// 'cos several checkboxes with the same name can be scattered around the html
		var elements = {};
		// forEach does not work in IE for querySelector,
		// so use [].forEach.call in context of DOMList
		[].forEach.call(list,function(el){
			var name = _inputName(el);
			if(!elements[name]) elements[name] = {};
			var elementData = elements[name];

			elementData.type = _type(el);
			elementData.isInput = ('INPUT' === el.tagName);
			elementData.mapper = _getMapper(el,options);

			if(el.type === 'checkbox' || el.type === 'radio'){
				if(!elementData.el)elementData.el = [];
				elementData.el.push(el);
			}else{
				elementData.el = el;
			}

		});
		return elements;
	};

	_type = function(el){
		var type = el.tagName.toLowerCase();

		// input element
		if('input' === type){
			var itype = el.getAttribute('type');
			if(itype) type = itype;
		}
		return type;
	}
	_collectCheckboxes = function(container){
		var list = container.querySelectorAll('[name][type=checkbox]');
		var checkboxes = {};
		list.forEach(function(el){
			var name = _inputName(el);
			if(!checkboxes[name])checkboxes[name] = [];
			checkboxes[name].push(el);
		});
		return checkboxes;
	};

	/**
	 * find variable in container by variable name with dot notation
	 * @param {string} name
	 * @param {object} container
	 * @returns {undefined}
	 */
	var _var = function(name,container){
		var steps = name.split('.');
		var val = container || window;

		for(var i=0; i<steps.length; i++){
			if(undefined === val)break;
			val = val[ steps[i] ];
		}

		return val;
	};

	/**
	 * значение атрибута NAME, а если его нет, то DATA-NAME
	 * @param {DOMElement} el
	 * @returns {string}
	 */
	var _inputName = function(el){
		var name = el.getAttribute('name') || el.getAttribute('data-name');
		// unify to point notation
		name = name.replace( /\[/g,'.' );
		name = name.replace( /\]/g,'' );
		return name;
	};

	// _flattenObject - is a bad approach, because not all data from
	// data-object need to be applied to DOM, so no reason to iterate whole object

	$.fn.databridge = function(data,options){
		databridge.init(this.get(0),options)

		// command
		if('string' === typeof data){
			switch(data){
				case 'errors':
					return databridge.getErrors();
			};

			return this;
		// set data
		}else if(data){
			databridge.set(data);
			return this;

		// get data
		}else{
			return databridge.get();
		}
	};

	var _defaults = {
		mappers:window,
		undefined:'',
		null:'',
		errorClass:'databridge-error',
		booleanCeckboxes: true,
		
		// use data mapping if value is undefined, works on 'set'
		mapUndefined:	false,
		// use data mapping if value is null, works on 'set'
		mapNull:		false,
		// if no data mapping, what value will be set when val is undefined
		// can be a function in mapper format
		undefinedVal:	'undefined',
		// if no data mapping, what value will be set when val is null
		// can be a function in mapper format
		nullVal:		'null'
	};
	// data processing ////////////////////////////////

	/**
	 * находит и возвращает функцию мэппер
	 * @param {DOMElement} el
	 * @returns {function|null}
	 */
	var _getMapper = function(el,options){
		if(el instanceof Array) el = el[0]; // checkboxes is a set of input elements
		var mapperName = el.getAttribute('data-map') || el.getAttribute('data-mapper');
		if(!mapperName){return null;}

		var mapper = _var(mapperName, (options&&options.mappers)||window );
		if(!mapper) throw _mapErr('Mapper "'+mapperName+'" does not found');
		if('function' !== typeof mapper) throw _mapErr('Mapper "'+mapperName+'" is not a function');

		return mapper;
	};

	var _mapErr = function(message){
		var err = new Error(message);
		err.name = 'Mapper Error';
		return err;
	};

	// setters //////////////////////////////


	// common setter
	var _setVal = function(elData,val){
		var setterName;
		if(_setTo[elData.type]){
			setterName = elData.type;
		}else{
			setterName = (elData.isInput)?'input':'element';
		}

		// call in context of databridge
		return _setTo[setterName].call(this,elData.el,val);
	};


	// particular setters
	var _setTo = {

		// default setter to all inputs
		input: function(el,val){
			el.value = val;
		},

		// default setter to all NON input elements
		element: function(el,val){
			el.innerHTML = val;
		},

		// textarea uses innerHTML as inintial value.
		// Use .value to read/write instead of .innerHTML
		textarea: function(el,val){
			el.value = val;
			el.innerHTML = val;//for convenience
		},

		checkbox: function(elList,val){
			if(!(val instanceof Array) && !('boolean' === typeof val)){
				throw new Error('checkbox value must be an Array or Boolean');
			}

			// one checkbox - value is a boolean
			if(1 === elList.length){
				elList[0].checked = Boolean(val);

			// set of checkboxes - value is an array
			}else{
				if(val instanceof Array){
					// checkboxes is a set of different values
					var chkd = function(value){return (val.indexOf(value) !== -1);};
				}else{
					// boolean to all of the checkboxes
					var chkd = function(){return Boolean(val);};
				}
				elList.forEach(function(el){
					el.checked = chkd(el.value);
				});
			}


		},

		radio: function(elList,val){
			elList.forEach(function(el){
				if(String(val) === el.value){
					el.checked = true;
				}
			});

		},

		select:function(el,val){
			var options = el.querySelectorAll('option');
			val = String(val);// all data in forms is strings

			for(var i=0;i<options.length;i++){
				if(val === options[i].value){
					options[i].selected = true;
				}else{
					options[i].selected = false;
				}
			}
		}

	};

	var _isIntegerStr = function(val){
		return /^\d+$/.test(val);
	};

	/**
	 * присваивает свойству varname объекта obj значение val
	 * varname - в точечной нотации, типа person.addr.street
	 * создает в случае необходимости подобъекты person и addr
	 * @param {object} data nested object
	 * @param {string} propname in point notation
	 * @param {mixed} val
	 * @returns {undefined}
	 */
	var _appendData = function(data,propname,val){
		var steps = propname.split('.');

		// don't steam with such simple case
		if(1 === steps.length){ data[ propname ] = val; return; }

		// object is nested, it is more complicated
		var brunch = data;
		var name;
		for(var i=0; i<steps.length; i++){
			name = steps[i];
			if(_isIntegerStr(name)) name = Number(name);

			// if prop does not exists
			if(!brunch[name]){
				// last step - assign value
				if(i+1 === steps.length){
					brunch[name] = val;

				// intermediate step - build up branch
				}else{
					// is next index (content of current brunch) is an integer?
					brunch[name] = (_isIntegerStr(steps[i+1]))?[]:{};
				}
			}
			brunch = brunch[name];
		};


	};


// getters //////////////////////////////

	// common getter
	var _getElementVal = function(elData){
		var getterName;
		if(_getFrom[elData.type]){
			getterName = elData.type;
		}else{
			getterName = (elData.isInput)?'input':'element';
		}

		// call in context of databridge
		return _getFrom[getterName].call(this,elData.el);
	};


	// particular getters
	var _getFrom = {

		element: function(el){
			return el.innerHTML;
		},

		input: function(el){
			return el.value;
		},

		// textarea uses innerHTML as inintial value.
		// so use .value to read/write instead of .innerHTML
		textarea: function(el,val){
			return el.value;
		},

		checkbox: function(elList){
			// solo checkbox - value is boolean
			if(elList.length === 1){
				res = elList[0].checked;

			// several checkboxes - value is array
			}else{
				var res = [];
				elList.forEach(function(el){
					if(el.checked){ res.push( el.value );}
				});
			}
			return res;
		},

		radio: function(elList){
			var val = null;
			elList.forEach(function(el){
				if(el.checked){ val = el.value; }
			});
			return val;
		},

		select:function(el){
			return $(el).val();
		},


	};

})(jQuery);