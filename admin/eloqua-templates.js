var admin_tools = {
	'text':			{columns:false,multivalid:false,changeFormat:true},
	'textarea':		{columns:false,multivalid:false,changeFormat:true},
	'group':		{columns:false,multivalid:false},
	'submit':		{columns:false,multivalid:false,resetbtn:true},
	'select':		{columns:false,multivalid:false,changeFormat:true},
	'multiselect':	{columns:false,valid:true,multivalid:true,changeFormat:true},
	'radio':		{columns:true, valid:true,changeFormat:true},
	'check':		{columns:false,valid:true},
	'checklist':	{columns:true, valid:true,multivalid:true,changeFormat:true},
	'FormField_text':			{changeFormat:true},
	'FormFieldGroup':			{tooltip:true},
	'FormField_file':			{},
	'FormField_singleSelect':	{changeFormat:true},
	'FormField_checkbox':		{valid:true},
	'FormField_checkboxList':	{columns:true,valid:true,multivalid:true,changeFormat:true},
	'FormField_checkboxSelect':	{columns:true,valid:true,multivalid:true,changeFormat:true},
	'FormField_textArea':		{changeFormat:true},
	'FormField_hidden':			{},
	'FormField_submit':			{resetbtn:true},
	'FormField_multiSelect':	{columns:true,valid:true,multivalid:true,changeFormat:true},
	'FormField_radio':			{columns:true, valid:true,changeFormat:true},
	
	
}
admin_tools.FormField_textarea = admin_tools.FormField_textArea
admin_tools.FormField_input = admin_tools.FormField_text;
var tmp = {};
var tmpstr = {};
var part = {};
tmpstr.admintools = 
'<div class="admin-editor"></div>\
<div class="admin-tools">\
	<div class="button tool indent{{#if localEdits.indent}} on{{/if}}">Indent</div>\
	<div class="button tool hide{{#if localEdits.hide}} on{{/if}}">Hide</div>\
	<div class="button tool tooltip{{#if localEdits.tooltip}} on{{/if}}">Tooltip</div>\
	<!--<div class="button tool vis">Visibility</div>-->\
	{{#if tools.columns}}<div class="button tool column{{#if localEdits.colcount}} on{{/if}}">Columns</div>{{/if}}<!-- -->\
	<div class="button tool valid{{#if localEdits.localMessage}} on{{/if}}">Required</div><!-- -->\
	{{#if resetbtn}}<div class="button tool reset{{#if localEdits.resetButtonText}} on{{/if}}">Button Text</div>{{/if}}<!-- -->\
	{{#if createdFromContactFieldId}}<div class="button tool reverse progress {{#if localEdits.progressive}}on{{/if}}">Progressive</div>{{/if}}<!-- -->\
	{{#if tools.changeFormat}}<div class="button tool format{{#if localEdits.alt_template}} on{{/if}}">Format</div>{{/if}}<!-- -->\
	<div class="button tool close" title="close">Done</div>\
	<div class="optionstray">\
		<div class="tray tray-reset">\
			<div class="embed elq-field textArea">\
				<div class="field-wrap label"><label>Reset Button Text</label></div>\
				<div class="field-wrap textArea"><input id="resetbtn-text" type="text" placeholder="Reset" value="{{localEdits.resetButtonText}}"></div>\
			</div>\
		</div>\
		<div class="tray tray-tooltip">\
			<div class="embed elq-field textArea">\
				<div class="field-wrap label"><label>Tooltip Text</label></div>\
				<div class="field-wrap textArea"><textarea id="tooltip-text">{{localEdits.tooltip}}</textarea></div>\
			</div>\
		</div>\
		<div class="tray tray-vis"></div>\
		<div class="tray tray-column">\
			<div class="embed elq-field select single">\
			  <div class="field-wrap label">\
				<label># of Columns</label>\
			  </div>\
			  <div class="field-wrap select">\
				<select id="cols">\
				  <option value="one"{{#ifCond localEdits.colcount "one"}} selected="selected"{{/ifCond}}>One</option>\
				  <option value=""{{#unless localEdits.colcount}} selected="selected"{{/unless}}>Two</option>\
				  <option value="three"{{#ifCond localEdits.colcount "three"}} selected="selected"{{/ifCond}}>Three</option>\
				</select>\
			  </div>\
			</div>\
		</div>\
		<div class="tray tray-valid">\
			<div class="embed elq-field text">\
				<div class="field-wrap label"><label>Required Text</label></div>\
				<div class="field-wrap text"><input type="text" class="validtext" placeholder="{{localEdits.validations.0.message}}" value="{{localEdits.localMessage}}"></div>\
			</div>\
			{{#if tools.multivalid}}<div class="elq-field text">\
				<div class="field-wrap label"><label># Selected</label></div>\
				<div class="field-wrap text"><input type="text" class="validcount" value="{{#if localEdits.validcount}}{{localEdits.validcount}}{{else}}1{{/if}}"></div>\
			</div>{{/if}}\
		</div>\
		<div class="tray tray-format">\
			<div class="embed elq-field select">\
				<div class="field-wrap label"><label>Change Format</label></div>\
				<div class="field-wrap select">\
					<select id="new-format">\
						{{#ifCond template "FormField_text"}}\
							<option value="" {{#unless localEdits.alt_template}}selected="selected"{{/unless}}>Text</option>\
							<option value="FormField_textArea"{{#ifCond localEdits.alt_template "FormField_textArea"}} selected="selected"{{/ifCond}}>Text Area</option>\
						{{/ifCond}}\
						{{#ifCond template "FormField_textArea"}}\
							<option value="FormField_text"{{#ifCond localEdits.alt_template "FormField_text"}} selected="selected"{{/ifCond}}>Text</option>\
							<option value="" {{#unless localEdits.alt_template}}selected="selected"{{/unless}}>Text Area</option>\
						{{/ifCond}}\
						{{#ifCond template "FormField_singleSelect"}}\
							<option value="" {{#unless localEdits.alt_template}}selected="selected"{{/unless}}>Select</option>\
							<option value="FormField_radio"{{#ifCond localEdits.alt_template "FormField_radio"}} selected="selected"{{/ifCond}}>Radio</option>\
						{{/ifCond}}\
						{{#ifCond template "FormField_radio"}}\
							<option value="FormField_singleSelect"{{#ifCond localEdits.alt_template "FormField_singleSelect"}} selected="selected"{{/ifCond}}>Select</option>\
							<option value="" {{#unless localEdits.alt_template}}selected="selected"{{/unless}}>Radio</option>\
						{{/ifCond}}\
						{{#ifCond template "FormField_multiSelect"}}\
							<option value="" {{#unless localEdits.alt_template}}selected="selected"{{/unless}}>Multi Select</option>\
							<option value="FormField_checkboxList"{{#ifCond localEdits.alt_template "FormField_checkboxList"}} selected="selected"{{/ifCond}}>Checklist</option>\
							<option value="FormField_checkSelect"{{#ifCond localEdits.alt_template "FormField_checkboxSelect"}} selected="selected"{{/ifCond}}>Check Select</option>\
						{{/ifCond}}\
						{{#ifCond template "FormField_checkboxList"}}\
							<option value="FormField_multiSelect"{{#ifCond localEdits.alt_template "FormField_multiSelect"}} selected="selected"{{/ifCond}}>Multi Select</option>\
							<option value="" {{#unless localEdits.alt_template}}selected="selected"{{/unless}}>Checklist</option>\
							<option value="FormField_checkboxSelect"{{#ifCond localEdits.alt_template "FormField_checkboxSelect"}} selected="selected"{{/ifCond}}>Check Select</option>\
						{{/ifCond}}\
					</select>\
				 </div>\
			 </div>\
		</div>\
	</div>\
</div>';
tmpstr.shortcode_db = 
'<div class="title">Found Shortcodes: ({{length}}) {{#if length}}<a class="hide-sc" style="display:none">Hide</a><a class="show-sc">Show</a>{{/if}}</div>\
 <div class="code-hold" style="display:none">\
 	{{#each .}}\
		<div><a href="/wp-admin/post.php?post={{ID}}{{id}}&action=edit" target="_blank">{{post_title}}</a></div>\
	{{/each}}\
 </div>';
