<?php
/**
 * Plugin Name: Eloqua upload
 * Description: Upload and strip eloqua forms of inline css.
 * Author: Adam T Taylor
 * Author URI: http://adamttaylor.com
 * License: GPL2
 * Version: 20

 version 20
 * Support for gsma subsites, adding ajax url as js variable
 * Adjustments for single checkboxes and radiobuttons
 version 19
 * Added more language support, javascript is looking at progressive attributes for messages, that are specified in the shortcode.
 * Fixes progressive showforms function, to only use the form that was just submitted, rather than all forms on the page
 * Hiding a field was not working, in the template it was looking for hide instead of localEdits.hide
 * Hidden fields converted to text fields hidden with css. This is mainly to view the fields in the backend, but also helps sith spam anyway.
 * ID added to postbox UI line
 * Language/text replacement added to chortcode UI
 * Gates UI merged with ajax ui
 version 18
 * Updated the script that evaluates checkboxes to work with serialized array. Changed click to mouseup and commented other redundant code above and below
 * Added support for searching for forms in wp_options in the db
 version 17
 * PHP was using the wrong path to look for forms. it was using the date formatted folders instead of the root upload directoy
 version 16
 * Fixed gated form submit issue. The index was being set to -1 when looking at the gate array.
 * On form submit, checking to see if all the form fields except submit button are hidden and if so sending the form instead of displaying.
 version 15.2
 * Mssing reset button text panel fixed.
 * Added CN language support
 version 15
 * Added form submission on visitig gated form page if already filled out. Then redirect. Also added for user id into submittedforms cookie
 Version 14
 * Progressive forms were excluding fields that were missing the contact ID for the main keys. Ex First name , last name had data come through but the form html was missing the id. Now only the ID is needed for fields that are not in the "fieldValues" attribute.
 Version 13
 * CheckSelect added
 * Change format added
 * Progressive fields added
 * Ajax submit using rest
 * Edit required text for required fields
 * Progressive fields
 version 12
 * New Checkbox styles added
 * Find form pages includes meta data
 * Disclaimer added as a default. Can remove with shortcode
 * Lock forms
version 11.1
 * GetRestVar safely declared
 version 11
 * Major overhaul in interface and functionality. Added reposo matic parsing, migrations, enhanced editing, enhanced shortcode options.s
 version 10.1
 * Adjustments for mwl launch
 version 10:
 * Gated form redirects after submit.
 version 9:
 * Errors editing respons-o-matic forms
 version 8:
 * Eloqua form search instead of id usage
 * Improved backend styles
 version 7:
 * Import form from eloqua by id
 * New templating system and styles
 * Edit form interface
 * Gated form functionality
 * Respons-o-matic form templating
 version 6:
 * Ajax submit scripts
 * Campaign tracking
 * Direct php include function: getEloquaForm
 version 5: 
 * Added MWC styles and selectbox script
 version 4:
 * Fixed issue where script tag was being stripped out
 version 3:
 * Added instructional text for custom form validation.
 * Added asterisks to respons-o-matic required fields during build
 * Css edits to apply to invalid textarea and selects
 version 2: 
 * Added respons-o-matic form structuring
 * Added custom validation in js
 * Enqueued front end scrpts and styles
 * Changed admin ui to use add media look and feel
*/
 
 
include('rest-call.php');
include('admin/interface.php');

$editbtns = '<a href="#" class="view-form form-save">Save</a><a href="#" class="view-form form-edit">Edit</a><a href="#" class="view-form form-view">View</a>';
function eloqua_scripts() {
        wp_enqueue_script('selectbox-js',                     plugins_url( 'front/jquery.selectbox-0.2.min.js', __FILE__ ), array( 'jquery' ));
        wp_enqueue_script('handlebars',                         "https://cdnjs.cloudflare.com/ajax/libs/handlebars.js/2.0.0/handlebars.min.js");
        wp_enqueue_script('eloqua-template-js',         plugins_url( 'admin/eloqua-templates.js', __FILE__ ), array( 'jquery','underscore','handlebars'));
        wp_enqueue_script('eloqua-form-js',                     plugins_url( 'admin/eloqua-upload.js', __FILE__ ), array( 'jquery','underscore','eloqua-template-js'));
        wp_enqueue_style( 'eloqua-admin-style',         plugins_url( 'admin/eloqua-upload.css', __FILE__ ) );
        wp_enqueue_style( 'eloqua-frontend-style',      plugins_url( 'front/eloqua-form.css', __FILE__ ) );
}
add_action( 'admin_enqueue_scripts', 'eloqua_scripts' );

