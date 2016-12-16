
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