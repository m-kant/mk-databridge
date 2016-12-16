
	window.onerror = alert;

	readData = function(source,target){
		var data = $(source).databridge();
		console.log('databridge READ:',data);
		target.value = JSON.stringify(data,null,'  ');
	};

	setData = function(source,target){
		var dataStr = source.value;
		var data = JSON.parse(dataStr);
		console.log('databridge SET:',dataStr,data);
		$(target).databridge(data);
	};

	readDataWMap = function(source,target){
		readData(source,target);
		$(mapErrosLogEl).html('');
		var errs = $(source).databridge('errors');
		if(errs){
			var msg = '<p class="alert alert-danger">Data mapping errors ocured:<br />';
			errs.forEach(function(err){
				 msg += err.varname+': '+err.message+'<br />';
			});
			$(mapErrosLogEl).html(msg+'</p>');
		}

	};

	dateMap = function(val,mode){
		if(mode === 'set'){
			if ('number' !== typeof val) throw new Error('Time to set must be a number');
			return (new Date(val)).format('dd.mm.yyyy');
		}else{
			if (!/^\d\d\.\d\d\.\d\d\d\d$/.test(val))throw new Error('Wrong date string format');
			return mk.u.makedate(val).getTime();
		}
	};


	mileageMap = function(val,mode){
		if (!/^\d+\.{0,1}\d+$/.test(val))throw new Error('milage is not a number');
		if(mode === 'set'){
			return val/1000;
		}else{
			return val*1000;
		}
	};

	rateMap = function(val,mode){
		if(val < 4){
			this.style.backgroundColor = '#FCDEE6';
		}else if(val < 7){
			this.style.backgroundColor = '#FCFCD4';
		}else{
			this.style.backgroundColor = '#CEF2CE';
		}
		return val;
	};

	roundControl = function(val,mode){
		if (!/^\d+$/.test(val))throw new Error('value must be a number');
		if(mode === 'set'){
			$(this).siblings( '.pointer' ).css('transform','rotate('+val+'deg)');
		}
		return val;
	};