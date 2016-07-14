var local_forms = [];
var server_forms = [];
var cachedForms = {};
var monthNames  = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
var codeVersion = 3;

jQuery(document).ready(function($) {
        //Get initial Library list
        folderPermissions()
        getEloquaSearchList();
        
        jQuery('body').on('submit','.eloqua-imported',function(event){
                event.preventDefault();
        })
        jQuery('.eloqua-file .nav-tab').click(function(e){
                var id = jQuery(e.target).attr('id');
                jQuery('.eloqua-file .nav-tab').removeClass('nav-tab-active');
                jQuery(e.target).addClass('nav-tab-active');
                jQuery('.elequa-tab').hide();
                jQuery('#'+id+'.elequa-tab').show();
        })
        jQuery('.button.eloqua.form').click(function(e){
                e.preventDefault();
                getEloquaSearchList();
                jQuery('#eloqua-form-uploader').show();
        })
        jQuery('#eloqua-form-uploader .media-modal-close, #eloqua-form-uploader .media-modal-backdrop').not('.close-form').click(function(){
                jQuery('#eloqua-form-uploader').hide();
        })
        //Library tab
        jQuery('.eloqua-file #lib.nav-tab').click(function(){
                if(jQuery('.eloqua-file #filelist').html()==''){
                        getEloquaSearchList();
                }
        });
        jQuery('.eloqua-file #pages.nav-tab').click(function(){
                findCodePages()
        });
        //Uploads tab
        jQuery('.eloqua-file-plus #form-upload').change(function(evt){
                jQuery('.eloqua-file-plus #filelist').addClass('waiting')
                
                for(var fi=0;fi<evt.target.files.length;fi++){
                        var f = evt.target.files[fi];
                        readFormFile(f,function(txt){
                                saveLocalForm(f.name, txt, function(obj){
                                        var str = tmp.postbox(obj)
                                        local_forms.push(obj)
                                        jQuery('.eloqua-file-plus #filelist').append(str);
                                        jQuery('.eloqua-file-plus #filelist').removeClass('waiting')
                                });
                        })
                }
        })
        jQuery('body').on('change','.util.reload-util #form-upload',function(evt){
                jQuery(evt.target).parents('.util .outer').append('<div class="waiting"></div>');
                fixUtilHeight(evt.target);
                var file = evt.target.files[0];
                readFormFile(file,function(txt){
                        var p = jQuery(evt.target).parents('.postbox');
                        var id = jQuery(p).attr('id').replace(/form/g,'');
                        var localdata = jQuery(p).find('#local-data:checked').length==1;                
                        importEloquaForm(txt,p,false,localdata);
                })
        })
        function readFormFile(file,callback){
                if(file){                       
                        var r = new FileReader();
                        r.onload = function(e){
                                callback(e.target.result);      
                        };
                        r.readAsText(file);
                }
        }
        jQuery('body').on('input','.eloqua-file-plus #filename',function(){
                jQuery(this).val(jQuery(this).val().replace(/[^a-zA-Z0-9_ -.]/g,''))
        })
        //Text input Tab
        jQuery('body').on('click','.eloqua-file-plus #text-btn',function(){             
                jQuery('.up-inst-text').hide();
                var fn  = jQuery('.eloqua-file-plus #filename').val();
                var con = jQuery('.eloqua-file-plus textarea').val();
                if(fn && con){
                        jQuery('.eloqua-file-plus #filelist').prepend('<div class="waiting"></div>')
                        saveLocalForm(fn,con,function(obj){
                                var str = tmp.postbox(obj)
                                local_forms.push(obj)
                                jQuery('.eloqua-file-plus #filelist').prepend(str);
                                jQuery('.eloqua-file-plus #filelist .waiting').remove();
                                jQuery('.eloqua-file-plus #filename').val('');
                                jQuery('.eloqua-file-plus textarea').val('');
                        });
                }else{
                        jQuery('.eloqua-file-plus .up-inst-text').show()        
                }
        });
        jQuery('body').on('click','.util.reload-util #text-btn',function(evt){          
                jQuery('.up-inst-text').hide();
                var txt = jQuery('.util.reload-util textarea').val();
                if(txt){
                        jQuery(evt.target).parents('.util .outer').append('<div class="waiting"></div>');
                        fixUtilHeight(evt.target);
                        var p = jQuery(evt.target).parents('.postbox');
                        var localdata = jQuery(p).find('#local-data:checked').length==1;                
                        importEloquaForm(txt,p,false,localdata);
                }else{
                        jQuery('.util.reload-util .up-inst-text').show()        
                }
        });
        //Show search close btn on input 
        jQuery('body').on('input','#form-get',function(){
                if(jQuery(this).val()){
                        jQuery(this).parents('.inner-get').addClass('hastext'); 
                }else{
                        jQuery(this).parents('.inner-get').removeClass('hastext');
                }
        });
        //Clear search and show the local forms
        jQuery('.clear-srch').click(function(){
                jQuery('#form-get').val('')
                jQuery(this).parents('.inner-get').removeClass('hastext');
                getEloquaSearchList();
        })
        //Interface: Main:  Search Eloqua and local and show form list
        jQuery('#get-btn').click(function(){
                var id  = jQuery('#form-get').val();
                getEloquaSearchList(id)
        })
        //Interface: Form Edit Icons: remove propegation
        jQuery('body').on('click','.view-form',function(e){
                e.stopPropagation();
        });
        //Interface: Post Box: Toggle open
        jQuery('body').on('click','.postbox .topbar,.form-time,.form-name,.local-copy',function(e){
                var t = jQuery(e.target).hasClass('postbox')? e.target : jQuery(e.target).parents('.postbox');
                fixUtilHeight(jQuery(t).find('#importformhold'),'close');
        });
        //Interface: Form Edit Icons: Code, View, Edit, Refresh, Delete, Download
        jQuery('body').on('click','.view-form:not([data-action=open],[data-action=save])',function(e){
                e.preventDefault();
                
                var box = jQuery(this).parents('.postbox');
                var hold = jQuery(box).find('#importformhold');
                var isActive = jQuery(this).hasClass('active'); 
                
                jQuery(box).find('.view-form, .util').removeClass('active');
                fixUtilHeight(hold,true);
                if(!isActive){
                        jQuery(hold).addClass('open waiting')
                        jQuery(this).addClass('active')
                        switch(jQuery(this).attr('data-action')){
                                case 'code':
                                findShortcodes(box,jQuery(box).attr('data-form-name'));
                                showUtil('.code-util')
                                break;  
                                
                                case 'view':
                                list_viewForm(box,false,function(){
                                        showUtil('.form-util')
                                });
                                break;
                                
                                case 'edit':
                                list_viewForm(box,true,function(){
                                        showUtil('.form-util')
                                });
                                break;
                                
                                case 'update':
                                showUtil('.reload-util');
                                break;
                                
                                case 'refresh':
                                showUtil('.update-util');
                                break;
                                
                                case 'delete':
                                showUtil('.delete-util');
                                break;
                                
                                case 'lock':
                                showUtil('.lock-util');
                                break;
                                
                                case 'download':
                                showUtil('.download-util');
                                var id = jQuery(box).attr('id').replace(/form/g,'')
                                importEloquaForm(id,box)
                                break;
                                
                                case 'migrate':
                                showUtil('.migrate-util');
                                //importEloquaForm(box)
                                break;
                        }
                }else{
                        fixUtilHeight(hold,'close')
                }
                function showUtil(activate){
                        jQuery(hold).removeClass('waiting')
                        if(activate) jQuery(hold).find(activate).addClass('active');
                        //var h = jQuery(hold).find('.active').outerHeight(true);
                        //jQuery(hold).find('.inner').stop().animate({height:h});
                        fixUtilHeight(jQuery(hold).find('.active'),true);
                }
                function list_viewForm(box,edit,callback){
                        var id = jQuery(box).attr('id')
                        if(jQuery(box).find('form').length>0){
                                showdis()
                        }else{
                                var name = jQuery(box).attr('data-form-name')
                                
                                var f = _.find(local_forms,function(fr){
                                        return fr.id == id;
                                })
                                if(f && f.hasOwnProperty('fulldata')){
                                        cachedForms['form'+id] = f.fulldata
                                        loaded(f.fulldata);
                                }else{
                                        loadFormJson(name,loaded);
                                }
                                function loaded(data){
                                        var str = buildFormStructure(data)
                                        jQuery(box).find('#importformhold .form-util .outer').html( tmp.formEdit() )
                                        jQuery(box).find('#importformhold .form-util .outer').append(str);
                                        jQuery(box).find('#importformhold .form-util').addClass('active');
                                        addSelectBox();
                                        showdis();
                                }
                        }
                        function showdis(){
                                addFormEdits( jQuery(box).find('form'));
                                if(!edit) jQuery(box).find('form').removeClass('admin-edit')                            
                                if(callback)callback();
                        }
                }
        })
        jQuery('body').on('click','.form-view-option.page',function(){
                var box = jQuery(this).parents('.postbox');
                jQuery(box).find('.form-view-option').removeClass('open')
                jQuery(this).addClass('open')
                jQuery(box).find('form').removeClass('admin-edit')
        })
        jQuery('body').on('click','.form-view-option.edit',function(){
                var box = jQuery(this).parents('.postbox');
                jQuery(box).find('.form-view-option').removeClass('open')
                jQuery(this).addClass('open')
                jQuery(box).find('form').addClass('admin-edit');
        })
        jQuery('body').on('click','.form-view-option.save',function(){
                var box = jQuery(this).parents('.postbox')
                var p = jQuery(box).find('#importformhold')
                var html = cachedForms[jQuery(p).find('form').attr('id')]       
                var t = jQuery(box).find('.save-form .title');
                jQuery(box).addClass('.disable');               
                jQuery(t).html('SAVING FORM')
                jQuery(box).find('.save-form').stop().animate({height: jQuery(t).outerHeight(true), opacity: 1},500,function(){
                        var formId = 'form'+html.id
                        cachedForms[formId] = html;
                        saveLocalForm(html.htmlName,html,function(str){
                                setUnsavedEdit(p,false)
                                jQuery(t).html('FORM SAVED')
                                jQuery(box).find('.save-form').delay(1200).stop().animate({opacity: 0,height:0},3000);                          
                                jQuery(box).removeClass('.disable');
                        });
                });
        })
        jQuery('body').on('click','#confirm-migrate',function(){
                var box  = jQuery(this).parents('.postbox');
                var name = jQuery(box).attr('data-form-name');
                var path = '/wp-content/uploads/forms/'+name+'.html';
                
                jQuery.get(path,function(html){
                        var nHtml = jQuery('<div>'+html+'</div>')
                        var isResponso = html.indexOf('response-o-matic.com') != -1;
                        var target =  !isResponso? jQuery(nHtml).find('form').attr('id').replace(/form/g,'') : html;    
                        if(target){
                                importEloquaForm(target,box,function(obj){
                                        if(!isResponso && obj.name != name){
                                                removeForm(name);
                                        }
                                })
                        }else{
                                jQuery(box).find('.download-util .outer').append('<h3>ERROR! Could Not Migrate this form</h3>')
                                fixUtilHeight(jQuery(box).find('.download-util'));      
                        }
                })
        })
        //Interface: Form Edit Icons: Reload Form
        jQuery('body').on('click','#confirm-overwrite',function(){
                var p = jQuery(this).parents('.postbox');
                var id = jQuery(p).attr('id').replace(/form/g,'');
                var localdata = jQuery(p).find('#local-data:checked').length==1;                
                importEloquaForm(id,p,false,localdata);
        })
        //Interface: Form Edit Icons: Delete Form
        jQuery('body').on('click','#confirm-delete',function(e){
                removeFormUI(this)
        });
        //Interface: LOCK
        jQuery('body').on('click','#confirm-lock',function(){
                
                var p = jQuery(this).parents('.postbox')
                jQuery(p).addClass('locked');
                var name = jQuery(p).attr('data-form-name')
                lock_unlock(name,true);         
                
        })
        
        //Interface: UN-LOCK
        jQuery('body').on('click','#confirm-unlock',function(){
                var p = jQuery(this).parents('.postbox')
                jQuery(p).removeClass('locked');
                var name = jQuery(p).attr('data-form-name')
                lock_unlock(name,false)
        })
        function lock_unlock(name,lock){
                var form  = _.find(local_forms,function(i){
                        return i.name == name;
                });
                if(form){
                        if(typeof form.fulldata != 'object'){
                                form.fulldata = {}
                        }
                        if(lock){
                                form.fulldata.locked = true;
                        }else{
                                delete form.fulldata.locked;
                        }
                        if(form.hasOwnProperty('id') && form.id){
                                var cForm = cachedForms['form'+form.id]
                                if(lock && cForm){
                                        cForm.locked = true
                                }else if(cForm){
                                        delete cForm.locked;    
                                }
                        } 
                        sendData(name,JSON.stringify(form.fulldata),function(response){
                                        //sendIt2(filename, sent.text, call);
                        })
                }
        }
        
        jQuery('body').on('click','.show-sc,.hide-sc',function(e){
                e.preventDefault()
                jQuery(this).parents('.shortcode-query').find('.show-sc,.hide-sc,.code-hold').toggle();
                fixUtilHeight(this,true);
        })
        jQuery('body').on('click','.admin-editor',function(){
                jQuery(this).css({'visibility':'hidden'})
                var hold = jQuery(this).parents('#importformhold');
                var field = jQuery(this).parents('.elq-field');
                jQuery(field).addClass('editing');
                jQuery(field).find('.admin-tools').stop().animate({height:27,opacity:1},300,function(){
                        jQuery(field).find('.admin-tools').css({height:'auto'})
                        fixUtilHeight(field,true);
                })
        });
        jQuery('body').on('click','.tool.close',function() {
                var hold = jQuery(this).parents('#importformhold');
                var field = jQuery(this).parents('.elq-field');
                if(jQuery(field).find('.admin-tools .on').length>0){
                        jQuery(field).find('.admin-editor').addClass('hasedit')
                }else{
                        jQuery(field).find('.admin-editor').removeClass('hasedit')
                }
                jQuery(field).removeClass('editing');
                jQuery(field).find('.admin-editor').css({'visibility':'visible'})
                jQuery(field).find('.admin-tools').stop().animate({height:2,opacity:0},300,function(){
                        fixUtilHeight(field)
                })
        });     
        
        
        //EDIT UI: Admin Tools: Click to open options or add classes
        jQuery('body').on('click','.tool.indent',function() {
                makeFormAdjustment('indent',this)
    })
        jQuery('body').on('click','.tool.progress',function() {
                makeFormAdjustment('progress',this)
    })
    jQuery('body').on('click','.tool.hide',function() {
                makeFormAdjustment('hide',this)
    })
        jQuery('body').on('click','.tool.column',function() {
                makeFormAdjustment('column',this,false,true);
    });
        jQuery('body').on('click','.tool.tooltip',function() {
                makeFormAdjustment('tooltip',this,false,true);
    })
    jQuery('body').on('click','.tool.valid',function() {
        makeFormAdjustment('valid',this,false,true);
    })
        jQuery('body').on('click','.tool.reset',function() {
        makeFormAdjustment('reset',this,false,true);
    })
        jQuery('body').on('click','.tool.format',function() {
                makeFormAdjustment('format',this,false,true);
    })
        //EDIT UI: Admin Tools: Detect enter info and apply to form cache
        jQuery('body').on('input','.tray-tooltip textarea',function(event) {
                var toolbtn = jQuery(this).parents('.admin-tools').find('.tool.tooltip');
                makeFormAdjustment('tooltip',toolbtn,function(tool,field){
                        return Boolean(jQuery(event.target).val());
                });
        });
        jQuery('body').on('input','.validtext, .validcount',function(event) {
                var toolbtn = jQuery(this).parents('.admin-tools').find('.tool.valid');
                makeFormAdjustment('valid',toolbtn,function(tool,field){
                        return  Boolean(jQuery(field).find('.validtext').val());
                });
        });
        jQuery('body').on('change','.tray-column select',function(event){
                var toolbtn = jQuery(this).parents('.admin-tools').find('.tool.column');
                makeFormAdjustment('column',toolbtn,function(tool,field){
                        return  Boolean(jQuery(event.target).val());
                });
        });
        jQuery('body').on('input','#resetbtn-text',function(event) {
                var toolbtn = jQuery(this).parents('.admin-tools').find('.tool.reset');
                makeFormAdjustment('reset',toolbtn,function(tool,field){
                        return  Boolean(jQuery(event.target).val());
                });
        });
        jQuery('body').on('change','#new-format',function(event){
                var toolbtn = jQuery(this).parents('.admin-tools').find('.tool.format');
                makeFormAdjustment('format',toolbtn,function(tool,field){
                        return  jQuery(event.target).val()? 'change':'restore';
                });
        });
        //Shortcode UI: Update shortcode on user input
        jQuery('body').on('input','.code-util textarea',function(e){
                updateShortcode(this)
        });
        jQuery('body').on('click','#progressive-fields',function(e){
                updateShortcode(this)
        });
        //Shortcode UI: Select Submit option & show visibility
        jQuery('body').on('click','.submit-option',function(){
                var p = jQuery(this).parents('.util');
                jQuery(p).find('.submit-option').removeClass('open');
                jQuery(p).find('.sc-panel').hide();
                jQuery(this).addClass('open');
                var t = jQuery(this).attr('data-type');
                var d = jQuery(p).find('[data-action='+t+']').show();
                updateShortcode(this);
                fixUtilHeight(this);
        });
        jQuery('body').on('click','.form-manual-option',function(){
                var action = jQuery(this).attr('data-action')
                var tab = jQuery(this).parents('.elequa-tab')
                jQuery(tab).find('.form-manual-option').removeClass('open')
                jQuery(this).addClass('open')
                jQuery(tab).find('.upload-panel').hide();
                jQuery(tab).find('.upload-panel.'+action).show();
                fixUtilHeight(this);
        });
});
function formatName(name){
        var pose = name.indexOf('.');
        name = name.toLowerCase();
        if(pose!=-1) name = name.substring(0,pose);
        name = name.replace(/[^a-zA-Z0-9_ -.]/g,'');
        return name.replace(/ /g,'-');
}
function folderPermissions(){
        //dir_permissions
         jQuery.ajax({
        type: "GET",
        url: 'http://www.gsma.com/mobilefordevelopment/wp-admin/admin-ajax.php',
        data: {action: 'dir_permissions'},
        dataType: 'json',
        error: function(err){
                        log('error getting folder permissions')
                        log(err)
                },
        success: function(html){
                        log('folder permissions')
                        log(html)       
                }
    });
}
//Interface: Remove form and update interface
function removeFormUI(obj){
        var p = jQuery(obj).hasClass('.postbox')? obj : jQuery(obj).parents('.postbox')
        var name = jQuery(p).attr('data-form-name')
        removeForm(name,function(){
                var id = jQuery(p).attr('id')
                local_forms = _.reject(local_forms,function(i){
                        return i.id == id;
                });
                if(jQuery(p).hasClass('data') && !jQuery(p).hasClass('respo')){                 
                        jQuery(p).find('.local-copy').addClass('server')
                        jQuery(p).find('.form-time').html('')
                        jQuery(p).find('.form-edit-icons').html('<a class="view-form form-download" data-action="download" title="Import" href=""></a>')
                        jQuery(p).find('#importformhold').removeClass('open')
                        jQuery(p).find('#importformhold').stop().animate({height:0});                   
                }else{
                        jQuery(p).stop().animate({height:0,opacity:0},300,function(){
                                jQuery(p).remove();
                        })      
                }
        },function(){
                log('Error occured, could not delete form')     
        })
}
//Interface: Data: Get the loca modifications on a form
function getFormAdjustments(formid){
        var formid = formid.replace(/form/g,'');
        var data = {id:formid, elements:[]};
        var frm = _.find(local_forms,function(f){
                return f.id == formid;
        });
        if(frm){
                _.each(frm.fulldata.elements,function(e,i){
                        var p = e.localEdits;
                        p.id = e.id;
                        
                        //if(p.hasOwnProperty('validations') &&  !p.validations.hasOwnProperty('localmessage')){delete p.validations}
                        delete p.lockRequired
                        if(_.keys(p).length>1){ 
                                data.elements.push(p);
                        }
                });
                return data;
        }
        return false;
}
//Interface: Data: Import a form using rest
function importEloquaForm(target,postbox,callback,localData){
        var id = target;
        var isResponso = target.indexOf('response-o-matic.com') != -1;
        initDownload();
        
        if(isResponso){ 
                id = jQuery(postbox).attr('data-form-name')
                beginSave(id);
        }else{
                getEloquaForm(target,function(html){                    
                        target = html;
                        beginSave(html.htmlName);
                })
        }
        function beginSave(filename){
                var data = localData? getFormAdjustments(id) : false; //Local edits
                if(data && target.hasOwnProperty('elements')){
                        target.elements = _.map(target.elements,function(d){
                                var f = _.find(data.elements,function(e){
                                        return d.id == e.id;
                                })
                                
                                if(f) {
                                        //d.localEdits = d.localEdits ? d.localEdits : {};
                                        //d.localEdits = _.extend(d.localEdits,f);
                                        d.localEdits = f;
                                }
                                return d;
                        });
                }
                saveLocalForm(filename,target,function(obj){
                        finishUI(obj);
                        if(callback) callback(obj);
                });
        }
        function initDownload(){
                var hold = jQuery(postbox).find('#importformhold');
                jQuery(hold).find('.util').removeClass('active');
                jQuery(hold).find('.download-util').addClass('active');
                jQuery(hold).find('.outer').append('<div class="waiting"></div>')
                var h = jQuery(hold).find('.active').outerHeight(true);
                //jQuery(hold).find('.inner').stop().animate({height:h});
                
                fixUtilHeight(jQuery(hold).find('.active'),true);
                jQuery(postbox).addClass('mute')
                
        }
        function finishUI(obj){         
                jQuery(postbox).find('#importformhold .waiting').remove();
                setstatus('<h3>Form Imported</h3>');
                var str = jQuery(tmp.postbox(obj))
                var dl = jQuery(str).find('.download-util');
                jQuery(str).css({opacity:0})

                jQuery(str).find('#importformhold').addClass('open');
                jQuery(dl).html(jQuery(postbox).find('.download-util').clone().html());
                jQuery(dl).addClass('active');

                jQuery(postbox).delay(2000).animate({'opacity':0},800,function(){
                        //jQuery(str).find('#importformhold, #importformhold .inner').height(jQuery(postbox).find('#importformhold').height())
                        jQuery(str).find('#importformhold').height(jQuery(postbox).find('#importformhold').height())
                        jQuery(postbox).replaceWith(str)
                        jQuery(str).stop().animate({'opacity':1},800);
                });
        }
        function setstatus(txt){
                jQuery(postbox).find('.download-util .outer .info').append(txt)
                fixUtilHeight(jQuery(postbox).find('.download-util'));
        }
}
//Interface: UI: Shortcode: Update the shortcode in the UI
function updateShortcode(obj){
        var cu = jQuery(obj).parents('.code-util')
        if(cu.length>0){
                var txt = jQuery(cu).find('.sCodeTXT')
                var start = txt.attr('data-start');
                var end =       ']';
                var dt = jQuery( cu).find('.submitbar .submit-option.open').attr('data-type');
                var pf = jQuery(cu).find('#progressive-fields:checked').length == 0? ' progressive="false"' : ''
                
                switch(dt){
                        case 'newtab':
                        start+= ' target="_blank"';
                        break;
                        
                        case 'ajax':
                        start+= ' ajax="true"'
                        end+=   '[elq-success]'+jQuery(cu).find('#ajax-success-message').val().replace(/\n/g,'<br/>')+'[/elq-success]'+
                                        '[elq-fail]'+jQuery(cu).find('#ajax-fail-message').val().replace(/\n/g,'<br/>')+'[/elq-fail][/eloqua]';
                        break;
                        
                        case 'gate':
                        start+= ' gate="'+jQuery(cu).find('#gatelist').val().replace(/\n/g,',')+'"';
                        break;  
                }
                jQuery(txt).html(start+pf+end)  
                fixUtilHeight(cu);
        }
}
//Interface: UI: Fix the height of the importformhold based on the contents
function fixUtilHeight(obj,op){
        var hold = jQuery(obj).attr('id')=='importformhold'? obj : jQuery(obj).parents('#importformhold');
        var h = jQuery(hold).find('.active').outerHeight(true);
        if(op == 'close'){
                //jQuery(hold).removeClass('open');
                jQuery(hold).parents('.postbox').find('.view-form').removeClass('active');
                jQuery(hold).stop().animate({height:0},300);            
        }else{
                h = op? Math.max(h,50) : h;             
                //jQuery(hold).find('.inner').stop().animate({height:h},300)
                jQuery(hold).stop().animate({height:h},300)
        }
}
//Interface: Files: Find all the shortcodes in content in wordpress
function findShortcodes(box,name){
        if(jQuery(box).find('.code-hold').length==0){
                jQuery(box).find('.shortcode-query').addClass('waiting');
                callEloqua(name,function(html){
                        var str = tmp.shortcode_db(html);
                        jQuery(box).find('.shortcode-query').removeClass('waiting');
                        jQuery(box).find('.shortcode-query').html(str)
                },function(err){
                        log(err)        
                },'find_form_shortcode')
        }
}
//Interface: Files: Find all the shortcodes in content in wordpress
function findCodePages(){
        callEloqua(false,function(html){
                var str = tmp.shortcode_pages(html)
                jQuery('.eloqua-pages.shortcode-query').removeClass('waiting')
                jQuery('.eloqua-pages.shortcode-query').html(str)                       
        },function(err){
                log(err)        
        },'find_form_shortcode')
}
//Interface: Files: Ajax: Delete a form a data from the site 
function removeForm(id,callback,error){
    jQuery.ajax({
        type: "POST",
        url: '/wp-admin/admin-ajax.php',
        data: {action: 'remove_form','id':id},
        dataType: 'html',
        error: error,
        success: callback
    });
}
//Data: Conform local form data for template
function mapLocalForm(e,d){
        e.name =formatName(e.name);
        if(e.fulldata){
                e.fulldata = typeof e.fulldata == 'string'? JSON.parse(e.fulldata) : e.fulldata;
                e.id = e.fulldata.id;
                e.dataname = e.fulldata.name;
                //Map Legacy edit support
                e.fulldata.elements = _.map(e.fulldata.elements,function(m){
                        if(!m.hasOwnProperty('template')){
                                //legacy forms have no template name
                                m.template  = templateName(m)
                        }
                        if(!m.hasOwnProperty('localEdits')){ m.localEdits = {}}
                        var legacyedits = ['indent','tooltip','validcount','colcount','hide','resetButtonText','lockRequired','alt_template','progressive']
                        var p = _.pick(m,legacyedits);
                        if(Object.prototype.toString.call(m.validations) == '[object Array]' && m.validations.length > 0){
                                m.localEdits.lockRequired = true;
                        }
                        if(m.hasOwnProperty('validations') && m.validations.length>0 && !m.localEdits.lockRequired && !m.lockRequired){
                                //legacy validation
                                log('add in the localMessage')
                                m.localEdits.localMessage = m.validations[0].message;
                        }
                        if(m.hasOwnProperty('validations') && m.validations.length==0){ delete  m.validations;}
                        m.localEdits = _.extend(p,m.localEdits)
                        _.each(legacyedits,function(l){
                                delete m[l];
                        })
                        delete m.localEdits.localmessage;
                        delete m.columns;
                        delete m.multivalid;
                        delete m.changeFormat;
                        delete m.resetbtn;
                        delete m.valid;
                        m.tools = admin_tools.hasOwnProperty(m.template)? admin_tools[m.template] : {}
                        return m;
                });
        }
        if(Object.prototype.toString.call(d) == '[object Date]'){
                e.date = monthNames[d.getMonth()]+' '+d.getDate()+' '+d.getFullYear()+' '+d.getHours()+':'+d.getMinutes()+':'+d.getSeconds(),
                e.time = d.getFullYear()+'-'+d.getMonth()+'-'+d.getDate()+'-'+d.getHours()+':'+d.getMinutes()+':'+d.getSeconds()        
        }
        return e;
}
//Interface: String: Return an array of transformed search entities
function searchEntities(str) {
    str = str.toLowerCase();
    str = str.replace(/[^\w\s]/gi, ' ');
    str = str.replace(/\t/g, ' ');
    str = str.replace(/  /g, ' ');
    return str.split(' ');
}
//Interface: Data: Assign a value to a search match 
function search_algo(f, term) {
        var mach = 0;
    var srch = searchEntities(term);
    var name = searchEntities(f.name);
    _.each(srch, function (s) {
        s = jQuery.trim(s)
        _.each(name, function (n) {
            n = jQuery.trim(n)
            if (n.indexOf(s) != -1) {mach++;}
            if (n.indexOf(s) === 0) {mach++;}
            if (n == s) {mach++;}
            if (f.id == s) {mach += 2;}
        });
    });
    if (mach > 0 && !f.server) mach++;
    return mach;
}
//Interface: Data: Return a relevance based sorted filtered form list
function searchData(data,t,sortfields){
    var npad = '0000000000';
    var newData = _.clone(data);
    _.each(newData, function (d) {
        d.m = search_algo(d, t)
    });
    newData = _.sortBy(newData,function(obj){
        var sortf = npad.substring(String(obj.m).length)+obj.m;
        _.each(sortfields,function(sf){
            if(obj.hasOwnProperty(sf)){
                sortf+='_'+obj[sf];   
            }
        });
                return sortf;  
    })
    newData = _.filter(newData,function(dd){
        return dd.m > 0; 
    });
    return newData.reverse();
}
//Interface: UI: Build the form list, filters with search if provided
function addLibraryItems(srch){
        var srchforms = server_forms.concat(local_forms)
        if(srch){
                srch = srch.toLowerCase();
                srchforms = searchData(srchforms,srch,['time','name'])
        }
        jQuery('.eloqua-file-list #filelist').html('')
        if(srchforms.length){           
                _.each(srchforms,function(e){
                        var str = tmp.postbox(e)
                        jQuery('.eloqua-file-list #filelist').append(str)
                });
        }else{
                var message = srch? '<p>No forms found with name or id: "'+srch+'".</p>' : '<p>No forms found.</p>';
                jQuery('.eloqua-file-list #filelist').html(message);
        }
}

