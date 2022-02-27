"use strict";var $j=jQuery.noConflict();$j(document).bind('gform_post_render',function(event,form_id){var gfpMainJsVars=window["gfpMainJsVars_"+form_id];if(!gfpMainJsVars){return;}
var telInputs=$j(gfpMainJsVars.elements).toArray();for(var i=0;i<telInputs.length;i++){var telInput=$j(telInputs[i]);var options={nationalMode:true,utilsScript:gfpMainJsVars.utilsScript}
if(gfpMainJsVars.onlyCountries.length>0){options.onlyCountries=gfpMainJsVars.onlyCountries;}
if(gfpMainJsVars.preferredCountries.length>0){options.preferredCountries=gfpMainJsVars.preferredCountries;}
if(gfpMainJsVars.autoSetIp){options.initialCountry=gfpMainJsVars.initialCountry;options.geoIpLookup=function(success,failure){$j.get("https://ipinfo.io",function(){},"jsonp").always(function(resp){var countryCode=(resp&&resp.country)?resp.country:"";success(countryCode);});}}
$j(telInput).intlTelInput(options);}});