jQuery(document).ready(function(e) {
    set_campaign_cookie();
	add_missing_campaigns()
});
function set_campaign_cookie(){
	var qvars = getUrlVars();
	var striped = {};
	var overwrite = false;
	if(qvars.hasOwnProperty('utm_campaign') && qvars['utm_campaign']!='undefined'){
		overwrite = true;
		striped['utm_campaign']= qvars['utm_campaign'];
	}
	if(qvars.hasOwnProperty('utm_medium') && qvars['utm_medium']!='undefined'){
		striped['utm_medium']= qvars['utm_medium'];	
	}
	if(qvars.hasOwnProperty('utm_source') && qvars['utm_source']!='undefined'){
		striped['utm_source']= qvars['utm_source'];	
	}
	if(qvars.hasOwnProperty('utm_content') && qvars['utm_content']!='undefined'){
		striped['utm_content']= qvars['utm_content'];	
	}
	if(qvars.hasOwnProperty('utm_term') && qvars['utm_term']!='undefined'){
		striped['utm_term']= qvars['utm_term'];	
	}
	//striped = striped.substring(1);
	if(overwrite){
		setACookie('eloqua_campaign',JSON.stringify(striped),30);
	}
	//use hasOwnProperty and ! undefined
	//utm_campaign, utm_medium, utm_source, utm_content, utm_term
	//1) Chek for a qstring cookie
	//2) Extract the campaign valuepairs
	//3) Fill out the forms, add to the form
}
function add_missing_campaigns(){
	var campInfo = getACookie('eloqua_campaign');
	if(campInfo){
		campInfo = JSON.parse(campInfo);
		jQuery('form').each(function(index, element) {
			var fields = ['utm_campaign','utm_medium','utm_content','utm_source','utm_term'];
			for(var i=0;i<fields.length;i++){
				var f = fields[i];
				if(campInfo.hasOwnProperty(f)){
					var foundField = jQuery(element).find('[name='+f+']');
					if(foundField.length==0){
						var str = '<input type="hidden" name="_'+f+'" value="'+campInfo[f]+'"/>';
						jQuery(element).append(str);
					}
					jQuery(element).find('[name='+f+']').val(campInfo[f]);
				}
			}
        });
		
	}
}
function getUrlVars(){
	var vars = {};
	var loc =  window.location.search.substring(1);
	var hashes = loc.split('&');
	for(var i = 0; i < hashes.length; i++){
		var hash = hashes[i].split('=');
		//obj[hash[0]] = hash[1]
		//vars.push(hash[0]);
		vars[hash[0]] = hash[1];
	}
	return vars;
}
function setACookie(name, value, days){
  if (days){
    var date = new Date();
    date.setTime(date.getTime()+days*24*60*60*1000);
    var expires = "; expires=" + date.toGMTString();
  }  else
    var expires = "";
  document.cookie = name+"=" + value+expires + ";path=/"; 
}
////Retieve cookie (from w3c)
//--Used with set coomies session

function getACookie(c_name){
	var i,x,y,ARRcookies=document.cookie.split(";");
	for (i=0;i<ARRcookies.length;i++){
		x=ARRcookies[i].substr(0,ARRcookies[i].indexOf("="));
		y=ARRcookies[i].substr(ARRcookies[i].indexOf("=")+1);
	 	x=x.replace(/^\s+|\s+$/g,"");
		if (x==c_name){
			return unescape(y);
		}
	}
}