function eloqua_front_end_styles() {
        wp_enqueue_script('el-campaign-js',                     plugins_url( 'front/eloqua-campaign.js', __FILE__ ), array( 'jquery' ));
        //wp_enqueue_script('jquery-select-box-js',     plugins_url( 'front/jquery.selectbox-0.2.min.js', __FILE__ ), array( 'jquery' ));
        wp_enqueue_script('eloqua-frontend-js',         plugins_url( 'front/eloqua-form.js', __FILE__ ), array( /*'jquery-select-box-js'*/ ), '2');
        wp_enqueue_style( 'eloqua-frontend-style',      plugins_url( 'front/eloqua-form_0.css', __FILE__ ), array(), '1' );
}
add_action( 'wp_enqueue_scripts', 'eloqua_front_end_styles' );



function pluginname_ajaxurl() {
?>
<script type="text/javascript">
        var callAjaxUrl = '<?php echo admin_url('admin-ajax.php'); ?>';
</script>
<?php
}
add_action('wp_head','pluginname_ajaxurl');

function get_eloqua_contents($filename) {
        // if you want to call a file to display its contents remember
        // the file needs to be within this directory or below it. 
        ob_start();
        if(file_exists($filename)) ;
        include( $filename);
        return ob_get_clean();
}
function elq_cookie(){
        if(array_key_exists('submittedForms',$_COOKIE)) {
                $c = explode(',', $_COOKIE['submittedForms']);
                $c = array_map(function($i){
                        return explode(':',$i);
                },$c);
                return $c;
        }
        return false;
}
//Create cookie lookup function, coookie should have user id, and time
function eloqua_include( $atts ,$content){
        $att2 = extract( shortcode_atts( array(
                'url' => '',
                'name' => '',
                'gate'=> '',
                'target'=>'',
                'disclaimer'=>"true",
                'progressive'=>"true",
                
                'ui_email'=> 'Enter your email',
                'ui_continue'=>'Continue',
                'ui_noemail'=>'No email was entered',
                'ui_validemail'=> 'Please enter a valid email',
                'ui_process'=>'Please Wait',
                'ui_emailunknown'=> "We don't recognise your email.<br/>Please try again or fill out the form below.",
                'ui_retry'=> "Retry",
                'ui_error'=>'We could not find your email because of a server error. <br/>You can try again later or fill out the form below.',
                'ui_validating'=>'Validating',
                'ui_invalidFields'=>'Please check the fields below',
                'ui_fillout' =>'Please fill out all required fields',
                'ui_processing'=>'Processing',
                'ajax'=>false
        ), $atts ) );
        
        $name = !$name && $url? $url : $name;//Use url as name if url is set
        $dir   = wp_upload_dir();
        $dir   = $dir['basedir'].'/forms/';
        $c              = elq_cookie();
        
        if($c && $gate){
                $ind = isset($_GET['gate'])? $_GET['gate'] : 1;
                $ind = min($ind,(count($gates)-1));//cannot be greater than the length of gates
                $ind = max($ind,1);//cannot be less than 1
                $g = $gates[$ind-1];
                
                foreach ($c as $key => $cookieForm){
                        $cName = strtolower($cookieForm[0]);
                        $user  = count($cookieForm)>1? $cookieForm[1] : false;
                        echo $user;
                        if($cName == strtolower($name)){
                                $formData = $dir.'data/'.$name.'.json';
                                $formData = get_eloqua_contents($formData);
                                //echo $formData;
                                $formData = json_decode($formData);
                                if($formData && array_key_exists('elements',$formData)){
                                        $sendData = array();
                                        foreach($formData->elements as $field){
                                                
                                                if(isset($field->htmlName)){
                                                        $obj = new stdClass();                                                  
                                                        $obj->name = $field->htmlName;
                                                        $obj->value = "";
                                                        $obj->id = str_replace('elq-','',$field->id);                                                   
                                                        if(isset($field->createdFromContactFieldId)) $obj->conID = $field->createdFromContactFieldId;
                                                        $obj->type = 'FieldValue';
                                                        if($obj->id == '9796'){
                                                                $obj->value = $g;//DOC URL
                                                        }
                                                        if($obj->id == '10105'){
                                                                $obj->value = "PHP Redirect";//DOC ID
                                                        }
                                                        array_push($sendData,$obj);
                                                }                               
                                        }
                                        include_once('rest-call.php');
                                        $_POST['form'] = $formData->id;
                                        $_POST['fullData'] = array('submittedByContactId'=> $user, 'fieldValues' => $sendData,  'type' => 'FormData');
                                        eloqua_form_rest_submit_callback(true);
                                        wp_redirect( $g, 302 );
                                        exit;
                                }
                                
                                
                                
                        }
                        
                }               
        }
        $includefile= $dir.$name.'.html';
        $includeInfo = get_eloqua_contents($includefile);
        $includeInfo = is_user_logged_in() && !$includeInfo? '<h2>NO FORM FOUND</h2>' : $includeInfo;
        $disc = '<div class="form-disclaimer"><p><strong>*Disclaimer</strong> – GSMA Ltd takes the privacy of your information very seriously. To view the GSMA Privacy Policy, <a href="/aboutus/legal/privacy">click here</a>.</p></div>';
        
        if(function_exists('siteLanguage') && siteLanguage()=='cn'){
                $p_email = '输入您的邮箱地址';
                $p_continue = '继续';
                $p_process = 'Please Wait';
                $disc = '<div class="form-disclaimer"><p><em>免责声明 – GSMA Ltd 将严格保密您的信息。<a href="/aboutus/legal/privacy" target="_blank">点击此处</a>查看GSMA隐私条款。
        </em></p></div>';
                
        }
        
        return  
                '<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/font-awesome/4.4.0/css/font-awesome.min.css">
                <div class="form-process'.($progressive !=="false"?' progressive-fields':'').'">
                        <div '.($progressive === "false"? 'style="display:none"':'').' class="progressive" data-valid="'.$ui_validemail.'" data-fillout="'.$ui_fillout.'" data-noemail="'.$ui_noemail.'" data-error="'.$ui_error.'" data-unknown="'.$ui_emailunknown.'" data-invalid="'.$ui_invalidFields.'" data-validating="'.$ui_validating.'" data-processing="'.$ui_processing.'" data-retry="'.$ui_retry.'">
                                <div class="proressive-wait"><div class="icon fa fa-refresh fa-spin"></div>'.$ui_process.'</div>
                                <div class="progressive-submit"><input id="email" class="field" placeholder="'.$ui_email.'"><div id="submit" class="field button">'.$ui_continue.'</div></div>
                                <div class="correction"></div>
                        </div>
                        <div class="submission"><div class="inside"></div></div>
                        <div class="form-wrap'.($ajax? ' useAjax': '').($gate? ' gated-form' : '').'"'.($target? ' target="'.$target.'"':'').($gate? ' data-gate="'.$gate.'"' : '').'>'
                                .$includeInfo.do_shortcode($content).
                                ($disclaimer==='true'? $disc : '').
                        '</div>
                </div>';
}
function elg_success($att,$content){
        return  '<div class="eloqua-success-message">'.$content.'</div>';
}
add_shortcode( 'elq-success', 'elg_success' );

function elg_failure($att,$content){
        return  '<div class="eloqua-failure-message">'.$content.'</div>';
}
add_shortcode( 'elq-fail', 'elg_failure' );

function getEloquaForm($url){
        $dir   = wp_upload_dir();
        $includefile   = $dir['basedir'].'/forms/'.$url;
        return  get_include_contents($includefile);
}
add_shortcode( 'eloqua', 'eloqua_include' );
?>
