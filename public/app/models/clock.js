define([
  'underscore',
  'backbone',
  'sapp',
  'moment'
], function(_, Backbone,Sapp,moment) {
	var Clock = Backbone.Model.extend({
			defaults:{
				company: 'My company',
				protocol: 'company protocol',
				checked: false,
				owner: '',
				timers: [],
				control: {start:0,interval:0,seconds:0}
			},
			idAttribute: "_id",
			parse:function (response) {
		        //console.log(response);
		        response.id = response._id;
		        
		        return response;
		    },

		    intialize: function(){
		    	this.control = { start: 0, interval: 0, seconds: 0};
		    	this.timers = [];
		    },
		    
			// Helper function for checking/unchecking a service

			showTime: function(){
				var controlId = $('#control_' + this.get("id"));
				controlId.css({
					"float": "right",
					"border-radius":"25px",
				    "background":"#73AD21",
				    "padding":"5px",
				    "width":"60px",
				    "height":"30px",


				});
				//controlId.html(" Timer:" + self.control.seconds);
				var h = 0,m =0,s = 0;

				var control = this.control;
				if ( control && control.seconds){
					s = control.seconds;
				}else{
					//find last control
					var s = 0;
					var _timers = this.get("timers");
					for(var i=0; _timers && i < _timers.length; i++){
						s = _timers[i].seconds;
					}
				}
				if ( s > 60){
					m = parseInt(s/60);
					s = s%60;
				}
				if ( m > 60){
					h = parseInt(m/60);
					m=m%60;
				}
				if ( m < 10){
					m = "0" + m;
				}
				if ( h < 10){
					h = "0" + h;

				}
				if ( s < 10){
					s = "0" + s;
				}
				
				if ( typeof s === 'undefined' ){
					s = "00";
				}
				controlId.html(h + ":" + m + ":" + s);

			},
			controlClock: function(){
				if ( this.get('checked') ){
					var checkedClocks = Sapp.clocks.getChecked();
					var activeClock = this.get("id");
					_.each(checkedClocks,function(clock){
						var id = clock.get("id");
						if ( id !== activeClock ){
							if ( clock.get('checked') ){
								//clock.set('checked', false);
								console.log("pausing clock:" + id);
								clock.pause();
							}
							
						}
					});
					this.start();
					//this.trigger('change:timers', this,{});
				}else{
					this.pause();

				}
			},

			setControl: function(){
				// var dateObject = new Date();
				// var dstring = (dateObject.getMonth() + 1) + "-" + dateObject.getDay() + "-" + dateObject.getFullYear();
				var dstring = moment().format("MM-DD-YYYY");
				console.log("dstring:" + dstring);
				var lastDate = 0;
				var seconds = 0;
				var interval = 0;
				console.log("dstring:" + dstring);

				//var control = { start: dstring, interval: 0, seconds:0};
				if ( !this.control ){
					this.control = { start: dstring, interval: 0, seconds:0, running : false};
				}
				var _timers = this.get('timers');

				for( var i=0; i < _timers.length; i++){
					var tm = _timers[i];
					
					if ( tm.start == dstring){
						console.log("tm.start:" + tm.start + " equals dstring:" + dstring);
						this.control.start = tm.start;
						this.control.seconds = tm.timer;
					}
				}
				// if ( _timers && _timers.length > 1 ){
				// 	console.log("getting last element of timers")
				// 	for(var i=0; i < _timers.length; i++){
				// 		lastDate = _timers[i].start;
				// 		seconds = _timers[i].timer;
				// 	}
				// 	console.log("lastDate:" + lastDate	+ " dstring:" + dstring)
				// 	if ( lastDate == dstring){
				// 		console.log("they are equal")
				// 		this.control.start = lastDate;
				// 		this.control.seconds = seconds;
				// 	}
				// }

			},
			start : function(){
				var self = this;
				//self.control = { interval: 0, seconds: 0};

				//var control = this.getControl();
				//var retval = self.getControl();
				self.setControl(); //{ start: retval.start, interval: retval.interval, seconds: retval.seconds};
				//var controlId = $('#control_' + self.get("id"));
				self.control.running = true;
				var savedCycle = 0;
				var intval = setInterval(function(){
					self.control.seconds = (self.control.seconds) ? (self.control.seconds + 1) : 1;
					savedCycle++;
					if ( savedCycle == 60){
						
						console.log("savingCyle:" + savedCycle + " save will be forced.");
						savedCycle = 0;
						//self.saveMe();
					}
					self.showTime();
					
				},1000);
				self.control.interval = intval;

			},
			
			pause: function(){
				if ( !this.control ){
					this.setControl();
				}
				
				
				if ( this.control && this.control.interval ){
					clearInterval(this.control.interval);
					this.set('checked',false);
					if ( this.control && this.control.start && this.control.seconds ){
						//this.timers.push({start: this.control.start, timer: this.control.seconds});
						//this.control.running = false;
						var _timers = this.computeTimer(this.control,this.get("timers"));
						//console.log("saving with start:" + this.control.start);
						//_timers.push({start: this.control.start, timer: this.control.seconds});
						this.set('timers', _timers);
						this.save({});

					}
					
				}
				//this.showTime();
			},
			computeTimer: function(con,timers){
				console.log("computeTimer called:");
					var tm = [];
					var modified = false;
					for(var i=0; i < timers.length; i++){
						var st = timers[i].start;
						var t = timers[i].timer;

						if ( st == con.start){
							console.log('saving t.start:' + st.start + " and con.start:" + con.start);
							t = con.seconds;
							modified = true;
						}
						tm.push({start: st, timer: t});
					}
					if ( ! modified ){
						tm.push({start: con.start, timer: con.seconds});
					}
					return tm;
			},
			toggle: function(){				
				this.set('checked', !this.get('checked'));
				this.controlClock();
				
			},
			showReport: function(){
		
				//var weekday = moment().weekday();
				
				//$("#week").append("<li>weekday:" + weekday + "</li>");
				var monday = moment().startOf('isoWeek');
				//var sunday = moment().endOf('isoWeek');
				var tuesday = moment(monday).add(1,'days');
				var wednesday = moment(monday).add(2,'days');
				var thursday = moment(monday).add(3,'days');
				var friday = moment(monday).add(4,'days');
				var saturday = moment(monday).add(5,'days');
				var sunday = moment(monday).add(6,'days');
				//var cursorDate = monday;
				//var dSeconds = daySeconds(cursorDate);

				var days = {
					"Monday": monday.format("MM-DD-YYYY"),
					"Tuesday": tuesday.format("MM-DD-YYYY"),
					"Wednesday": wednesday.format("MM-DD-YYYY"),
					"Thursday": thursday.format("MM-DD-YYYY"),
					"Friday": friday.format("MM-DD-YYYY"),
					"Saturday": saturday.format("MM-DD-YYYY"),
					"Sunday": sunday.format("MM-DD-YYYY")
				}

				//$("#week").append("<li>" + days[0] + ":" + dSeconds + "</li>");
				$("#d4").text(this.get('protocol'));
				var formatSeconds = function (secs){
					if ( secs == 0)
						return 0;
					var h =0, m = 0, s=0;

					s = secs;
					if ( s > 60){
						m = parseInt(s/60);
						s = s%60;
					}
					if ( m > 60){
						h = parseInt(m/60);
						m=m%60;
					}
					if ( m < 10){
						m = "0" + m;
					}
					if ( h < 10){
						h = "0" + h;

					}
					if ( s < 10){
						s = "0" + s;
					}

					return h + "h:" + m + "m:" + s + "s";
				};
				var totalTime = 0;
				var _timers = this.get('timers');
				for (var i in days){
					var dmom = days[i];
					
					
					var dSeconds = this.daySeconds(_timers,dmom);
					totalTime += dSeconds;
					var secondTime = formatSeconds(dSeconds);
					
					$("#week").append("<li>" + i + ":<span style='font-color=blue;'>" + secondTime	 + "</span></li>");
				}
				$("#total span").empty();
				$("#total span").text( formatSeconds(totalTime));
			},

			daySeconds: function(_timers,mom){
				
				//var dstring = mom;//mom.format("MM-DD-YYYY");
				//console.log("dstring:" + dstring);
				//var _timers = this.get("timers");
				var seconds = 0;
				for(var i=0; i < _timers.length; i++){
					var start = _timers[i].start;
					var secs = _timers[i].timer;
					
					if ( start == mom){
						seconds += secs;
					}
				}
				return seconds;
				
			},
			
	});
	return Clock;
});