
$(document).ready(function(){

	var lv = new LoginValidator();
	var lc = new LoginController();

// main login form //
	$('#login-form').ajaxForm({
		beforeSubmit : function(formData, jqForm, options){
			if (lv.validateForm() == false){
				return false;
			} 	else{
			// append 'remember-me' option to formData to write local cookie //
				formData.push({name:'remember-me', value:$("input:checkbox:checked").length == 1})
				return true;
			}
		},
		success	: function(responseText, status, xhr, $form){
			if (status == 'success') window.location.href = '/game';
		},
		error : function(e){
            lv.showLoginError('Falha de Login', 'Por favor, verifique seu login e senha.');
		}
	});
	$('#user-tf').focus();

// login retrieval form via email //
	var ev = new EmailValidator();

	$('#get-credentials-form').ajaxForm({
		url: '/lost-password',
		beforeSubmit : function(formData, jqForm, options){
			if (ev.validateEmail($('#email-tf').val())){
				ev.hideEmailAlert();
				return true;
			}	else{
				ev.showEmailAlert("<b> Erro!</b> Por favor digite um e-mail válido.");
				return false;
			}
		},
		success	: function(responseText, status, xhr, $form){
			ev.showEmailSuccess("Verifique em seu e-mail como recuperar sua senha.");
		},
		error : function(){
			ev.showEmailAlert("Desculpe, houve um problema. Tente novamente depois.");
		}
	});

})
