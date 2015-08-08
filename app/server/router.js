
var CT = require('./modules/country-list');
var AM = require('./modules/account-manager');
var EM = require('./modules/email-dispatcher');
var trinca_id_found = "Not initialized.";

module.exports = function(app) {

	app.get('/demo*', function(req, res){
		res.render('sis_afa', { title: 'SisAFA - Server' });
	});


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
		// res.render('info_start', {title: 'Trinca Social - Inicio'});
		console.log("/info_start");
		AM.getAllTrincaRecords(function(e, trincas){
			console.log(trincas);
			res.render('info_start', {
				title : 'Trinca Social - Inicio',
				tdata: trincas
			});
		});
	});

	// page how to play
	app.get('/how_to_play', function(req, res) {
		res.render('how_to_play', {title: 'Trinca Social - Como Jogar'});
	});

	app.get('/rede_gentil', function(req, res) {
		res.render('rede_gentil', {title: 'Rede Gentil'});
	});

	// page the game
	app.get('/the_game', function(req, res) {
		res.render('the_game', {title: 'O jogo'});
	});

// logged-in user homepage //

	app.get('/home', function(req, res) {
		res.render('home', {title: 'Trinca Social - Inicio'});
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
				justif 	: req.param('justif'),
				status : req.param('status')
			}, function(e, o){
				if (e){
					res.send('error-updating-account', 400);
				}else
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
		if (req.session.user == null){
			// if user is not logged-in redirect back to login page //
				res.render('login', {title: 'Trinca Social - Perfil'});
		}
		else{
			AM.autoLogin(req.cookies.user, req.cookies.pass, function(o){
			if (o != null){
				AM.getAllTrincaUser( req.session.user, function(e, trincas){
					req.session.user = o;
					res.render('profile', {
						title : 'Trinca Social - Perfil',
						udata : req.session.user,
						tdata: trincas
					});
				})
			}
			else{
				res.render('login', { title: 'Bem vindo - Por favor, acesse sua conta' });
				}
			});
		}
	});

	app.post('/profile', function(req, res){
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

// Trinca published //

	app.get('/publish', function(req, res) {
		// res.render('trinca_publish');
		if (req.session.user == null){
			// if user is not logged-in redirect back to login page //
				res.render('login', {title: 'Trinca Social - Perfil'});
		}
		else{
			AM.autoLogin(req.cookies.user, req.cookies.pass, function(o){
			if (o != null){
				AM.getAllTrincaRecords(function(e, trincas){
					req.session.user = o;
					res.render('trinca_publish', {
						title : 'Trinca Social - Publicadas',
						tdata: trincas
					});
				});
			}
			else{
				res.render('login', { title: 'Bem vindo - Por favor, acesse sua conta' });
				}
			})
		}
	});

	app.post('/publish', function(req, res){
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


// Trinca em votação //

	var trinca_f = 0;
	var voteOp = true;

	app.get('/voting/:id', function(req, res) {
		if (req.session.user == null){
			// if user is not logged-in redirect back to login page //
			res.redirect('/publish');
		}
		else{
			AM.autoLogin(req.cookies.user, req.cookies.pass, function(o){
			if (o != null){
				req.session.user = o;

				AM.findTrincaById(req.params.id, function(trinca_ids){

					if(trinca_ids)
					{
						trinca_id_found = trinca_ids;
						this.trinca_f = trinca_ids;
					}
					console.log("≈√trinca_id_found = ");
					console.log(this.trinca_f);

					AM.findVotesByTrinca(this.trinca_f._id+"", function(votes){
						console.log("≈√votes");
						console.log(votes);

						this.voteOp = true;

						for(k in votes)
						{
							if((votes[k].user_guest == req.session.user.user) && (votes[k].vote != "comment")){
								this.voteOp = false;
							}
						}
						res.render('trinca_voting', {
							title : 'Trinca Social - Votação',
							tdata: this.trinca_f,
							udata: req.session.user,
							tvotes: votes,
							canVote: this.voteOp
						});
					});

				});

			}
			else{
				res.render('login', { title: 'Bem vindo - Por favor, acesse sua conta' });
				}
			});
		}
	});


	app.post('/voting/:id', function(req, res) {

		AM.commentTrinca({
			//TODO req.param('user') is returning null, need to get the right value from the page.
				user_guest: req.cookies.user,
				comment: req.param('comment'),
				vote: req.param('vote'),
				trinca_id: this.trinca_f
			},
			function(){
				// res.cookie('tr_id', req.params.id, {maxAge: 900000});
				AM.autoLogin(req.cookies.user, req.cookies.pass, function(o){
				if (o != null){
					req.session.user = o;

						AM.findVotesByTrinca(this.trinca_f._id, function(votes){
							res.render('trinca_voting', {
								title : 'Trinca Social - Votação',
								tdata: this.trinca_f,
								udata: req.cookies.user,
								tvotes: votes
							});
						});
				}
				else{
					//VERIFY
					res.redirect('/publish');
					}
				});
			});
	});

	// LOGOUT //

		app.get('/logout', function(req, res) {
			req.session.destroy(function () {
				res.redirect('/');
			});
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
	//
	// app.get('/print', function(req, res) {
	// 	AM.getAllRecords( function(e, accounts){
	// 		res.render('print', { title : 'Lista de Contas', accts : accounts });
	// 	})
	// });
	//
	// app.get('/print_trincas', function(req, res) {
	// 	AM.getAllTrincaUser( req.session.user, function(e, trincas){
	// 		res.render('print_trincas', { title : 'Lista de Trincas', trcs : trincas });
	// 	})
	// });
	//
	// app.get('/print_comments', function(req, res) {
	// 	if(req.session.trid){
	// 		console.log(req.session.trid);
	// 		AM.findTrincaById( req.session.trid, function(trinca){
	// 			res.render('print_comments', {
	// 				title : 'Trinca Social - Votação (comentários)',
	// 				trcs	: trinca,
	// 			});
	// 		});
	// 	}else res.send('registro não encontrado!', 400);
	// });

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

	// app.get('/reset', function(req, res) {
	// 	AM.delAllRecords(function(){
	// 		res.redirect('/print');
	// 	});
	// });

	app.get('*', function(req, res) { res.render('404', { title: 'Página não encontrada'}); });

};
