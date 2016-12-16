
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

