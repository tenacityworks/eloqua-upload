<?php

//Eloqua ajax
$baseUrl = "https://secure.eloqua.com/API/REST/1.0/";
header('Access-Control-Allow-Origin: http://fiddle.jshell.net');

function setCurl($url){
	//Remember that this may change every 3 months
	$user = "GSMA\Adam.Taylor";
	$password = "@@At20993";
	// create the cURL resource  
    $ch = curl_init();
	// set cURL options 
	curl_setopt($ch, CURLOPT_CONNECTTIMEOUT ,60); 
	curl_setopt($ch, CURLOPT_TIMEOUT, 60); //timeout in seconds
	curl_setopt($ch, CURLOPT_URL, $url);
	// basic authentication  
	curl_setopt($ch, CURLOPT_USERPWD, $user . ':' . $password);
	return $ch;
}
function get_request($url){ 
	$ch = setCurl($url);
	// execute request and retrieve the response  
	$data = curl_exec($ch);
	if(curl_errno($ch)){
		echo json_decode(curl_error($ch));
		curl_close($ch);
		die();
	}
}
function return_request($url)  { 
	$ch = setCurl($url);
	$headers = array('Content-type: application/json');
	curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, TRUE);
	
	// execute request and retrieve the response  
	$data = curl_exec($ch);
	// close resources and return the response  
	if(curl_errno($ch)){
		echo json_decode(curl_error($ch));
		curl_close($ch);
		die();
	}
	return $data;
}
function post_data($url,$post=NULL)  { 
	$ch = setCurl($url);

	$headers = array('Content-type: application/json');
	curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, TRUE);
	curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'POST');
	curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($post));
	curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
		
	//execute request and retrieve the response  
	$data = curl_exec($ch);
	
	$responseInfo = curl_getinfo($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
	 
	if(curl_errno($ch)){
		echo curl_error($ch);
		curl_close($ch);
		die();
	}
	return $responseInfo;
}
if(!function_exists('getRestVar')){
	function getRestVar($var){
		$p = isset($_POST[ $var ])?	$_POST[ $var ]	: false;
		$g = isset($_GET[ $var ])?	$_GET[ $var ]	: false;
		return $p? $p : $g;
	}
}
function eloqua_form_submit_callback(){
	header("Content-Type: application/json", true);
	$baseUrl = 'http://now.eloqua.com/e/f2.aspx?';
	$string = getRestVar('data');
	get_request($baseUrl.$string);
	$arr = array(
		'success'=>true,
		'info'=>$string
	);
	wp_send_json($arr);
}
add_action( 'wp_ajax_nopriv_eloqua_form_submit', 'eloqua_form_submit_callback' );
add_action( 'wp_ajax_eloqua_form_submit', 'eloqua_form_submit_callback' );

function eloqua_form_rest_submit_callback($notAjax=false){
	global $baseUrl;
	if(!$notAjax) header("Content-Type: application/json", true);
	$data = (array)getRestVar('fullData');
	$form = getRestVar('form');
	$string = 'data/form/'.$form;
	//wplog(gettype($data['submittedByContactId']));
	//wplog('CONTACT ID: '.$data['submittedByContactId']);
	//echo 'USER: '.$data['submittedByContactId'];
	//wplog(json_encode($data));
	
	if(isset($data['submittedByContactId']) && $data['submittedByContactId'] && $data['submittedByContactId']!= 'false'){
		$con = get_eloqua_contact($data['submittedByContactId']);
		//wplog($con);
		if(gettype($con) =='string'){
			$con = json_decode($con);
		}
		
		$fieldIds = array_map(function($e) {
			return is_object($e) ? $e->id : $e['id'];
		}, $con->fieldValues);
		$keys = array_keys((array)$con);
		//wplog( 'CON: '.json_encode($con));
		//wplog((array)$data['fieldValues']);
		
		$data['fieldValues'] = array_map(function($val) use ($fieldIds,$keys,$con){
		//foreach((array)$data['fieldValues'] as $key => $val){
			$val = (object)$val;
			//wplog('#################');
			//wplog($val);
			//** Check to see if the value is empty, if so fill it
			$v = isset($val->value)? $val->value : "";
			if($v==""){
				//wplog('*** SET THIS VALUE');
				$res = isset($val->conID) && $val->conID? array_search($val->conID, $fieldIds) : false;
				$name = array_search($val->name, $keys);
				if($res!==false){
					//wplog('USE IDS');
					//wplog($con->fieldValues[$res]);
					if(isset($con->fieldValues[$res]->value)){
						$val->value = $con->fieldValues[$res]->value;
					}
				}else if($name!==false){
					//wplog('USE names');
					//wplog($keys[$name]);
					$val->value = $con->{$keys[$name]};
				}
				
			}else{
				//wplog('$$$$$$$$$$$DO NOR SET VALUE');
			}
			//wplog(': '.json_encode($val));
			//wplog('#################');
			return $val;
			
		},(array)$data['fieldValues']);
		//for each of the other keys		
	}else{
		unset($data['submittedByContactId']);	
	}
	
	//wplog('--------------------------------------------');
	//wplog($data);
	$pd = post_data($baseUrl.$string,$data);
	echo json_encode($pd);
	if(!$notAjax) die();
}
add_action( 'wp_ajax_nopriv_eloqua_form_rest_submit', 'eloqua_form_rest_submit_callback' );
add_action( 'wp_ajax_eloqua_form_rest_submit', 'eloqua_form_rest_submit_callback' );


function eloqua_form_construct_callback(){
	global $baseUrl;
	header("Content-Type: application/json", true);
	$id = getRestVar('id');
	$limit = getRestVar('limit')? getRestVar('limit') : 50;
	
	$string = is_numeric($id)?
	'assets/form/'.$id:
	'assets/forms?search=*'.$id.'*&page=1&count='.$limit.'&depth=minimal&orderBy=name';
	
	get_request($baseUrl.$string);
	die();
}
add_action( 'wp_ajax_eloqua_form_construct', 'eloqua_form_construct_callback' );

function get_eloqua_contact($id){
	global $baseUrl;
	$string = 
	'data/contact/'.$id;
	$dat = return_request($baseUrl.$string);
	return $dat;
}
function eloqua_contact_callback(){
	global $baseUrl;
	header("Content-Type: application/json", true);
	$email = getRestVar('data');
	
	$string = 
	'data/contacts?search=emailAddress%3d%27'.$email.'*%27&count=1&page=1&depth=complete';
	get_request($baseUrl.$string);
	die();
}
add_action( 'wp_ajax_nopriv_eloqua_contact', 'eloqua_contact_callback' );
add_action( 'wp_ajax_eloqua_contact', 'eloqua_contact_callback' );

function eloqua_form_optionlist_callback(){
	global $baseUrl;
	header("Content-Type: application/json", true);
	$baseUrl = 'https://secure.eloqua.com/API/REST/1.0/assets/optionList/';
	$string = getRestVar('id');
	get_request($baseUrl.$string);
	die();
}
add_action( 'wp_ajax_eloqua_form_optionlist', 'eloqua_form_optionlist_callback' );
 

// echo $forms;


if (!function_exists('wplog')) {
    function wplog ( $log )  {
        if ( true === WP_DEBUG ) {
            if ( is_array( $log ) || is_object( $log ) ) {
                error_log( print_r( $log, true ) );
            } else {
                error_log( $log );
            }
        }
	}
}
?>