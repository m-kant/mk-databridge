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