tmpstr.shortcode_pages = 
'{{#each .}}\
	<div class="postbox shortcode">\
		<div class="topbar">\
			<div class="form-name"><a href="/wp-admin/post.php?post={{ID}}{{id}}&action=edit" target="_blank">{{post_title}}</a></div>\
			<div class="form-time">{{post_modified}}</div>\
			{{#unless mSlice}}\
				<div class="form-slice">{{slice}}</div>\
			{{else}}\
				{{#if post_content}}<div class="form-slice">{{slice}}</div>{{/if}}\
				<div class="form-slice">Meta: {{mSlice}}</div>\
			{{/unless}}\
		</div>\
	 </div>\
{{/each}}';
tmpstr.postbox =
'<div {{#if id}} id="{{id}}" {{/if}}class="postbox{{#if fulldata.elements.length}} data{{/if}}{{#if fulldata.responsomatic}} respo{{/if}}{{#if fulldata.locked}} locked{{/if}}" data-form-name="{{name}}" data-writeable="{{write}}">\
	<div class="topbar"><div class="top-line local-copy{{#if server}} server{{/if}}" title="{{#if server}}Not local{{else}}Imported{{#if fulldata.responsomatic}} Response-o-matic{{/if}}{{/if}}"></div>\
	<div class="top-line form-name">{{#if dataname}}{{dataname}} <small> ({{name}})</small>{{else}}{{name}}{{/if}}</div>\
	<div class="top-line form-time">{{#if date}}{{date}}{{/if}}</div>\
	<div class="top-line form-edit-icons{{#if fulldata.elements.length}} hasdata{{/if}}">\
	{{#unless server}}\
		<a class="view-form form-code" data-action="code" title="Short Code" href=""></a>\
		<!--<a class="view-form form-view" data-action="view" title="View" href=""></a>-->\
		<a class="view-form form-edit" data-action="edit" title="Edit" href=""></a>\
		<!--<a class="view-form form-save" data-action="save" title="Save" href=""></a>-->\
		<a class="view-form form-open" data-action="open" title="Open in new Tab" target="_blank" href="/wp-content/uploads/forms/{{name}}.html"></a><!---->\
		{{#unless fulldata.responsomatic}}<a class="view-form form-refresh" data-action="refresh" title="Reload" href=""></a>{{/unless}}<!---->\
		{{#if fulldata.responsomatic}}<a class="view-form form-refresh" data-action="update" title="Update" href=""></a>{{/if}}<!---->\
		<a class="view-form form-migrate" data-action="migrate" title="migrate" href=""></a>\
		<a class="view-form form-lock" data-action="lock" title="lock" href=""></a>\
		<a class="view-form form-delete" data-action="delete" title="delete" href=""></a>\
	{{else}}\
		<a class="view-form form-download" data-action="download" title="Import" href=""></a>\
	{{/unless}}\
	</div></div>\
	<div class="save-form">\
		<div class="title"></div>\
	</div>\
	<div id="importformhold" class="wp-core-ui">\
		<div class="inner">\
			<div class="util form-util">{{>permissions .}}<div class="outer"></div></div>\
			<div class="util download-util"><div class="outer">\
				<h2>Importing</h2>\
				<div class="info"></div>\
			</div></div>\
			<div class="util code-util"><div class="outer">\
				<h2>Shortcode</h2>\
				<div class="highlight-box">\
					<label class="sCodeTXT" data-start=\'[eloqua name="{{name}}"\'>[eloqua name="{{name}}"]</label>\
				</div>\
				<h2>Form Submission</h2>\
				<div class="submitbar">\
					<div class="button open submit-option" data-type="standard">Standard</div>\
					<div class="button submit-option" data-type="newtab">New Tab</div>\
					<div class="button submit-option" data-type="ajax">Use Ajax</div>\
					<div class="button submit-option" data-type="gate">Use Gates</div>\
				</div>\
				<h2>Progressve Fields</h2>\
				<div class="elq-field checkbox">\
					<div class="field-wrap checkbox in">\
						<input id="progressive-fields" type="checkbox" checked="checked">\
					</div>\
					<div class="field-wrap label lbl">\
						<label for="progressive-fields">Display email form and use Progressive Fields</label>\
					</div>\
				</div>\
				<div class="sc-panel" data-action="ajax" style="display:none">\
					<div class="bin">\
						<div class="grp">\
							<label>Ajax Success Message</label>\
							<textarea id="ajax-success-message">Your information has been submitted.<br/>Thank You.</textarea>\
						</div>\
						<div class="grp">\
							<label>Ajax Failure Message</label>\
							<textarea id="ajax-fail-message">There was an error and your information was not submitted.<br/>Please try again later.</textarea>\
						</div>\
					</div>\
				</div>\
				<div class="sc-panel" data-action="gate" style="display:none">\
					<div class="bin">\
						<div class="grp">\
							<label>gate list <small>(seperate with line breaks or commas)</small></label>\
							<textarea id="gatelist"></textarea>\
						</div>\
					</div>\
				</div>\
				<div class="shortcode-query"></div>\
			</div></div>\
			<div class="util update-util"><div class="outer">\
				{{>permissions}}\
				<h2>Refresh Local Copy</h2>\
				<div class="elq-field checkbox">\
					<div class="field-wrap checkbox in">\
						<input id="local-data" type="checkbox" checked="checked">\
					</div>\
					<div class="field-wrap label lbl">\
						<label for="local-data">Keep Local Adjustments</label>\
					</div>\
				</div>\
				<div class="highlight-box">\
					<label>Download html from eloqua and overwrite local copy?</label>\
					<button id="confirm-overwrite" class="button warning">Confirm</button>\
				</div>\
			</div></div>\
			<div class="util lock-util"><div class="outer">\
				{{>permissions}}\
				<div class="dolock">\
					<h2>Lock Form</h2>\
					<p>Designate that this form should only be altered by editing the html directly.</p>\
					<div class="highlight-box">\
						<label>Disable form edits/refresh/migrate</label>\
						<button id="confirm-lock" class="button warning">Lock</button>\
					</div>\
				</div>\
				<div class="unlock">\
					<h2>UnLock Form</h2>\
					<p>This form is currently locked and can only be altered by directly editing the html file on the server.</p>\
					<div class="highlight-box">\
						<label>Enable form edits/refresh/migrate</label>\
						<button id="confirm-unlock" class="button warning">Unlock</button>\
					</div>\
				</div>\
			</div></div>\
			<div class="util delete-util"><div class="outer">\
				{{>permissions}}\
				<h2>remove Local Copy</h2>\
				<div class="shortcode-query"></div>\
				<div class="highlight-box">\
					<label>Remove this form from the site locally?</label>\
					<button id="confirm-delete" class="button warning">Confirm</button>\
				</div>\
			</div></div>\
			{{#if fulldata.responsomatic}}\
			<div class="util reload-util responso"><div class="outer">\
				{{>permissions}}\
				<h2>Replace Form</h2>\
				<div class="elq-field checkbox">\
					<div class="field-wrap checkbox in">\
						<input id="local-data" type="checkbox" checked="checked">\
					</div>\
					<div class="field-wrap label lbl">\
						<label for="local-data">Keep Local Adjustments <small><i>(This will only work if you replace with a new version of the same form.)</i></small></label>\
					</div>\
				</div>\
				<div class="form-btns">\
					<div class="button open form-manual-option upload" data-action="upload">Upload</div>\
					<div class="button form-manual-option paste" data-action="paste">Paste Html</div>\
				</div>\
				<div class="upload-panel upload">\
					<input id="form-upload" type="file">\
				</div>\
				<div class="upload-panel paste" style="display:none">\
					<div class="elq-field textArea" data-type="textarea">\
						<div class="field-wrap textArea" style="width: 100%;">\
						<textarea name="paragraphText"></textarea></div>\
					</div>\
					<div class="up-inst-text" style="display:none">You must enter file content.</div>\
					<p><input id="text-btn" class="button" type="submit" value="Upload"></p>\
				</div>\
			</div></div>{{/if}}\
			<div class="util migrate-util"><div class="outer">\
				{{>permissions}}\
				<h2>Update form Template</h2>\
				<div class="shortcode-query"></div>\
				<div class="highlight-box">\
					<label>Update this form with new template?</label>\
					<button id="confirm-migrate" class="button warning">Confirm</button>\
				</div>\
			</div></div>\
		</div>\
	</div>\
</div>';
tmpstr.formEdit = 
'<div class="submitbar form-btns">\
	<div class="button open form-view-option edit">Edit </div>\
	<div class="button form-view-option page">Preview</div>\
	<div class="button form-view-option save">Save</div>\
</div>';
tmpstr.form = 
'<form class="eloqua-imported{{#if responsomatic}} responsomatic{{/if}}" method="post" name="{{htmlName}}" action="{{#if action}}{{action}}{{else}}https://s667.t.eloqua.com/e/f2{{/if}}" id="form{{id}}" data-form-name="{{name}}" {{#if responsomatic}}enctype="multipart/form-data" accept-charset="UTF-8"{{/if}}{{#if target}} target="{{target}}"{{/if}} data-template-version="3"{{#if version}} data-version="3"{{/if}}>\
    {{#unless responsomatic}}\
		<input value="{{htmlName}}" type="hidden" name="elqFormName"  />\
		<input value="667" type="hidden" name="elqSiteId"  />\
		<input name="elqCampaignId" type="hidden"  />\
	{{/unless}}\
</form>';

