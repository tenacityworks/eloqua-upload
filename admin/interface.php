<?php
/** Step 2 (from text above). */
add_action( 'admin_menu', 'eloqua_upload_menu' );
$inEloquaOps = false;

/** Step 1. */
function eloqua_upload_menu() {
	add_menu_page( 'Eloqua Forms', 'Forms', 'edit_posts', 'eloqua-upload', 'eloqua_upload_options');
}

/** Step 3. */
function eloqua_upload_options() {
	global $inEloquaOps;
	$inEloquaOps = true;
	if ( !current_user_can( 'edit_posts' ) )  {
		wp_die( __( 'You do not have sufficient permissions to access this page.' ) );
	}
	echo '<div class="eloqua-main-page">';
	add_inline_popup_content(true);
	echo '</div>';
}

//Adds button to edit posts & pages
function add_eloqua_button($context) {
	$img = '/wp-content/plugins/eloqua-upload/admin/logo.png';
	//$context .= '<a href="#" id="insert-media-button" class="button insert-media add_media" data-editor="content" title="Add Eloqua Form"><img src="'.$img.'"/></a>';
	$context .= '<a href="" id="insert-elo-form-button" class="button eloqua form" title="Add Eloqua Form"><img src="'.$img.'"/></a>';

  return $context;
}
add_action('media_buttons_context',  'add_eloqua_button');  


//Adds pop up to posts & pages links to button
function add_inline_popup_content($page=false) {
?>
<div id="eloqua-form-uploader" <?php if(!$page) echo 'style="display:none;"';?>>
<div class="eloqua <?php if(!$page) echo 'media-modal';?> wp-core-ui">
	<?php if(!$page)?><a class="media-modal-close" href="#" title="Close"><span class="media-modal-icon"></span></a>
	<div class="<?php if(!$page) echo 'media-modal-content';?> eloqua-file">
		<?php
        $upload_dir = wp_upload_dir();
        $url = $upload_dir;//wp_nonce_url('themes.php?page=example','example-theme-options');
        $url = $url['basedir'];
        if (false === ($creds = request_filesystem_credentials($url, '', false, false, null) ) ) {
            echo "<h2>Permission Denied to uploads folder</h2>";
            return;
        }else{
			$forms   = $upload_dir['path'].'/forms/';
			$data   = $forms.'data/';
			if(!file_exists($forms)) mkdir($forms);
			if(!file_exists($data)) mkdir($data);
			
			if(!wp_is_writable($forms)){
				echo '<div class="highlight-box" style="background-color: wheat;"><label>FORM FOLDER PERMISSIONS PREVENT EDITING</label></div>';
			}
			if(!wp_is_writable($data)){
				echo '<div class="highlight-box" style="background-color: wheat;"><label>DATA FOLDER PERMISSIONS PREVENT EDITING</label></div>';
			}
			
            ?>            
            <h2 class="nav-tab-wrapper">
            	<a id='lib' href="#" class="nav-tab nav-tab-active">Forms</a>
                <a id='pages' href="#" class="nav-tab">Form Pages</a>
                <!--<a id="get" href="#" class="nav-tab">Import</a>
                <a id='upload' href="#" class="nav-tab">Upload</a>
                <a id='text' href="#" class="nav-tab">Text Entry</a>-->
                <a id='plus' href="#" class="nav-tab plus">+</a>              
            </h2>
            <div id="lib" class="elequa-tab eloqua-file-list">
                <h3>Available forms</h3>
                <div class="eloqua-get outer-get">
                	<div class="inner-get">
                		<input id="form-get" class="srch" type="text" placeholder="Find by name or ID"><div class="clear-srch" title="clear"></div><button id="get-btn" class="button">Search</button>
                    </div>
                    <div id="info"></div>
                </div>
                <div class="list-index">
                	<div class="name-ind sorting">Name</div>
                    <div class="time-ind">Time</div>
                </div>
                <div id="filelist" class="waiting"></div>
            </div>
             <div id="pages" class="elequa-tab eloqua-file-list" style="display:none">
                <h3>Forms Shortcodes in Page Content and Meta</h3>
                <div class="eloqua-pages shortcode-query waiting"></div>
             </div>
            <!--<div id="get" class="elequa-tab eloqua-get"  style="display:none">
                <h3 class="<?php echo $url;?>">Import Eloqua Form</h3>
                <input id="form-get" class="srch" type="text"><button id="get-btn" class="button">Search</button>
            	<div id="info"></div>
                <div id="result"></div>
            </div>-->
            <div id="upload" class="elequa-tab eloqua-file-upload" style="display:none">
                <h3 class="<?php echo $url;?>">Add Eloqua Form</h3>
                <input id="form-upload" type="file" multiple>
                <textarea style="display:none"></textarea>
            	<div id="result"></div>
            </div>
            <div id="text" class="elequa-tab eloqua-file-text" style="display:none">
            	<h3>Paste Code from eloqua</h3>
                <p><label>File name: </label><input type="text" id="filename"/></p>
                <p><textarea rows="4" cols="50"></textarea></p>
                <p><button id="text-btn" class="button">Upload</button></p>
                
                <div id="result"></div>
            </div>
             <div id="plus" class="elequa-tab eloqua-file-plus" style="display:none">
            	<h3>Add Form Manualy</h3>
                <div class="submitbar form-btns">
                	<div class="button open form-manual-option upload" data-action="upload">Upload</div>
                    <div class="button form-manual-option paste" data-action="paste">Paste Html</div>                    
                </div>
                <div class="upload-panel upload">
                    <input id="form-upload" type="file">
                </div>
                <div class="upload-panel paste" style="display:none">
                    <div class="elq-field text">
                    	<div class="field-wrap label">
                        	<label>File name:</label>
                        </div>
                      	<div class="field-wrap text">
                    	    <input type="text" id="filename">
                        </div>
                    </div>
                    <div class="elq-field textArea" data-type="textarea">
                    	<div class="field-wrap textArea" style="width: 100%;">
                        <textarea name="paragraphText"></textarea></div>
                    </div>
                    <div class="up-inst-text" style="display:none">You must enter and file name and file content.</div>
                    <p><input id="text-btn" class="button" type="submit" value="Upload"/></p>
                </div>
                
                <div id="filelist"></div>
            </div>
            
            <?php	
        }
    	?>
	</div>
</div>
<?php if(!$page):?><div class="media-modal-backdrop"></div><?php endif;?>
</div>
<?php
}
//add_action( 'admin_footer',  'add_inline_popup_content' );
add_action('admin_footer-post.php', 'add_inline_popup_content'); // Fired on post edit page
add_action('admin_footer-post-new.php', 'add_inline_popup_content'); // Fired on add new post page

