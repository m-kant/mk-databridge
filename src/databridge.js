
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