tmpstr.FormFieldGroup = 
'<div id="elq-{{id}}" class="elq-field group{{>topclasses}}" data-type="group"{{>contactField }}>\
	<div class="field-wrap group">\
		<label>{{{name}}}</label>\
	</div>\
	{{>tooltip}}\
</div>';

tmpstr.FormField_text = 
'<div id="elq-{{id}}" class="elq-field text{{>validclass}}{{>topclasses}}" data-type="text"{{>contactField }}>\
	<div class="field-wrap label">\
		<label>{{{name}}}</label>\
	</div>\
	<div class="field-wrap text">\
		<input type="text" name="{{htmlName}}">\
	</div>\
	{{>validate}}{{>tooltip}}\
</div>';
tmpstr.FormField_input = tmpstr.FormField_text;

tmpstr.FormField_file = 
'<div id="elq-{{id}}" class="elq-field file{{>validclass}}{{>topclasses}}" data-type="file"{{>contactField }}>\
	<div class="field-wrap label">\
		<label>{{{name}}}</label>\
	</div>\
	<div class="field-wrap file">\
		<input type="file" name="{{htmlName}}">\
	</div>\
	{{>validate}}{{>tooltip}}\
</div>';

tmpstr.FormField_singleSelect =
'<div id="elq-{{id}}" class="elq-field select single{{>validclass}}{{>topclasses}}" data-type="select"{{>contactField }}>\
	<div class="field-wrap label">\
		<label>{{{name}}}</label>\
	</div>\
	<div id="ops-{{optionListId}}" class="field-wrap select">\
		<select name="{{htmlName}}">{{>options_select options}}</select>\
	</div>\
	{{>validate}}{{>tooltip}}\
</div>';