function saveLocalForm(filename,content,callback,fromEloqua){
        //Filename: filename or id to get from eloqua
        //content is the html, object, or local data changes
        var sent = {data:false,text:''}
        if(typeof content == 'object'){
                sent.data = content;
                sent.data.version = codeVersion;
                sent.text = buildFormStructure(content);
                sent.text = sent.text[0].outerHTML;
                saveHere();
        }else if(content.indexOf('response-o-matic.com') != -1 && content.indexOf('field-wrapper') != -1){
                log('VERSION 2')
                sent = parseVersionTwo(content,filename);
                saveHere();
        }else if(content.indexOf('response-o-matic.com') != -1){
                log('VERSION 3')
                sent = parseResponso(content,filename);
                saveHere();
        }else{
                log('DEFAULT')
                sent.text = parseEloquaHtml(filename,content);
                saveHere();
        }
        function saveHere(){
                if(sent.data){
                        sendData(filename,JSON.stringify(sent.data),function(response){
                                sendIt2(filename, sent.text, call);
                        })      
                }else{
                        sendIt2(filename, sent.text, call);
                }
        }
        function call(){
                var obj = {
                        'data':Boolean(sent.data != false),
                        'fulldata':sent.data,
                        'id':sent.data? sent.data.id : false,
                        'name':filename,
                        'string':sent.text
                }
                obj = mapLocalForm(obj,new Date());
                var i = -1;
                var fi = _.find(local_forms,function(f){
                        i++
                        return f.id == sent.data.id;
                });
                if(fi){
                        local_forms[i] = obj
                        if(cachedForms.hasOwnProperty('form'+obj.id)){
                                delete cachedForms['form'+obj.id]
                        }
                }else{
                        local_forms.push(obj);  
                }
                if(callback)callback(obj)       
        }
}
//Interface: File: Get Form data file contents
function loadFormJson(name,callback){
        jQuery.get('/wp-content/uploads/forms/data/'+name+'.json',function(html){
                var formId = 'form'+html.id
                if(!html.htmlName){
                        html.htmlName = name;
                }
                cachedForms[formId] = html
                callback(html)  
        })
}