//Upload a form to the site
function upload_form_callback() {	
	global $wp_filesystem,$editbtns;
	$form = $_POST['form'];
	$form = strtolower($form);
	$pos  = strrpos($form, ".");
	if($pos){
		$form = substr($form,0,$pos);
	}
	$form = preg_replace('/[^a-zA-Z0-9_ -.]/s', '', $form);
	$form = preg_replace('/ /', '-', $form);
	$content = $_POST['data'];
	$content = mb_convert_encoding($content, 'HTML-ENTITIES', "UTF-8");
	$content = stripslashes($content);
	
	$url = wp_upload_dir();
	$rel = $url['baseurl'];
	$url = $url['basedir'];
	
	if (false === ($creds = request_filesystem_credentials($url, '', false, false, null) ) ) {
		return; // stop processing here
	}
	if ( ! WP_Filesystem($creds) ) {
		request_filesystem_credentials($url, '', true, false, null);
		return;
	}
	wp_mkdir_p($url.'/forms/');
	$wp_filesystem->put_contents( $url.'/forms/'.$form.'.html',$content,FS_CHMOD_FILE);
	
	echo '[eloqua url="'.$form.'"]'.
	(file_exists($url.'/forms/data/'.$form.'.json')? $editbtns : '').'<span class="form-name" style="display:none">'.$form.'</span><a class="view-form" target="_blank" href="'.$rel.'/forms/'.$form.'.html">Open</a>';
	die(); // this is required to return a proper result
}
add_action( 'wp_ajax_upload_form', 'upload_form_callback' );


function upload_data_callback() {	
	global $wp_filesystem;
	$form = $_POST['form'];
	$form = strtolower($form);
	$pos  = strrpos($form, ".");
	if($pos){
		$form = substr($form,0,$pos);
	}
	$form = preg_replace('/[^a-zA-Z0-9_ -.]/s', '', $form);
	$content = $_POST['data'];
	$content = mb_convert_encoding($content, 'HTML-ENTITIES', "UTF-8");
	$content = stripslashes($content);
	
	$url = wp_upload_dir();
	$rel = $url['baseurl'];
	$url = $url['basedir'];
	
	if (false === ($creds = request_filesystem_credentials($url, '', false, false, null) ) ) {
		return; // stop processing here
	}
	if ( ! WP_Filesystem($creds) ) {
		request_filesystem_credentials($url, '', true, false, null);
		return;
	}
	wp_mkdir_p($url.'/forms/data/');
	$wp_filesystem->put_contents( $url.'/forms/data/'.$form.'.json',$content,FS_CHMOD_FILE);
	echo '[eloqua url="'.$form.'"]<a class="view-form" target="_blank" href="'.$rel.'/forms/'.$form.'.json">view</a>';
	die(); // this is required to return a proper result
}
add_action( 'wp_ajax_upload_data', 'upload_data_callback' );