tmpstr.FormField_checkbox = 
'<div id="elq-{{id}}" class="elq-field checkbox{{>validclass}}{{>topclasses}}" data-type="check"{{>contactField }}>\
	<div class="checklist-option">\
		<div class="inner">\
			<div class="field-wrap checkbox in">\
				<input id="chk-{{id}}" type="checkbox" name="{{htmlName}}">\
			</div>\
			<div class="field-wrap label lbl">\
				<label for="chk-{{id}}">{{{name}}}</label>\
			</div>\
		</div>\
	</div>\
	{{>validate}}{{>tooltip}}\
</div>';

tmpstr.FormField_checkboxList =
'<div id="elq-{{id}}" class="elq-field checkList{{>validclass}}{{>topclasses}}{{#if localEdits.colcount}} col-{{localEdits.colcount}}{{/if}}" data-type="checklist"{{#if localEdits.validcount}} data-valid-count="{{localEdits.validcount}}"{{/if}}{{>contactField }}>\
	<div class="field-wrap label">\
		<label>{{{name}}}</label>\
	</div>\
	<div id="ops-{{optionListId}}" class="option-wrap">{{>options_checklist options}}</div>\
	{{>validate}}\
</div>';

tmpstr.FormField_checkboxSelect =
'<div id="elq-{{id}}" class="elq-field checkSelect{{>validclass}}{{>topclasses}}{{#if localEdits.colcount}} col-{{localEdits.colcount}}{{/if}}" data-type="checkselect"{{#if localEdits.validcount}} data-valid-count="{{localEdits.validcount}}"{{/if}}{{>contactField }}>\
	<div class="field-wrap label">\
		<label>{{{name}}}</label>\
	</div>\
	<div class="field-wrap select selected-val"><div class="target-btn"></div><div class="val">Please Select</div><div class="opdrop">\
		<div id="ops-{{optionListId}}" class="option-wrap">{{>options_checklist options}}</div>\
	</div></div>\
	{{>validate}}\
</div>';

