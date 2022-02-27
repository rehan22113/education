var ifso_viewed_triggers = {};

var ifso_scope = {
	evalScriptsFromHTML :function(html){
		if(typeof(jQuery) !== 'function')
			return false;

		var el = document.createElement('div');
		jQuery(el).append(html);
		var scripts = '';
		jQuery(el).find('script').each(function(index){
			scripts += this.innerHTML;
		});
		eval(scripts);
	},
};

var ajax_triggers_loaded = document.createEvent('Event');
ajax_triggers_loaded.initEvent('ifso_ajax_triggers_loaded', true, true);
ifso_scope.DispatchTriggersLoaded  =  function () {document.dispatchEvent(ajax_triggers_loaded);};

var ajax_conditions_loaded = document.createEvent('Event');
ajax_conditions_loaded.initEvent('ifso_ajax_conditions_loaded', true, true);
ifso_scope.DispatchStandaloneCondLoaded  =  function () {document.dispatchEvent(ajax_conditions_loaded);};


(function( $ ) {
	'use strict';

	$(document).ready(function () {
		function if_so_public(){
			for(var ifso_scope_member_name in ifso_scope ){
				if(typeof(ifso_scope_member_name) !=='undefined' && typeof(ifso_scope[ifso_scope_member_name])!=='undefined'){
					this[ifso_scope_member_name] = ifso_scope[ifso_scope_member_name];
				}
			}
		}

		if_so_public.prototype = {
			lookForLoadLaterTriggers : function(defer=false){
				var ret = [];
				var tags = $('IfSoTrigger');
				tags.each(function(index,el){
					var tid = el.getAttribute('tid');
					var deferAttr =  el.getAttribute('defer');
					if((deferAttr===null && !defer) ||  (deferAttr!==null && defer)){
						if(null!== tid && $.inArray(tid,ret)<0){
							ret.push(tid);
						}
					}
				});
				return ret;
			},

			replaceLoadLaterTriggers : function(defer = false){
				var toReplace = this.lookForLoadLaterTriggers(defer);
				var _this = this;
				if (toReplace.length>0){
					this.sendAjaxReq('render_ifso_shortcodes',{triggers:toReplace,pageload_referrer:referrer_for_pageload},function(ret){	//Referrer from if-so public
						if(ret && ret!== null){
							try{
								var data = JSON.parse(ret);
								$.each(data, function(tid,tval){
									var tagsInDom = $('IfSoTrigger[tid="'+tid+'"]');
									tagsInDom.each(function(i,tag){
										tag.outerHTML = tval;
										_this.evalScriptsFromHTML(tval);
									})
								});
								ifso_scope.DispatchTriggersLoaded();
							}
							catch(e){
								console.error('Error fetching if-so triggers!');
								console.error(e);
							}
						}
					})
				}
			},

			lookForStandaloneConditions : function(tags){
				var ret = [];
				tags.each(function(index,el){
					var _content = el.getAttribute('content');
					var _default = el.getAttribute('default');
					var _rule = el.getAttribute('rule');
					var _hash = el.getAttribute('hash');
					var _data = {'content':_content,'default':_default,'rule':_rule,'hash':_hash};
					ret.push(_data);
				});
				return ret;
			},

			replaceStandaloneConditions : function(){
				var elements = $('IfSoCondition');
				var toReplace = this.lookForStandaloneConditions(elements);
				console.log(toReplace);
				var _this = this;
				if(toReplace.length>0){
					this.sendAjaxReq('render_ifso_shortcodes',{triggers:JSON.stringify(toReplace),pageload_referrer:referrer_for_pageload,is_standalone_condition:true},function(ret){	//Referrer from if-so public
						try{
							var data = JSON.parse(ret);
							$.each(data, function(id,val){
								elements[id].outerHTML = val;
								_this.evalScriptsFromHTML(val);
							});
							ifso_scope.DispatchStandaloneCondLoaded();
						}
						catch(e){
							console.error('Error fetching if-so standalone conditions!');
							console.error(e);
						}
					});
				}
			},

			sendAjaxReq : function(action, data, cb) {
				data['action'] = action;
				data['nonce'] = nonce;
				//data['page_url'] = ifso_page_url;
				data['page_url'] = window.location.href;

				$.post(ajaxurl, data, function(response) {
					if (cb)
						cb(response);
				});
			},

			getCookie : function(c_name) {
				var c_value = document.cookie,
					c_start = c_value.indexOf(" " + c_name + "=");
				if (c_start == -1) c_start = c_value.indexOf(c_name + "=");
				if (c_start == -1) {
					c_value = null;
				} else {
					c_start = c_value.indexOf("=", c_start) + 1;
					var c_end = c_value.indexOf(";", c_start);
					if (c_end == -1) {
						c_end = c_value.length;
					}
					c_value = unescape(c_value.substring(c_start, c_end));
				}
				return c_value;
			},

			createCookie : function(name, value, days) {
				var expires;
				if (days) {
					var date = new Date();
					date.setTime(date.getTime()+(days*24*60*60*1000));
					expires = "; expires="+date.toGMTString();
				}
				else {
					expires = "";
				}
				document.cookie = name+"="+value+expires+"; path=/";
			},

			deleteCookie : function( name ) {
				document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;";
			},

			initialize_last_viewed_globals : function(){
				var cookie = this.getCookie('ifso_last_viewed');
				try{
					var cookieObj = JSON.parse(cookie);
					ifso_viewed_triggers = cookieObj;
				}
				catch(err){console.log('ERR! ' + err)}
			},

			ifso_analytics_do_conversion : function(allowed,disallowed){
				var allowed_triggers = allowed!=null ? decodeURIComponent(allowed) : false;
				var disallowed_triggers = disallowed ? decodeURIComponent(disallowed) : false;
				var params = {an_action:'doConversion',postid:666, data:JSON.stringify(ifso_viewed_triggers)};
				if(allowed_triggers) params['allowed'] = allowed_triggers;
				if(disallowed_triggers) params['disallowed'] = disallowed_triggers;
				this.sendAjaxReq('ifso_analytics_req',params, function(){});
			}
		};

		var ifso_public_instance = new if_so_public();

		ifso_public_instance.replaceLoadLaterTriggers(false);
		var replace_defered  = function(){
			ifso_public_instance.replaceLoadLaterTriggers(true);
			$(document).unbind("click keydown keyup mousemove",replace_defered);
		};
		$(document).on('click keydown keyup mousemove',replace_defered);
		ifso_public_instance.replaceStandaloneConditions();
		$(document).on('ifso_ajax_conditions_loaded',ifso_public_instance.replaceStandaloneConditions.bind(ifso_public_instance));


		if(isPageVisitedOn || isVisitCountEnabled){	//Passed form if-so public
			ifso_public_instance.sendAjaxReq('ifso_add_page_visit', {ifso_count_visit:parseInt(isVisitCountEnabled),isfo_save_page_visit:parseInt(isPageVisitedOn)}, function(response){});
		}

		if(isAnalyticsOn){	//Passed from if-so public
			ifso_public_instance.initialize_last_viewed_globals();
			if(ifso_public_instance.getCookie('ifso_viewing_triggers')) ifso_public_instance.sendAjaxReq('ifso_analytics_req',{postid:666,an_action:'ajaxViews',data:ifso_public_instance.getCookie('ifso_viewing_triggers') });

			if($('.ifso-conversion-complete').length>0){
				var allowed =[];
				var disallowed = [];
				var doAll = false;
				$.each($('.ifso-conversion-complete'),function(key,value){
					var allowed_here = value.getAttribute('allowed_triggers');
					var disallowed_here = value.getAttribute('disallowed_triggers');
					if(allowed_here!=null && allowed_here != 'all'){
						allowed_here = allowed_here.split(',');
						allowed = allowed.concat(allowed_here);
					}
					else{
						doAll = true;
					}
					if(disallowed_here!=null){
						disallowed_here = disallowed_here.split(',');
						disallowed = disallowed.concat(disallowed_here);
					}
				});
				if(disallowed == []) disallowed = false;
				if(doAll) ifso_public_instance.ifso_analytics_do_conversion(null,disallowed);
				else ifso_public_instance.ifso_analytics_do_conversion(allowed,disallowed);
			}
		}


		//Bounce mechanism - not in use for now
		/*if(getCookie('ifso_bounce')){
            sendAjaxReq('ifso_analytics_req',{an_action:'decrementField',postid:ifso_last_viewed_trigger.triggerid, versionid:ifso_last_viewed_trigger.versionid, field:'bounce'}, function(){
                deleteCookie('ifso_bounce')
            });
        }
		window.addEventListener('beforeunload',function(e){
		    if(!getCookie('ifso_bounce')){
				createCookie('ifso_bounce');
                sendAjaxReq('ifso_analytics_req',{an_action:'incrementField',postid:ifso_last_viewed_trigger.triggerid, versionid:ifso_last_viewed_trigger.versionid, field:'bounce'}, function(){});
            }

		});*/


	});

})( jQuery );