function get_form_html(){
	$dir  = wp_upload_dir();
	$dir  = $dir['basedir'].'/forms/';
	$name = getRestVar('id');
	$includefile = $dir.$name.'.html';
	echo get_eloqua_contents($includefile);
	die();
}
add_action( 'wp_ajax_form_string', 'get_form_html' );

function list_dir_callback(){
	$dir   = wp_upload_dir();
	$rel   = $dir['path'].'/forms/';
	$dir   = $dir['path'].'/forms/';
	if(file_exists($dir)){
		$files = scandir($dir);
		//echo json_encode($files);
		$send = array();
		foreach($files as $key => $file){
			if(!is_dir($file) && $file){
				$pos  = strrpos($file, ".");
				$filename = substr($file,0,$pos);
				$datafile = file_exists($dir.'/data/'.$filename.'.json');
				$datacon = $datafile? file_get_contents($dir.'/data/'.$filename.'.json') : '';
				$fileWrite = wp_is_writable($dir.$file); 
				$obj = array(
					'name'=>$filename,
					'data'=>$datafile,
					'date'=>date("F d Y H:i:s",filemtime($dir.$file)),
					'time'=>date("Y-m-d-H:i:s",filemtime($dir.$file)),
					'write'=> $fileWrite? 'true':'false',
					'fulldata'=> $datacon,
					//'full'=>$dir.$file
				);
				array_push($send,$obj);		
			}
		}
		echo json_encode($send);
	}
	die(); // this is required to return a proper result
}
add_action( 'wp_ajax_list_dir', 'list_dir_callback' );
function dir_permissions(){
	$headers = array('Content-type: application/json');
	$dir   = wp_upload_dir();
	$forms   = $dir['path'].'/forms/';
	$data   = $forms.'data/';
	if(!file_exists($forms)) mkdir($forms);
	if(!file_exists($data)) mkdir($data);
	
	$arr = array(
		'formUrl'=> $forms,
		'dataUrl'=> $data,
		'forms'=>wp_is_writable($forms),
		'data'=>wp_is_writable($data),
	);  
	echo json_encode($arr);
	die();
}
add_action( 'wp_ajax_dir_permissions', 'dir_permissions' );

function deleteLocalForm(){
	$dir   = wp_upload_dir();
	$dir   = $dir['basedir'].'/forms/';
	$name = getRestVar('id');
	$formfile = $dir.$name.'.html';
	$datafile = $dir.'data/'.$name.'.json';
	try{
	if(file_exists($formfile)) unlink($formfile);
	if(file_exists($datafile)) unlink($datafile);
	}catch(Exception $err){
		echo 'Error deleting files';
		die();
	}
	echo 'Success: ';
	die();
}
add_action( 'wp_ajax_remove_form', 'deleteLocalForm' );

function find_form_shortcode(){
	global $wpdb;
	//$site = get_bloginfo('url');
	$name = getRestVar('id');
	$name = $name && $name != 'false'? ' and (post_content like "%=\"'.getRestVar('id').'\"%" or meta_value like "%=\"'.getRestVar('id').'\"%") ' : '';
	//$results = $wpdb->get_results( 'SELECT * FROM wp_posts WHERE post_content like "%[eloqua%" and post_type != "revision"'.$name.';', OBJECT );
	$start = "INSTR(post_content,'[eloqua')";
	$locate = "LOCATE(']',post_content,{$start})";
	$search = "SUBSTR(post_content,{$start},{$locate}+1 - {$start})";
	$sMeta = str_replace('post_content','meta_value',$search);
	$str = 
	/*
	"SELECT id,post_title,post_modified,
	COALESCE( {$search},{$sMeta} ) as slice
	FROM wp_posts join wp_postmeta on (wp_postmeta.post_id = wp_posts.id)
	WHERE (post_content like '%[eloqua%' or meta_value like '%[eloqua%') and post_type != 'revision' {$name} GROUP BY ID ORDER BY post_modified DESC;";
	*/
	"SELECT id,post_title,post_modified,
	$search as slice,
	$sMeta as mSlice
	FROM wp_posts join wp_postmeta on (wp_postmeta.post_id = wp_posts.id)
	WHERE (post_content like '%[eloqua%' or meta_value like '%[eloqua%') and post_type != 'revision' {$name} GROUP BY ID ORDER BY post_modified DESC;";
	$results = $wpdb->get_results( $str, OBJECT );	
	//echo $str;
	echo json_encode($results);
	die(); // this is required to return a proper result
}
add_action( 'wp_ajax_find_form_shortcode', 'find_form_shortcode' );

if(! function_exists('getRestVar')){
	function getRestVar($var){
		$p = isset($_POST[ $var ])?	$_POST[ $var ]	: false;
		$g = isset($_GET[ $var ])?	$_GET[ $var ]	: false;
		return $p? $p : $g;
	}
}
?>