tmpstr.FormField_textArea = 
'<div id="elq-{{id}}" class="elq-field textArea{{>validclass}}{{>topclasses}}" data-type="textarea"{{>contactField }}>\
	<div class="field-wrap label">\
		<label>{{{name}}}</label>\
	</div>\
	<div class="field-wrap textArea">\
		<textArea name="{{htmlName}}"></textArea>\
	</div>\
	{{>validate}}{{>tooltip}}\
</div>';
tmpstr.FormField_textarea = tmpstr.FormField_textArea;
tmpstr.FormField_hidden = 
'<div id="elq-{{id}}" class="elq-field hidden" data-type="hidden">\
	<div class="field-wrap hidden">\
		<input type="hidden" name="{{htmlName}}" value="{{defaultValue}}">\
	</div>\
</div>';

tmpstr.FormField_submit = 
'<div id="elq-{{id}}" class="elq-field submit{{>topclasses}}"  data-type="submit"{{>contactField }}>\
	<div class="field-wrap submit">\
		<input type="submit" name="{{htmlName}}" value="{{{name}}}">\
	</div>\
	<div class="field-wrap submit reset">\
		<input type="submit" value="{{#if resetButtonText}}{{resetButtonText}}{{else}}Reset{{/if}}" class="reset-btn">\
	</div>\
</div>';

