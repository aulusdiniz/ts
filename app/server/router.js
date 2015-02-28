
var CT = require('./modules/country-list');
var AM = require('./modules/account-manager');
var EM = require('./modules/email-dispatcher');

module.exports = function(app) {

// main login page //

	app.get('/login', function(req, res){
	// check if the user's credentials are saved in a cookie //
		if (req.cookies.user == undefined || req.cookies.pass == undefined){
			res.render('login', { title: 'Bem vindo - Por favor, acesse sua conta' });
		}	else{
	// attempt automatic login //
			AM.autoLogin(req.cookies.user, req.cookies.pass, function(o){
				if (o != null){
				    req.session.user = o;
					res.redirect('/');
				}	else{
					res.render('login', { title: 'Bem vindo - Por favor, acesse sua conta' });
				}
			});
		}
	});

	app.post('/login', function(req, res){
		AM.manualLogin(req.param('user'), req.param('pass'), function(e, o){
			if (!o){
				res.send(e, 400);
			}	else{
			    req.session.user = o;
				if (req.param('remember-me') == 'true'){
					res.cookie('user', o.user, { maxAge: 900000 });
					res.cookie('pass', o.pass, { maxAge: 900000 });
				}
				res.send(o, 200);
			}
		});
	});

// start page w/o login //

	app.get('/', function(req, res) {
		res.render('info_start');
	});

// logged-in user homepage //

	app.get('/home', function(req, res) {
		res.render('home');
	});

// Game //

	app.get('/game', function(req, res) {
		// res.render('game');

		// check if the user's credentials are saved in a cookie //
			if (req.cookies.user == undefined || req.cookies.pass == undefined){
				res.redirect('/game/login');
			}	else{
		// attempt automatic login //
				AM.autoLogin(req.cookies.user, req.cookies.pass, function(o){
					if (o != null){
							req.session.user = o;
						res.render('game', { title: 'Trinca Social - Jogo', udata: req.session.user });
					}	else{
					 	res.redirect('/game/login');
					}
				});
			}
	});

	app.post('/game', function(req, res){
		if (req.param('user') != undefined) {
			AM.publishTrinca({
				user 		: req.param('user'),
				card1 		: req.param('card1'),
				card2 		: req.param('card2'),
				card3 		: req.param('card3'),
				justif 	: req.param('justif')
			}, function(e, o){
				if (e){
					res.send('error-updating-account', 400);
				}else
					console.log('Ok.. posted')
					res.send('ok', 200);
			});
		}
	});

	app.get('/game/login', function(req, res){
	// check if the user's credentials are saved in a cookie //
		if (req.cookies.user == undefined || req.cookies.pass == undefined){
			res.render('login', { title: 'Bem vindo - Por favor, acesse sua conta' });
		}	else{
	// attempt automatic login //
			AM.autoLogin(req.cookies.user, req.cookies.pass, function(o){
				if (o != null){
				    req.session.user = o;
					res.redirect('/game');
				}	else{
					res.render('login', { title: 'Bem vindo - Por favor, acesse sua conta' });
				}
			});
		}
	});

	app.post('/game/login', function(req, res){
		AM.manualLogin(req.param('user'), req.param('pass'), function(e, o){
			if (!o){
				res.send(e, 400);
			}	else{
			    req.session.user = o;
				if (req.param('remember-me') == 'true'){
					res.cookie('user', o.user, { maxAge: 900000 });
					res.cookie('pass', o.pass, { maxAge: 900000 });
				}
				res.send(o, 200);
			}
		});
	});


// Profile com tiles //

	app.get('/profile', function(req, res) {
		res.render('profile');
	});

// Trinca published //

	app.get('/publish', function(req, res) {
		res.render('trinca_publish');
	});

// Trinca em votação //

	app.get('/voting', function(req, res) {
		res.render('trinca_voting');
	});

// Control panel //

	app.get('/acc-config', function(req, res) {
	    if (req.session.user == null){
	// if user is not logged-in redirect back to login page //
	        res.redirect('/login');
	    }   else{
			res.render('acc-config', {
				title : 'Control Panel',
				countries : CT,
				udata : req.session.user
			});
	    }
	});

	app.post('/acc-config', function(req, res){
		if (req.param('user') != undefined) {
			AM.updateAccount({
				user 		: req.param('user'),
				name 		: req.param('name'),
				email 		: req.param('email'),
				country 	: req.param('country'),
				pass		: req.param('pass')
			}, function(e, o){
				if (e){
					res.send('error-updating-account', 400);
				}	else{
					req.session.user = o;
			// update the user's login cookies if they exists //
					if (req.cookies.user != undefined && req.cookies.pass != undefined){
						res.cookie('user', o.user, { maxAge: 900000 });
						res.cookie('pass', o.pass, { maxAge: 900000 });
					}
					res.send('ok', 200);
				}
			});
		}	else if (req.param('logout') == 'true'){
			res.clearCookie('user');
			res.clearCookie('pass');
			req.session.destroy(function(e){ res.send('ok', 200); });
		}
	});

// creating new accounts //

	app.get('/signup', function(req, res) {
		res.render('signup', {  title: 'Cadastre-se', countries : CT });
	});

	app.post('/signup', function(req, res){
		AM.addNewAccount({
			name 	: req.param('name'),
			email 	: req.param('email'),
			user 	: req.param('user'),
			pass	: req.param('pass'),
			country : req.param('country')
		}, function(e){
			if (e){
				res.send(e, 400);
			}	else{
				res.send('ok', 200);
			}
		});
	});

// password reset //

	app.post('/lost-password', function(req, res){
	// look up the user's account via their email //
		AM.getAccountByEmail(req.param('email'), function(o){
			if (o){
				res.send('ok', 200);
				EM.dispatchResetPasswordLink(o, function(e, m){
				// this callback takes a moment to return //
				// should add an ajax loader to give user feedback //
					if (!e) {
					//	res.send('ok', 200);
					}	else{
						res.send('email-server-error', 400);
						for (k in e) console.log('error : ', k, e[k]);
					}
				});
			}	else{
				res.send('email-not-found', 400);
			}
		});
	});

	app.get('/reset-password', function(req, res) {
		var email = req.query["e"];
		var passH = req.query["p"];
		AM.validateResetLink(email, passH, function(e){
			if (e != 'ok'){
				res.redirect('/login');
			} else{
	// save the user's email in a session instead of sending to the client //
				req.session.reset = { email:email, passHash:passH };
				res.render('reset', { title : 'Mudar senha' });
			}
		})
	});

	app.post('/reset-password', function(req, res) {
		var nPass = req.param('pass');
	// retrieve the user's email from the session to lookup their account and reset password //
		var email = req.session.reset.email;
	// destory the session immediately after retrieving the stored email //
		req.session.destroy();
		AM.updatePassword(email, nPass, function(e, o){
			if (o){
				res.send('ok', 200);
			}	else{
				res.send('Não foi possível atualizar a senha', 400);
			}
		})
	});

// view & delete accounts //

	app.get('/print', function(req, res) {
		AM.getAllRecords( function(e, accounts){
			res.render('print', { title : 'Lista de Contas', accts : accounts });
		})
	});

	app.get('/print_trincas', function(req, res) {
		AM.getAllTrincaRecords( function(e, trincas){
			res.render('print_trincas', { title : 'Lista de Trincas', trcs : trincas });
		})
	});

	app.post('/delete', function(req, res){
		AM.deleteAccount(req.body.id, function(e, obj){
			if (!e){
				res.clearCookie('user');
				res.clearCookie('pass');
	            req.session.destroy(function(e){ res.send('ok', 200); });
			}	else{
				res.send('registro não encontrado', 400);
			}
	    });
	});

	app.get('/reset', function(req, res) {
		AM.delAllRecords(function(){
			res.redirect('/print');
		});
	});

	app.get('*', function(req, res) { res.render('404', { title: 'Página não encontrada'}); });

};