function parseEloquaHtml(filename, content) {
        content = content.replace(/(<script)(.*?)(<\/script>)/gi, '<sometag$2</sometag>');
    var contents = jQuery(content);
    jQuery(contents).find('*').removeAttr('style');
        jQuery(contents).find('.field-wrapper input[type=checkbox]').each(function(index, element) {
        var par = jQuery(element).parents('.form-design-field')
                if(jQuery(par).find('input[type=checkbox]').length>1){
                        jQuery(par).addClass('checkgroup')
                }else{
                        jQuery(par).addClass('checkbox');       
                }
    });
        jQuery(contents).find('.field-wrapper select').parents('.field-wrapper').addClass('select');
    jQuery(contents).find('.field-wrapper input[type=hidden]').parents('.field-wrapper').addClass('hidden');
        var newContent =  contents[0].outerHTML.replace(/(<sometag)(.*?)(<\/sometag>)/gi, '<script$2</script>');
    return newContent;
}
//Parse Respons-0-matic form using template version 2
function parseVersionTwo(content,name){
        var contents = jQuery(content);
        var c2 = jQuery('<div>'+content+'</div>')
        if(jQuery(c2).find('form').length>0){
                contents = jQuery(c2).find('form').first();
        }
        
        var formname = formatName(name);
        var formData = {'target':'_blank','action':'http://www.response-o-matic.com/mail.php','responsomatic':'true','name':formname,'id':formname,'htmlName':formname,'elements':[],'type':'form'}
        if(jQuery(contents).find('[name=formid]').length>0){
                formData.id = jQuery(contents).find('[name=formid]').val()
        }
        var req = jQuery(contents).find('[name=required_vars]').val();
        if(req) req = req.split(',');
        jQuery(contents).find('input[type=hidden]').not('[name=required_vars]').each(function (index, hid) {
                var hidObj = {};
                hidObj.name = jQuery(hid).attr('name');
                hidObj.htmlName = jQuery(hid).attr('name');
                hidObj.id = jQuery(hid).attr('id');
                hidObj.defaultValue = jQuery(hid).val();
                hidObj.displayType = 'FormField_hidden';
                formData.elements.push(hidObj); 
        });
        jQuery(contents).find('.field-wrapper').each(function (index, fw) {
                var elObj                       = {validations:[]};
                var target                      = jQuery(fw).find('input,textarea,select').first();
                elObj.name                      = jQuery(fw).find('label').text().trim();
                elObj.name                      = elObj.name.replace(/\*/g,'')
                elObj.htmlName          = jQuery(target).attr('name');
                elObj.id                        = jQuery(target).attr('id');
                elObj.type                      = 'FormField';
                elObj.displayType       = jQuery(target)[0].nodeName.toLowerCase();
                if(jQuery(fw).find('[type=checkbox]').length >1){
                        elObj.displayType       = 'checkboxList';
                        elObj.id                        = elObj.id.substring(0,elObj.id.indexOf('_'))
                        elObj.optionListId      = index;
                        elObj.options           = {elements:[],id:index,name:elObj.name};
                        var str = jQuery(fw).find('.inner-field').text()
                        str = str.replace(/\t/g,'')
                        str = str.replace(/<br\/>/g,'');
                        str = str.replace(/<br>/g,'');
                        strArr = str.split('\n');
                        strArr = _.map(strArr,function(s){
                                return s.trim();
                        })
                        strArr = _.compact(strArr);
                        jQuery(fw).find('[type=checkbox]').each(function(index, option) {
                var opobj = {};
                                opobj.id = jQuery(option).attr('id');
                                opobj.value = jQuery(option).val();
                                opobj.displayName = strArr[index];
                                elObj.options.elements.push(opobj)
            });
                }else if(jQuery(fw).find('[type=checkbox]').length == 1){
                        elObj.displayType = 'checkbox';
                }else if(jQuery(fw).find('[type=file]').length == 1){
                        elObj.displayType = 'file';
                }else if(jQuery(fw).find('[type=radio]').length == 1){
                        elObj.displayType = 'radio';
                        elObj.id                        = elObj.id.substring(0,elObj.id.indexOf('_'))
                        elObj.optionListId      = index;
                        elObj.options = {elements:[],id:index,name:elObj.name};
                        jQuery(fw).find('[type=radio]').each(function(index, option) {
                var opobj = {};
                                opobj.id = jQuery(option).attr('id');
                                opobj.value = jQuery(option).val();
                                opobj.displayName = jQuery(option).text().trim()
                                elObj.options.elements.push(opobj)
            });
                }else if(jQuery(fw).find('input[type=submit]').length == 1){
                        elObj.displayType = 'submit'
                        elObj.htmlName = jQuery(fw).find('input[type=submit]').val()
                        elObj.id = jQuery(fw).find('input[type=submit]').val().trim()
                        elObj.name= jQuery(fw).find('input[type=submit]').val().trim()
                }else if(jQuery(fw).find('select').length == 1){
                        elObj.displayType = 'singleSelect';
                        elObj.options = {elements:[],id:index,name:elObj.name};
                        jQuery(fw).find('option').each(function(index, option) {
                var opobj = {};
                                opobj.id = jQuery(option).attr('id');
                                opobj.value = jQuery(option).val();
                                opobj.displayName = jQuery(option).text().trim();                               
                                elObj.options.elements.push(opobj);
            });
                }
                var require= _.find(req,function(r){
                        return r == elObj.id;
                })
                if(require){
                        elObj.validations.push({'condition':{'type':'IsRequiredCondition'},'isEnabled':'true','message':'This field is required'})
                        if(elObj.name.toLowerCase().indexOf('email')!=-1 ||elObj.htmlName.toLowerCase().indexOf('email')!=-1){
                                elObj.validations.push({'condition':{'type':'IsEmailAddressCondition'},'isEnabled':'true','message':'Please enter a valid email address'})
                        }
                        elObj.localEdits = {}
                        elObj.localEdits.lockRequired = true;
                }
                formData.elements.push(elObj);
        })
        formData.version = codeVersion
        var str = buildFormStructure(formData);
        return {'data':formData, 'text':str[0].outerHTML}

}
function parseResponso(content, name) {
        var contents = jQuery(content);
        var c2 = jQuery('<div>'+content+'</div>')
        if(jQuery(c2).find('form').length>0){
                contents = jQuery(c2).find('form').first();
        }
        var formname = formatName(name);
        var formData = {'target':'_blank','action':'http://www.response-o-matic.com/mail.php','responsomatic':'true','name':formname,'id':formname,'htmlName':formname,'elements':[],'type':'form'}
        if(jQuery(contents).find('[name=formid]').length>0){
                formData.id = jQuery(contents).find('[name=formid]').val()
        }
        var req = jQuery(contents).find('[name=required_vars]').val();
        if(req){
                req = req.split(',');
                jQuery(contents).find('input[type=hidden]').each(function (index, hid) {
                        if(jQuery(hid).attr('name') != 'required_vars'){
                                var hidObj = {};
                                hidObj.name = jQuery(hid).attr('name');
                                hidObj.htmlName = jQuery(hid).attr('name');
                                hidObj.id = jQuery(hid).attr('id');
                                hidObj.defaultValue = jQuery(hid).val();
                                hidObj.displayType = 'FormField_hidden';
                                formData.elements.push(hidObj); 
                        }
                });
        }
        jQuery(contents).find('tr').each(function (index, tr) {
                var elObj                       = {validations:[]};
                var target              = jQuery(tr).find('td').length==1? jQuery(tr).find('td:first-child').children().first() : jQuery(tr).find('td:nth-child(2)').children().first();
                elObj.name                      = jQuery(tr).find('td:first-child').text().trim();
                elObj.name                      = elObj.name.replace(/\*/g,'')
                elObj.htmlName          = jQuery(target).attr('name');
                elObj.id                        = jQuery(target).attr('id');
                elObj.type                      = 'FormField';
                elObj.displayType       = jQuery(target)[0].nodeName.toLowerCase();
                if(jQuery(tr).find('[type=checkbox]').length >1){
                        elObj.displayType       = 'checkboxList';
                        elObj.id                        = elObj.id.substring(0,elObj.id.indexOf('_'))
                        elObj.optionListId      = index;
                        elObj.options           = {elements:[],id:index,name:elObj.name};
                        var str = jQuery(target).parent('td').text().replace(/\t/g,'')
                        strArr = str.split('\n');
                        strArr = _.map(strArr,function(s){
                                return s.trim();
                        })
                        strArr = _.compact(strArr);
                        jQuery(tr).find('[type=checkbox]').each(function(index, option) {
                var opobj = {};
                                opobj.id = jQuery(option).attr('id');
                                opobj.value = jQuery(option).val();
                                opobj.displayName = strArr[index];
                                elObj.options.elements.push(opobj)
            });
                }else if(jQuery(tr).find('[type=checkbox]').length == 1){
                        elObj.displayType = 'checkbox';
                }else if(jQuery(tr).find('[type=file]').length == 1){
                        elObj.displayType = 'file';
                }else if(jQuery(tr).find('[type=radio]').length == 1){
                        elObj.displayType = 'radio';
                        elObj.id                        = elObj.id.substring(0,elObj.id.indexOf('_'))
                        elObj.optionListId      = index;
                        elObj.options = {elements:[],id:index,name:elObj.name};
                        jQuery(tr).find('[type=radio]').each(function(index, option) {
                var opobj = {};
                                opobj.id = jQuery(option).attr('id');
                                opobj.value = jQuery(option).val();
                                opobj.displayName = jQuery(option).text().trim()
                                elObj.options.elements.push(opobj)
            });
                }else if(jQuery(tr).find('input[type=submit]').length == 1){
                        elObj.displayType = 'submit'
                        elObj.htmlName = jQuery(tr).find('input[type=submit]').val()
                        elObj.id = jQuery(tr).find('input[type=submit]').val().trim()
                        elObj.name= jQuery(tr).find('input[type=submit]').val().trim()
                }else if(jQuery(tr).find('select').length == 1){
                        elObj.displayType = 'singleSelect';
                        elObj.options = {elements:[],id:index,name:elObj.name};
                        jQuery(tr).find('option').each(function(index, option) {
                var opobj = {};
                                opobj.id = jQuery(option).attr('id');
                                opobj.value = jQuery(option).val();
                                opobj.displayName = jQuery(option).text().trim();                               
                                elObj.options.elements.push(opobj);
            });
                }
                var require= _.find(req,function(r){
                        return r == elObj.id;
                })
                if(require){
                        elObj.validations.push({'condition':{'type':'IsRequiredCondition'},'isEnabled':'true','message':'This field is required'})
                        if(elObj.name.toLowerCase().indexOf('email')!=-1 ||elObj.htmlName.toLowerCase().indexOf('email')!=-1){
                                elObj.validations.push({'condition':{'type':'IsEmailAddressCondition'},'isEnabled':'true','message':'Please enter a valid email address'})
                        }
                        elObj.localEdits = {};
                        elObj.localEdits.lockRequired = true;
                }
                formData.elements.push(elObj);
        })
        formData.version = codeVersion
        var str = buildFormStructure(formData);
        return {'data':formData, 'text':str[0].outerHTML}
}