tmpstr.FormField_multiSelect =
'<div id="elq-{{id}}" class="elq-field select multi{{>validclass}}" data-type="multiselect"{{#if localEdits.validcount}} data-valid-count="{{localEdits.validcount}}"{{/if}}{{>contactField }}>\
	<div class="field-wrap label">\
		<label>{{{name}}}</label>\
	</div>\
	<div id="ops-{{optionListId}}" class="field-wrap select multi">\
		<select multiple name="{{htmlName}}">{{>options_select options}}</select>\
	</div>\
	{{>validate}}\
</div>';

tmpstr.FormField_radio =
'<div id="elq-{{id}}" class="elq-field radio{{>validclass}}{{#if colcount}} col-{{colcount}}{{/if}}" data-type="radio"{{>contactField }}>\
	<div class="field-wrap label">\
		<label>{{{name}}}</label>\
	</div>\
	<div id="ops-{{optionListId}}" class="option-wrap">{{>options_radio options}}</div>\
	{{>validate}}\
</div>';

tmpstr.options_radio =
'{{#each elements}}<div class="radio-option option-list">\
	<div class="field-wrap in">\
		<input id="{{id}}" type="radio" name="{{../group}}" value="{{value}}">\
	</div>\
	<div class="field-wrap lbl">\
		<label for="{{id}}">{{{displayName}}}</label>\
	</div>\
</div>{{/each}}'

