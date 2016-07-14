var currentContact = false;
jQuery(document).ready(function(e) {
    jQuery('form.validatethis').submit(function(event){
                jQuery(event.target).addClass('inprocess');
                if(jQuery(event.target).hasClass('useAjax')){
                        event.preventDefault();
                }
                jQuery(event.target).find('.validation-message').remove();      
                //console.log(jQuery(event.target).find('.validate input').length)
                jQuery(event.target).find('.validate input, .validate textarea, .validate select').each(function(index, element) {              
                        var name = jQuery(element).attr('name');
                        if(name){       
                                if(jQuery(element).val()){
                                        jQuery(element).removeClass('LV_invalid_field');
                                        if((jQuery(element).attr('name')=='email' || jQuery(element).hasClass('email')) && !validateEmail(jQuery(element).val())){
                                                jQuery(element).addClass('LV_invalid_field');   
                                        }
                                }else if(jQuery(element).attr('type')!='hidden'){
                                        jQuery(element).addClass('LV_invalid_field');   
                                }
                        }
                });
                jQuery(event.target).find('.validate.checkgroup').each(function(index,div){
                        jQuery(event.target).removeClass('inprocess');
                        jQuery(div).removeClass('LV_invalid_field');
                        if(jQuery(div).find(':checked').length===0){
                                jQuery(div).addClass('LV_invalid_field');
                        }
                });
                var valid = jQuery(this).find('.LV_invalid_field').length===0;
                if(!valid){
                        jQuery(event.target).removeClass('inprocess')   ;               
                        jQuery(event.target).prepend('<div class="validation-message">Please fill out all required fields.</div>');
                        jQuery(document.body).animate({'scrollTop':formTop(this)}, 'slow');
                }else if(jQuery(event.target).hasClass('useAjax')){
                        submitForm(event.target,function(){
                                var name = jQuery(event.target).attr('name');
                                setCookie('submitted_'+name,'true','365')       ;
                        });
                        return false;
                }else{
                        jQuery(event.target).removeClass('inprocess');
                        return valid;
                }
                return false;
        });
        jQuery('.checkbox label').click(function(){
                var checkBox = jQuery(this).siblings('input');
        checkBox.prop("checked", !checkBox.prop("checked"));
        });
        jQuery('.checkgroup label').on('mouseup',function(){
                var chk = jQuery(this).find('input[type=checkbox]:checked');
                var unchk = jQuery(this).find('input[type=checkbox]');
                if(unchk && chk.length === 0){
                        jQuery(this).addClass('on');
                }else{
                        jQuery(this).removeClass('on'); 
                }
        });
        jQuery('body').on('click','.checklist-option',function(e){
                if(e.target.nodeName.toLowerCase() != 'input'){
                        var tar = jQuery(e.target).hasClass('checklist-option')? e.target : jQuery(e.target).parents('.checklist-option');
                        if(jQuery(tar).hasClass('selected')){
                                jQuery(tar).removeClass('selected');
                                jQuery(tar).find('[type=checkbox]').attr('checked',false);
                                jQuery(tar).find('[type=checkbox]').prop('checked',false);
                                jQuery(tar).find('[type=checkbox]')[0].checked = false;
                        }else{
                                jQuery(tar).addClass('selected');
                                jQuery(tar).find('[type=checkbox]').attr('checked',true);
                                jQuery(tar).find('[type=checkbox]').prop('checked',true);
                                jQuery(tar).find('[type=checkbox]')[0].checked = true;
                                
                        }                       
                }
        });
        /*jQuery('.form-wrap').not('.gated-form').find('form[action="https://s667.t.eloqua.com/e/f2"').not('.validatethis').submit(function(event){
                updateCookie('submittedForms',jQuery(event.target).attr('name'))
        })*/
        jQuery('body').on('keyup','.progressive-submit #email',function(e){
                if(e.which==13){
                        checkProgressiveEmail(this);    
                }
        });
        jQuery('.progressive-submit #submit').click(function(){
                checkProgressiveEmail(this);
        });
        function checkProgressiveEmail(target){
                var p = jQuery(target).parents('.progressive');
                jQuery(p).find('.correction').hide();
                jQuery(p).find('.proressive-wait').removeClass('active');
                var v = jQuery(p).find('#email').val();
                if(!v){
                        submitState(p,'message','No email was entered');
                }else if(!validateEmail(v)){
                        submitState(p,'message','Please enter a valid email.');
                }else{
                        jQuery(p).find('.proressive-wait').addClass('active');
                        jQuery(p).find('.proressive-wait').stop().animate({'width':'100%'},800);
                        submitState(p,'hide');
                        lookupContact(v,function(card){
                                //Success
                                jQuery(p).find('.proressive-wait').html(v);
                                currentContact = card.id;
                                showForms(card);
                        },function(){
                                //No records
                                jQuery(p).find('.progressive-submit #submit').html('Retry');
                                jQuery(p).find('.proressive-wait').removeClass('active');
                                jQuery(p).find('.proressive-wait').stop().css({width:''});
                                submitState(p,'message','We don\'t recognise your email.<br/>Please try again or fill out the form below.');
                                //log('FIND  this3::: '+jQuery(target).find('[name="emailAddress"]').length);
                                jQuery('form [name="emailAddress"]').val(v);
                                showForms({"emailAddress":v,"fieldValues":[]});
                        },function(){
                                //Timeout/Error
                                jQuery(p).find('.proressive-wait').removeClass('active');
                                jQuery(p).stop().animate({'opacity':0,height:0},800);
                                submitState(p,'message','We could not find your email because of a server error. <br/>You can try again later or fill out the form below.');
                                showForms();
                        });
                }
        }
        function showForms(card){
                if(card){
                        var keys = Object.keys(card);
                        for(var i=0; i<keys.length;i++){
                                var k = keys[i];
                                //log('key: '+k);
                                var blacklist = ['createdAt','currentStatus','depth','fieldValues','id','isBounceback','isSubscribed','salesPerson','subscriptionDate','updatedAt'];
                                if(blacklist.indexOf(k) == -1){
                                        //log("FIND: "+jQuery('form [name="'+k+'"]').not('.keepalive').length);
                                        jQuery('form [name="'+k+'"]').not('.keepalive').each(function(index, element) {
                                                var f = jQuery(element).parents('.elq-field');
                                                jQuery(f).addClass('ignore');
                                                
                                        });
                                }
                        }
                        for(var f=0;f<card.fieldValues.length;f++){ 
                                var field = jQuery('form [data-contact-field="'+card.fieldValues[f].id+'"]').not('.keepalive');
                                if(field.length>0 && card.fieldValues[f].value){
                                        jQuery(field).addClass('ignore');       
                                }                               
                        }
                }
                jQuery('.form-wrap').each(function(index, element) {
                        var reduce = 0;
                        jQuery(this).find('form .ignore').each(function(index, element) {
                                reduce += jQuery(element).outerHeight(true);
                        });
                        var h = jQuery(this).find('form').outerHeight(true) + jQuery(this).find('.form-disclaimer').outerHeight(true);
                        h = h-reduce;
                        var availableFields = jQuery('.elq-field').not('.ignore,.hidden,.hidefield,.submit').length;
                        
                        if(availableFields ==0){
                                processForm(jQuery(this).find('form'))
                        }else{
                                jQuery(this).stop().animate({height:h, opacity:1},800,function(tw){
                                        jQuery(element).css({height:'auto'});
                                        
                                });
                        }
                        /*var availableFields = jQuery('.elq-field').not('.ignore,.hidden,.hidefield,.submit').length;
                        if(availableFields ==0){
                                processForm(form)
                        }*/
        });     
                
                jQuery('form .ignore').slideUp('fast');
                
                
        }
        jQuery('body').on('click','.checkSelect .target-btn, .checkSelect .val',function(){
                var checkSel = jQuery(this).parents('.checkSelect');
                jQuery(checkSel).toggleClass('open');
                
                if(jQuery(checkSel).hasClass('open')){
                        var h = jQuery(checkSel).find('.option-wrap').outerHeight()+  jQuery(checkSel).find('.val').outerHeight(true);
                        jQuery(checkSel).find('.selected-val').stop().animate({height:h},300);
                }else{
                        var h = jQuery(checkSel).find('.val').outerHeight();
                        jQuery(checkSel).find('.selected-val').stop().animate({height:h},300);
                }
        });
        jQuery('body').click(function(e) {
                if(jQuery(e.target).parents('.checkSelect').length===0 && !jQuery(e.target).hasClass('checkSelect')){
                        jQuery('.checkSelect').each(function(index, checkSel) {
                var h = jQuery(checkSel).find('.val').outerHeight();
                                jQuery(checkSel).find('.selected-val').stop().animate({height:h},300);
                                jQuery(checkSel).removeClass('open');
            });
                }
    });
        jQuery('body').on('click','.checkSelect .option-list',function(){
                var f = jQuery(this).parents('.elq-field');
                var val = [];
                jQuery(f).find('.option-list').each(function(index, element) {
            if(jQuery(this).hasClass('selected')){
                val.push(jQuery(this).find('label').text());
                        }
        });
                val = val.length>0? val.join(',') : 'Please Select';
                
                jQuery(f).find('.selected-val .val').html(val);
        });
});
function lookupContact(email,success,noRecord,error){
        var url  = '/mobilefordevelopment/wp-admin/admin-ajax.php';
        //log(email);
        jQuery.ajax({
        type: "GET",
        url: url,
        data: {action: 'eloqua_contact',data:email},
        dataType: 'json',
        error: function(err){
                        log(err);
                        if(error) error();
        },
        success: function (html){
                        //log(html);
                        //log('typeof: '+(typeof html));
                        if(html.elements.length > 0 && success){
                                success(html.elements[0]);
                        }else if(noRecord){
                                noRecord();
                        }
        }
    });
        return false;
}
function validateEmail(email) { 
    var re = /^([^@\s]+)@((?:[-a-z0-9]+\.)+[a-z]{2,})$/i;
    return re.test(email);
}
function submitForm(form,callback,errorcall){
        submitState(form,'send');
        var name = jQuery(form).attr('name');
        var fid = jQuery(form).attr('id').replace(/form/g,'');
        var url  = '/mobilefordevelopment/wp-admin/admin-ajax.php';
        var dtString =  jQuery(form).serialize();
        var serData = jQuery(form).serializeArray();
        //find/combine checkbox groups, radio groups
        
        var multi = jQuery(form).find('.option-wrap input').map(function(index, element) {
                return jQuery(element).attr('name');
        }).get();
        
        multi = jQuery.unique(multi);
        serData = jQuery.grep(serData,function(obj,i){
                //log(obj);
                return multi.indexOf(obj.name)==-1;
        });
        jQuery(form).find('.option-wrap').each(function(index, element) {
                var obj = {};
                obj.name = jQuery(element).find('input').first().attr('name');
                obj.value = jQuery(element).find('input[checked=checked]').map(function(index, ip) {
                        return jQuery(ip).val();
                }).get().join(',');
                //log(obj.value);
                if(obj.value){
                        serData.push(obj);
                }
        });
        //log(serData);
        
        
        var deepData = [];
        jQuery.each(serData,function(i,val){
                
                if(val.name != 'elqFormName' && val.name != 'elqSiteId' && val.name != 'elqCampaignId'){
                        var field = jQuery(form).find('[name="'+val.name+'"]');
                        var id = jQuery(field).parents('.elq-field').attr('id');
                        var con = jQuery(field).parents('.elq-field').attr('data-contact-field');
                        //if(id && val.value){
                        if(id){
                                id = id.replace(/elq-/g,'');
                                val.id = id;
                                if(con){
                                        val.conID = con;
                                }
                                val.type = 'FieldValue';
                                deepData.push(val);
                        }
                }
        });
        
        var submitData = {};
        submitData.submittedByContactId = currentContact;
        submitData.fieldValues = deepData;
        submitData.type = 'FormData';
        log(JSON.stringify(submitData));
        jQuery.ajax({
        type: "POST",
        url: url,
                data: {action:'eloqua_form_rest_submit', method:'submit', data:dtString, fullData:submitData, form:fid},
        //data: {action:'eloqua_form_submit', method:'submit', data:dtString},
        dataType: 'json',
        error: function(err){
                        log(err);
                        jQuery(form).trigger('failed');
                        submitState(form,'error');
                        if(errorcall) errorcall();
        },
        success: function (html){
                        log(html);
                        if(html.http_code != 400){
                                //log('SUCCESS');
                                //log('------------');
                                jQuery(form).trigger('submitted');
                                submitState(form,'success');
                                if(window.dataLayer){
                                        dataLayer.push({
                                                'Name_of_Form': $(form).attr('data-form-name'),
                                                'Form_ID': $(form).attr('id').replace(/form/g,''),
                                                'event': 'ajaxform',
                                                'gate': $(form).attr('data-gate'),
                                        });     
                                }
                                if(callback) callback();
                        }else{
                                jQuery(form).trigger('failed');
                                submitState(form,'error');
                                if(window.dataLayer){
                                        dataLayer.push({
                                                'Name_of_Form': $(form).attr('data-form-name'),
                                                'Form_ID': $(form).attr('id').replace(/form/g,''),
                                                'event': 'ajaxformfail'
                                        });     
                                }
                                if(errorcall) errorcall();
                        }
        }
    });
        return false;
}
if (typeof setCookie != 'function') { 
  ////Set cookie function (from w3c)
        //--Used with set cookies session
        
        function setCookie(c_name,value,exdays){
                var exdate=new Date();
                exdate.setDate(exdate.getDate() + exdays);
                var c_value=escape(value) + ((exdays==null) ? "" : "; expires="+exdate.toUTCString());
                document.cookie=c_name + "=" + c_value;
        }
}
if (typeof getCookie != 'function') { 
        ////Retieve cookie (from w3c)
        //--Used with set cookies session
        
        function getCookie(c_name){
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
}


/*====================
        New Form Actions
====================*/
function validateCustomForm(form){
        jQuery(form).find('.elq-field .message').hide();
        jQuery(form).find('.elq-field.invalid').removeClass('invalid');
                
        jQuery(form).find('.elq-field.IsRequiredCondition').not('.ignore').each(function(index, element) {
                if(jQuery(element).hasClass('group')){
                }else if(jQuery(element).attr('data-valid-count')){
                        var num = parseInt(jQuery(element).attr('data-valid-count'));
                        if(num > jQuery(element).find(':checked').length){
                                jQuery(element).addClass('invalid');
                        }
                }else if(jQuery(element).hasClass('checkList') || jQuery(element).hasClass('checkbox') || jQuery(element).hasClass('radio')){
                        if(jQuery(element).find(':checked').length==0){
                                jQuery(element).addClass('invalid');
                        }
                                
                }else if(!jQuery(element).find('input,select,textarea').val()){
                        jQuery(element).addClass('invalid');
                }
       });      
        jQuery(form).find('.elq-field.IsEmailAddressCondition').not('.invalid,.ignore').each(function(index, element) {
                var v = jQuery(element).find('input').val();
                if(!v || !validateEmail(v)){
                        jQuery(element).addClass('invalidemail');
                }
    }); 
        return jQuery(form).find('.elq-field.invalid,.elq-field.invalidemail').length==0;
}
jQuery(document).ready(function($) {
        addSelectBox();
        jQuery('body').on('click','.reset-btn',function(e){
                e.preventDefault();
                var frm = $(this).parents('form');
                $(frm)[0].reset();
                $(frm).find('.select.single').each(function(){
                        var val = $(this).find('option').first().val();
                        //console.log(val)
                        $(this).find('.sbSelector').text(val);
                });
        });
        jQuery('.form-wrap.gated-form').each(function(index, element) {
        //get data-gate, change 
                var gateurl = jQuery(element).attr('data-gate');
                jQuery(element).find('form').removeAttr('action');
                jQuery(element).find('form').addClass('gated');
                jQuery(element).find('form').attr('data-gate',gateurl);
                jQuery(element).find('[name=documentURL]').val(gateurl);
                jQuery(element).find('[name=documentTitle]').val('Displayed Form');
                if(jQuery(element).attr('data-gate').indexOf(',')!=-1){
                        //log('GATE URL: '+jQuery(element).attr('data-gate'));
                        var gates = jQuery(element).attr('data-gate').split(',');
                        //log(gates)
                        var q = getUrlVars();
                        var gateID = q.hasOwnProperty('gate') && jQuery.isNumeric(q.gate)? parseInt(q.gate) -1 : 0;
                        gateID = Math.max(0,gateID);
                        gateID = Math.min(gates.length-1,parseInt(gateID));
                        //log('GATE ID: '+gateID);
                        var newGate = gates[gateID];
                        jQuery(element).attr('data-gate',newGate);
                        jQuery(element).find('form').attr('data-gate',newGate);
                        jQuery(element).find('[name=documentURL]').val(newGate);
                        //jQuery(element).find('form').attr('name',newGate)
                }
    });
        
        jQuery('.eloqua-imported').submit(function(event){
                var form = jQuery(event.target);
                //jQuery(form).addClass('inprocess')
                //event.preventDefault();
                if(jQuery(form).hasClass('useAjax') || jQuery(form).parents('.form-wrap').hasClass('useAjax')){
                        event.preventDefault();
                }
                var valid = validateCustomForm(form);
                var frmid = jQuery(form).attr('name');
                var days  = jQuery(form).attr('data-cookie-duration');
                if(!valid){
                        submitState(this,'invalid');
                }else if(jQuery(form).hasClass('gated')){
                        submitForm(event.target,function(){
                                updateCookie('submittedForms',frmid,days);
                                lookupContact(jQuery('.progressive #email').val(),function(html){
                                        currentContact = html.id
                                        updateCookie('submittedForms',frmid,days);
                                        window.location = jQuery(form).attr('data-gate');
                                },function(none){
                                        window.location = jQuery(form).attr('data-gate');
                                },function(err){
                                        window.location = jQuery(form).attr('data-gate');
                                })
                                //window.location = jQuery(form).attr('data-gate');
                        });
                        return false;
                }else if(jQuery(form).hasClass('useAjax') || jQuery(form).parents('.form-wrap').hasClass('useAjax')){
                        jQuery(document.body).animate({'scrollTop':formTop(this)}, 'slow');
                        submitForm(event.target,function(){
                                updateCookie('submittedForms',frmid,days);
                        });
                        return false;
                }else{
                        submitState(this,false);
                        //jQuery(form).removeClass('inprocess')
                        updateCookie('submittedForms',frmid,days);
                        return true;
                }
                return false;
        });
});
function processForm(form){
        var frmid = jQuery(form).attr('name');
        var days  = jQuery(form).attr('data-cookie-duration');
        if(jQuery(form).hasClass('gated')){
                submitForm(form,function(){
                        updateCookie('submittedForms',frmid,days);
                        lookupContact(jQuery('.progressive #email').val(),function(html){
                                currentContact = html.id
                                updateCookie('submittedForms',frmid,days);
                                window.location = jQuery(form).attr('data-gate');
                        },function(none){
                                window.location = jQuery(form).attr('data-gate');
                        },function(err){
                                window.location = jQuery(form).attr('data-gate');
                        })
                        //window.location = jQuery(form).attr('data-gate');
                });
                return false;
        }else if(jQuery(form).hasClass('useAjax') || jQuery(form).parents('.form-wrap').hasClass('useAjax')){
                jQuery(document.body).animate({'scrollTop':formTop(this)}, 'slow');
                submitForm(form,function(){
                        updateCookie('submittedForms',frmid,days);
                });
                return false;
        }else{
                submitState(this,false);
                //jQuery(form).removeClass('inprocess')
                updateCookie('submittedForms',frmid,days);
                return true;
        }
}
function formTop(form){
        var t = jQuery(form).offset().top - 150;
        //log(t);
        return t;
}
function submitState(target,state,message){
        var pane = jQuery(target).parents('.form-process');//.find('.submission')
        jQuery(document.body).animate({'scrollTop':formTop(pane)}, 'slow');
        jQuery(pane).removeClass('validate invalid send error success');
        jQuery(pane).addClass(state);
        switch(state){
                case 'validate':
                fadeText('Validating');
                //jQuery(pane).find('.submission').html('Validating')
                jQuery(pane).find('.submission').slideDown();
                break;
                
                case 'invalid':
                fadeText('Please check the fields below');
                //jQuery(pane).find('.submission').html('Please check the fields below')
                jQuery(pane).find('.submission').slideDown();
                break;
                
                case 'send':
                fadeText('Processing');
                //jQuery(pane).find('.submission').html('Processing')
                jQuery(pane).find('.submission').slideDown();
                jQuery(pane).find('.form-wrap').slideUp('slow');
                jQuery(pane).find('.progressive-submit').slideUp('slow');
                //jQuery('.form-wrap').slideUp()
                break;
                
                case 'error':
                fadeText(jQuery(pane).find('.eloqua-failure-message').html());
                //jQuery(pane).find('.submission').html(jQuery(pane).find('.eloqua-failure-message').html())
                jQuery(pane).find('.submission').slideDown();
                break;
                
                case 'success':
                fadeText(jQuery(pane).find('.eloqua-success-message').html());
                //jQuery(pane).find('.submission').html(jQuery(pane).find('.eloqua-success-message').html())
                jQuery(pane).find('.submission').slideDown();
                break;
                
                case 'message':
                fadeText(message);
                //jQuery(pane).find('.submission').html(message)
                jQuery(pane).find('.submission').slideDown();
                break;
                
                case 'hide':
                jQuery(pane).find('.submission').slideUp(function(){
                        jQuery(pane).find('.submission .inside').html('');
                });
                break;
                
                default:
                
        }
        function fadeText(txt){
                if(jQuery(pane).find('.submission .inner').length>0){
                        
                        var prev = jQuery(pane).find('.submission .inner');
                        if(txt != jQuery(prev).html()){
                                var h = jQuery(prev).outerHeight(true);
                                var nw = jQuery('<div class="inner new">'+txt+'</div>');
                                jQuery(pane).find('.submission .inside').height(h);
                                jQuery(pane).find('.submission .inside').append(nw);
                                jQuery(prev).addClass('new');
                                jQuery(nw).removeClass('new');
                                jQuery(pane).find('.submission .inside').stop().delay(200).animate({height:jQuery(nw).height()},300,function(){
                                        jQuery(pane).find('.submission .inside').css({height:''});
                                        jQuery(prev).remove();
                                });
                        }
                }else{
                        jQuery(pane).find('.submission .inside').html('<div class="inner">'+txt+'</div>');
                }
                //1. Get the height of the text in there
                //2. create a new text with     
        }
}
function updateCookie(c_name,value,days){
        var email = currentContact;
        email = email? ':'+email : ':'+jQuery('.progressive #email').val();
        days = days? days : 365;
        value = value.trim();
        var c = getCookie(c_name);
        if(c){
                var cArr = c.split(',');
                var a  = value+email;
                var ii = false;
                
                for(var i=0; i<cArr.length; i++) {
                        if (cArr[i].indexOf(value)!=-1) ii = i;
                }
                if(ii!==false){
                        cArr[ii] = a;                   
                }else{
                        cArr.push(a);
                }
                c = cArr.join(',');
                setCookie(c_name,c,days);
        }else{
                setCookie(c_name,value+email,30);
        }
}
function log(str){
        if(typeof window.console!= 'undefined'){
                console.log(str);
        }
}
function addSelectBox(){
        /* 
        jQuery('.single select').selectbox({
                effect: "slide",
                onOpen: function() {},
                onClose: function() {}
        });     
        */ 
}
if(typeof getUrlVars != 'function'){
        function getUrlVars(){
                var vars = [];
                var loc =  window.location.search.substring(1);
                var hashes = loc.split('&');
                for(var i = 0; i < hashes.length; i++){
                                var hash = hashes[i].split('=');
                                vars.push(hash[0]);
                                vars[hash[0]] = hash[1];
                }
                return vars;
        }
}