function sendIt2(filename, content, callback) {
    var data = {
        'action': 'upload_form',
        'form': filename,
        'data': content
    };

    jQuery.post(ajaxurl, data, callback);

}
function sendIt(filename, content, tab) {
    var data = {
        'action': 'upload_form',
        'form': filename,
        'data': content
    };

    jQuery.post(ajaxurl, data, function(response) {
                jQuery(tab + ' #result .hold').removeClass('waiting')
                jQuery(tab + ' #result .hold').html('<div class="postbox">'+response+'<div id="importformhold" class="wp-core-ui"></div></div>')
        });

}
function sendData(filename, content,callback) {
        var data = {
        'action': 'upload_data',
        'form': filename,
        'data': content
    };
    jQuery.post(ajaxurl, data, callback);

}


/*======================================
        New Form Actions
======================================*/





//Adjust a form in the local cache with data
function localFormAdjustment(formid,fieldid,data){
        var form = cachedForms[formid];
        var field = _.find(form.elements,function(f){
                return fieldid == f.id
        });
        _.each(_.keys(data),function(k){
                if(data[k]){
                        field.localEdits[k] = data[k]   
                }else{
                        /*if(k=='validations'){
                                if(field.localEdits.hasOwnProperty('validations')){
                                        delete field.localEdits[k][0].localmessage;
                                }
                        }else{
                                delete field.localEdits[k];
                        }*/
                        delete field.localEdits[k];
                }
        });
        return field;
}
//Add a local adjustment to the form UI and form cache
function makeFormAdjustment(method,tool,condition,toggle){
        var field   = jQuery(tool).parents('.elq-field');
        var formid  = jQuery(tool).is('form')? jQuery(tool).attr('id') : jQuery(tool).parents('form').attr('id');
        var fieldid = jQuery(field).attr('id').replace(/elq-/g,'');
        var tray        = jQuery(field).find('.tray-'+method);
                
        jQuery(tool).parents('.admin-tools').find('.tool').not('.'+method).removeClass('open');
    jQuery(tool).parents('.admin-tools').find('.tray').not('.tray-'+method).hide();
        if(!condition && !toggle) jQuery(tool).toggleClass('on'); 
        var check   = condition? condition(tool,field) : jQuery(tool).hasClass('on');
        if(tray.length>0 && toggle) {
                jQuery(tool).toggleClass('open'); 
                jQuery(tray).toggle()
        }
        switch(method+'_'+check){
                case 'indent_true':
                jQuery(field).addClass('indent')
                adjustThis({'indent':true})
                setUnsavedEdit(field,true)
                break;
                
                case 'indent_false':
                jQuery(field).removeClass('indent')
                adjustThis({'indent':false})
                break;
                
                case 'progress_false':
                adjustThis({'progressive':false})
                setUnsavedEdit(field,true)
                break;
                
                case 'progress_true':
                adjustThis({'progressive':'no'})
                setUnsavedEdit(field,true);             
                break;
                
                case 'hide_true':
                jQuery(field).addClass('hidefield')
                adjustThis({'hide':true});
                setUnsavedEdit(field,true);
                break;
                
                case 'hide_false':
                jQuery(field).removeClass('hidefield')
                adjustThis({'hide':false});
                break;
                
                case 'tooltip_true':
                var obj = {'tooltip': jQuery(field).find('#tooltip-text').val()};
                jQuery(tool).addClass('on');
        jQuery(field).addClass('tooltip');                      
                jQuery(field).find('.tooltip-hold').remove()
        jQuery(field).append( tmp.tooltip(obj) )
        adjustThis(obj);
                setUnsavedEdit(field,true);
                break;
                        
                case 'tooltip_false':
                jQuery(tool).removeClass('on');
        jQuery(field).removeClass('tooltip');
                jQuery(field).find('.tooltip-hold').remove()
                adjustThis({'tooltip': false});
                break;
                        
                case 'valid_true':
                var val  = jQuery(field).find('.validtext').val()
                var place = jQuery(field).find('.validtext').attr('placeholder')
                var cval = parseInt( jQuery(field).find('.validcount').val() );
                var obj  = {'validcount':cval,'localMessage':val}
                jQuery(field).find('.tool.valid').addClass('on');
                jQuery(field).addClass('IsRequiredCondition');
                jQuery(field).attr('data-valid-count',cval);
                jQuery(field).find('.message').remove()
                jQuery(field).append('<div class="message IsRequiredCondition" style="display:none">'+val+'</div>');
                adjustThis(obj);
                setUnsavedEdit(field,true);     
                break;
                
                case 'valid_false':
                jQuery(tool).removeClass('on');
        jQuery(field).attr('data-valid-count','');
                jQuery(field).removeClass('IsRequiredCondition');
                jQuery(field).find('.message').remove();
                adjustThis({'localMessage':false,'validcount':false})
                break;
                        
                case 'column_true':
                var val = jQuery(field).find('#cols').val();
                jQuery(field).find('.tool.column').addClass('on');
                jQuery(field).removeClass('on col-one col-two col-three');
                jQuery(field).addClass('col-'+val)
                adjustThis({'colcount':val});
                setUnsavedEdit(field,true);
                break;
                        
                case 'column_false':
                jQuery(field).find('.tool.column').removeClass('on');
                jQuery(field).removeClass('on col-one col-two col-three');
                adjustThis({'colcount':false})
                break;
                
                case 'reset_true':
                val = jQuery(field).find('#resetbtn-text').val();
                var obj = {'resetButtonText': val};
                jQuery(tool).addClass('on');
                jQuery(field).find('.reset-btn').val(val);
        adjustThis(obj);
                setUnsavedEdit(field,true);
                break;
                        
                case 'reset_false':
                jQuery(tool).removeClass('on');
                adjustThis({'resetButtonText': false});
                jQuery(field).find('.reset-btn').val('Reset');
                break;
                
                case 'format_change':
                var val = jQuery(field).find('#new-format').val();
                jQuery(tool).addClass('on');
                adjustThis({'alt_template':val},function(h){
                        jQuery(h).find('#new-format').val(val)
                        return h;
                })
                setUnsavedEdit(field,true);
                break;
                
                case 'format_false':
                jQuery(tool).removeClass('on');
                break;
                
                case 'format_restore':
                jQuery(tool).removeClass('on');
                adjustThis({'alt_template':false},function(h){
                        jQuery(h).find('#new-format').val('')
                        return h;       
                })
                break;
        }
        fixUtilHeight(field,true);
        
        function adjustThis(data,rebuild){
                var f = localFormAdjustment(formid,fieldid,data)
                if(rebuild){
                        var h = jQuery(buildFormElement(f))
                        
                        var admin = jQuery(field).find('.admin-editor')[0].outerHTML
                        var admin2 = jQuery(field).find('.admin-tools')[0].outerHTML
                        jQuery(h).prepend(admin2)
                        jQuery(h).prepend(admin)
                        if(typeof rebuild == 'function'){ 
                                h = rebuild(h);
                        }
                        jQuery(field).replaceWith(h);
                }
        }
}
function setUnsavedEdit(ter,unsaved){
        var p = jQuery(ter).parents('.postbox')
        jQuery(p).toggleClass('unsaved',unsaved)
        jQuery(p).find('.view-form.form-edit').attr('title',(unsaved? 'Unsaved Edit' : 'Edit'))
}
//Interface: UI: Add Admin tools to form
function addFormEdits(form){
    jQuery(form).addClass('admin-edit')
        var adjdata = getFormAdjustments(jQuery(form).attr('id'))
        var data    = cachedForms[jQuery(form).attr('id')]
        
    jQuery(form).find('.elq-field').each(function(index, element) {
                //jQuery(element).find('.admin-tools').length
        if(jQuery(element).find('.admin-tools').length==0 && jQuery(element).parents('.tray').length==0){
                        var id = jQuery(element).attr('id').replace(/elq-/g,'')
                        var f = _.find(data.elements,function(f){
                                return id == f.id
                        })
                        var fd = _.find(adjdata.elements,function(fd){
                                return id == fd.id
                        })
                        var type = jQuery(this).attr('data-type')
                        var str = tmp.admintools(f)                     
                        jQuery(this).prepend(str);
                        if(fd){
                                jQuery(element).find('.admin-editor').addClass('hasedit')
                        }
                }
    });
        
    
}
//Data: Util: Get query vars
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
//Data: Get Forms locally and From Eloqua server
function findForms(id,callback,errorcall){
        server_forms = [];
        var eCount = 0;
        var entities = id? entities = searchEntities(id) : [];
        var total = entities.length +1;
        if(local_forms.length==0){
                getLocalForms(countData)
        }else{
                countData();
        }
        _.each(entities,function(ent){
                callEloqua(ent,function(html){
                        var data = []
                        if(html != null && html.hasOwnProperty('type') && html.type.toLowerCase() == 'form'){
                                data = [html];
                        }else if(html != null && html.hasOwnProperty('elements') && html.elements.length>0){
                                data = html.elements;
                        }
                        server_forms = server_forms.concat(data);
                        countData();
                },errorcall);
        })
        function countData(){
                eCount++;
                if(eCount == total){
                        var local_ids = _.map(local_forms,function(l){
                                return l.id? l.id : 0;
                        })
                        local_ids = _.unique(local_ids);
                        
                        server_forms = _.map(server_forms,function(f){
                                var d    = new Date(f.updatedAt * 1000);
                                f.server = true;
                                f.time   = d.getFullYear()+'-'+d.getMonth()+'-'+d.getDate()+'00:00:00';
                                f.date   = monthNames[d.getMonth()]+' '+d.getDate()+' '+d.getFullYear()+' 00:00:00'
                                return f;
                        })
                        
                        server_forms = _.filter(server_forms,function(s){
                                var f = _.find(local_ids,function(fnd){
                                        return fnd == s.id;
                                })
                                return !f;
                        })
                        if(callback)callback();
                }       
        }
}
//Interface: Data: Retrieve all local Forms
function getLocalForms(callback){
        local_forms = [];
        jQuery.post(ajaxurl, {'action': 'list_dir'}, function(response) {
                //log(response)
                try{
                        response = JSON.parse(response)
                }catch(err){
                        log(err);
                        response = [];  
                }
                response = _.filter(response,function(e){
                        return e.name.length > 0;
                })
                local_forms = _.map(response,mapLocalForm);
                if(callback)callback();
        });
}
//Interface: Data: Search Eloqua and local forms and display
function getEloquaSearchList(id){
        jQuery('.eloqua-file-list #filelist').addClass('waiting');
        jQuery('.eloqua-file-list #filelist').html('')
        findForms(id,function(){
                jQuery('.eloqua-file-list #filelist').removeClass('waiting');
                addLibraryItems(id)
        },function(){
                jQuery('.eloqua-file-list #filelist').removeClass('waiting')
                var message = id? '<p>No forms found with name or id: "'+id+'".</p>' : '<p>No forms found.</p>';
                jQuery('.eloqua-get #filelist').html(message);
        })
}

