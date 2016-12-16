
	if(!window.mk){
		window.mk = { u:{} };
	}else if(!mk.u){
		/** mk utilites. Утилиты для работы со временем
		 * @namespace mku */
		mk.u = {};
	}


	/** форматирует число в миллисекундах в строку типа 2дн.5ч.10м. или 5:10
	 * @param {integer} milliseconds
	 * @param {boolean} short выдавать ли короткий формат
	 * @param {array} locale подписи единиц измерения [days,hours,minutes]
	 * @return {string} строка типа 2дн.5ч.10м.  */
	mk.u.formatTimespan = function(milliseconds,short,locale){
		var seconds = Math.floor(milliseconds/1000);
		short = (undefined === short)?false:short;

		var d = Math.floor(seconds/86400);
		var remains = seconds%86400;
		var h = Math.floor(remains/3600);
		remains = remains%3600;
		var m = Math.floor(remains/60);

		var res='';
		if(short){
			if(d !== 0){
				res+= d+locale[0];// days
			}else if(h !== 0){
				res+= h+ Math.round(m/60)+locale[1];
			}else{
				res+= m;
			}
		}else{
			if(d !== 0) res+= ''+d+locale[0];
			if(h !== 0) res+= '&nbsp;'+h+locale[1];
			res+= '&nbsp;'+m+locale[2];
		}


		return res;
	};

	/**
	 * вычисляет объект даты из строки. Строка может содержать дату и время
	 * или только дату или только время. Если только время, то дата = сегодня.
	 * время всегда разделяется двоеточием, дата тире или точкой.
	 * Дата может быть в последовательности год-месяц-день, или наоборот день-месяц-год.
	 * Лишь бы год был четырехзначным. Дата может сокращаться до месяца,
	 * время до часов:минут, время может содержать миллисекунды
	 * @param {string} dateStr строка даты
	 * @return {Date}
	 */
	mk.u.makedate = function(dateStr){
		// есть ли строка времени
		var t = []; // digits from time string
		if( /\d:\d/.test(dateStr) ){
			var tmatches = /[:\d]{3,12}$/.exec(dateStr);
			var tstr = tmatches[0];
			if(!tstr){throw new Error('cant extract time string from string '+dateStr);}
			t = tstr.split(':');
			if(t.length<2 || t.length>4){throw new Error('cant recognize time string '+tstr+' from string '+dateStr);}
		}
		// normalize time set
		while(t.length < 4){
			t.push(0); // add missing time components
		}

		// есть ли строка даты
		var d = []; // date components
		if( /\d[\.-]\d/.test(dateStr) ){
			var rx = RegExp('^[\\.-\\d]{4,10}');
			var dmatches = rx.exec(dateStr);

			var dstr = dmatches[0];
			if(!dstr){throw new Error('cant extract date string from string '+dateStr);}
			d = dstr.split(/[\.-]/);
			if(d.length<2 || d.length>3){throw new Error('cant recognize date string '+dstr+' from string '+dateStr);}

			// if year is at last position, reverse array
			if( 4 === d[d.length-1].length ){ d.reverse(); }

			// normalize date set
			while(d.length < 3){
				d.push(1); // add missing time components
			}

		// no date string, assume date is now
		}else{
			var now = new Date();
			d[0] = now.getFullYear();
			d[1] = now.getMonth()+1;
			d[2] = now.getDate();
		}

		return new Date(d[0], d[1]-1, d[2], t[0], t[1], t[2], t[3] );
	};
