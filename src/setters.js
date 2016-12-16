
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