function getEloquaForm(id,callback){
        callEloqua(id,function(html){
                if(html.hasOwnProperty('type') && html.type.toLowerCase() == 'form'){
                        var listcount  = _.filter(html.elements,function(c){
                                return c.hasOwnProperty('optionListId');
                        }).length;
                        if(listcount==0){
                                postDataFormat(html);
                                //if(callback) callback(html)   
                        }else{
                                _.each(html.elements,function(e){
                                        if(e.hasOwnProperty('optionListId')){
                                                getFieldList(e,function(obj){
                                                        listcount--;
                                                        e.options = obj
                                                        if(listcount==0){                                                       
                                                                delete html.html;
                                                                //postDataFormat(html)
                                                                if(callback) callback(html)     
                                                        }
                                                })
                                        }
                                })
                        }
                }else{
                        //if(status)status('<h3>No form found: </h3><p>No form found with name or id: "'+id+'"</p>');
                }       
        },function(err) {
                //if(status)status('<h3>No form found: </h3><p>No form found with  id #'+id+'</p>');
    });
        /*function postDataFormat(html){
                _.each(html.elements,function(e){
                        if(Object.prototype.toString.call(e.validations) == '[object Array]' && e.validations.length > 0){
                                e.lockRequired = true;
                        }
                });
                if(callback) callback(html)
        }*/
}
function getFieldList(e,callback){
        var id = e.optionListId;        
        callEloqua(id,function(html) {
                _.each(html.elements,function(j,ind,list){
                        j.id = e.htmlName+'-'+ind;
                });
                html.group = e.htmlName;
                if(callback) callback(html);
        },false,'eloqua_form_optionlist');
}
function callEloqua(id,callback,error,action){
        var action = action? action : 'eloqua_form_construct';
        var data = {action: action, id:id};
    var url = ajaxurl;
        jQuery.ajax({
        type: "GET",
        url: url,
        data: data,
                dataType: 'json',
        cache: false,           
                success:callback,
                error:function(err) {
                        log(err)
                        if(err.status == 404){
                                jQuery('.eloqua-get #info').html('<h3>Error: </h3><p>Requested url: '+url+' not found</p>')
                        }else if(err.status == 500){
                                jQuery('.eloqua-get #info').html('<h3>Error: </h3><p>Internal Error occured at php level</p>')
                        }else if(err.status == 200){
                                if(error) error();
                        }else{
                                jQuery('.eloqua-get #info').html('<h3>Error: </h3><p>' + JSON.stringify(err) + '</p>')
                        }
                }
        });
}
function buildFormElement(e){
        e.template  = templateName(e)
        var tmpName = e.hasOwnProperty('localEdits') && tmp.hasOwnProperty(e.localEdits.alt_template)? e.localEdits.alt_template : e.template;
        if(tmp.hasOwnProperty(tmpName)){
                var exec = tmp[tmpName];
                return exec(e);
        }
        return false;
}
function buildFormStructure(html){
        if(typeof html == 'object' && html.hasOwnProperty('type') && html.type.toLowerCase()=='form'){
                var formhtml = jQuery(tmp.form(html))
                _.each(html.elements, function(e) {
                        /*var tmpName = templateName(e)
                        e.template = tmpName;
                        if(tmp.hasOwnProperty(tmpName)){
                                var exec = tmp[tmpName];
                                jQuery(formhtml).append(exec(e))
                        }*/
                        var el = buildFormElement(e)
                        if(el){
                                jQuery(formhtml).append(el)
                        }
                });
                return (formhtml);
        }
        jQuery('.eloqua-get #info').html('<h3>Form not usable</h3><p>The form retrieved is malformed. Or eloqua\'s servers are busy.</p>');
        return false;
}
function log(str){
        if(typeof window.console!= 'undefined'){
                console.log(str)
        }
}
//Interface: UI
function addSelectBox(){
        jQuery('.single select').selectbox({
                effect: "slide",
                onOpen: function() {},
                onClose: function() {}
        });     
}
