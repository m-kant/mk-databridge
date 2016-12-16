toggler = {
	init: function(){
		$('.toggler-trigger').on(click,this.onclick);
	},

	toggle: function(el){
		$(el).parent('.toggler').toggleClass('visible');
	},

	onclick: function(e){
		toggler.toggle(e.target);
	}
};