tmpstr.options_checklist =
'{{#each elements}}\
<div class="checklist-option option-list">\
	<div class="inner">\
		<div class="field-wrap in">\
			<input id="{{id}}" type="checkbox" name="{{../group}}" value="{{value}}">\
		</div>\
		<div class="field-wrap lbl">\
			<label for="{{id}}">{{{displayName}}}</label>\
		</div>\
	</div>\
</div>\
{{/each}}'

tmpstr.options_select =
'{{#each elements}}<option value="{{value}}">{{{displayName}}}</option>{{/each}}';


tmpstr.tooltip = '{{#if tooltip}}<div class="tooltip-hold"><div class="tip-ui"></div><div class="tip-baloon">{{tooltip}}</div></div>{{/if}}';

part.topclasses = '{{#if tooltip}} tooltip{{/if}}{{#if indent}} indent{{/if}}{{#if hide}} hidefield{{/if}}{{#if localEdits.progressive}} keepalive{{/if}}';
part.validate = 
	'{{#if localEdits.localMessage}}<div class="message IsRequiredCondition custom" style="display:none">{{localEdits.localMessage}}</div>{{/if}}\
	{{#each validations}}\
		{{#if isEnabled}}\
				<div class="1 message {{condition.type}}" style="display:none">{{message}}</div>\
		{{/if}}\
	{{/each}}';
part.validclass = '{{#if localEdits.localMessage}} IsRequiredCondition custom{{/if}}{{#each validations}}{{#if isEnabled}} {{condition.type}}{{/if}}{{/each}}';
part.contactField = '{{#if createdFromContactFieldId}} data-contact-field="{{createdFromContactFieldId}}"{{/if}}';
part.tooltip = tmpstr.tooltip;
part.options_select = tmpstr.options_select;
part.options_checklist = tmpstr.options_checklist;
part.options_radio = tmpstr.options_radio;
part.permissions = 
'{{#ifCond write "false"}}\
	<div class="highlight-box" style="background-color: wheat;"><label>PERMISSIONS Prevent Editing</label></div>\
{{/ifCond}}'

Handlebars.registerHelper('ifCond', function(v1, v2, options) {
	if(v1 === v2 || (this[v1]===v2 && typeof v2 != 'undefined')) {
		return options.fn(this);
	}
	return options.inverse(this);
});

_.each(_.keys(part),function(p){
	var strr = part[p].replace( new RegExp( "\>[\n\t ]+\<" , "g" ) , "><" );
	strr = strr.replace( new RegExp( "\>[\n\t ]+\{{" , "g" ) , ">{{" ); 
	strr = strr.replace( new RegExp( "}}[\n\t ]+\<" , "g" ) , "}}<" );
	Handlebars.registerPartial(p,strr);
});
_.each(_.keys(tmpstr),function(t){
	var str = tmpstr[t].replace( new RegExp( "\>[\n\t ]+\<" , "g" ) , "><" );
	str = str.replace( new RegExp( "\>[\n\t ]+\{{" , "g" ) , ">{{" );
	str = str.replace( new RegExp( "}}[\n\t ]+\<" , "g" ) , "}}<" );
	tmp[t] = Handlebars.compile(str);
});
function templateName(e){
	var tmpName = e.type? e.type+'_'+e.displayType : e.displayType;
	tmpName = e.displayType=='checkbox' && e.optionListId?  tmpName + 'List' : tmpName;
	return tmpName.replace(/_undefined/g,'');
}