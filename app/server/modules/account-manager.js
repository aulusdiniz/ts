
var crypto 		= require('crypto');
var MongoDB 	= require('mongodb').Db;
var Server 		= require('mongodb').Server;
var moment 		= require('moment');
var ObjectID = require('mongodb').ObjectID

var dbPort 		= 27017;
var dbHost 		= 'localhost';
var dbName 		= 'node-login';

/* establish the database connection */

var db = new MongoDB(dbName, new Server(dbHost, dbPort, {auto_reconnect: true}), {w: 1});
	db.open(function(e, d){
	if (e) {
		console.log(e);
	}	else{
		console.log('connected to database :: ' + dbName);
	}
});

var accounts = db.collection('accounts');

var trincas = db.collection('trincas');

var votes = db.collection('votes');

// numero de votos positivos para encerrar a trinca.
var nOkTrincasForAccept = 15;

var setTrincaStatus = function()
{

}

// 86400000
setInterval(function()
{
	trincas.find().sort({ $natural : -1 }).toArray(
		function(e, res) {
		if (e) console.log(e);
		else {
			var ind = 0;
			for(ind = 0; ind < res.length; ind++){
				var a = moment(res[ind].date, "MMMM DD YYYY, h:mm:ss a").toArray();
				var b = a;

				if(parseInt(moment(b).startOf('second').fromNow())>2)
				{

					try{
						var id_found = ObjectID.createFromHexString(res[ind]._id);
						votes.find({"trinca_id._id": id_found, "vote":"good"}).toArray(function(e, res){
							var count = res.length
							// numero de votos positivos para encerrar a trinca a provada.
							if(count>this.nOkTrincasForAccept){
								res[ind].status = "accept";
								trincas.save(res[ind], {safe: true}, function(){
								});
							}
						});

					}catch(e){
						var id_found = res[ind]._id;
						votes.find({"trinca_id._id": id_found, "vote":"good"}).toArray(function(e, res){
							var count = res.length
							// numero de votos positivos para encerrar a trinca a provada.
							if(count>this.nOkTrincasForAccept){
								res[ind].status = "accept";
								trincas.save(res[ind], {safe: true}, function(){
								});
							}
						});
					}
				}
			}
		}
	});
}, 5000);

exports.commentTrinca = function(newData, callback){
	votes.insert(newData, {safe:true}, callback);
}

exports.findVotesByTrinca = function(id, callback){
	// var id_found = ObjectID.createFromHexString(id);
	// try without _id: id_found ==>> {trinca_id: {_id: id_found}}

	try{
		var id_found = ObjectID.createFromHexString(id);
		votes.find({"trinca_id._id": id_found}).sort({ $natural : -1 }).toArray(
			function(e, res) {
				if (e) callback(e)
				else callback(res)
			});
	}catch(e){
		console.log("findVotesByTrinca FAILED! :> " + e);
		var id_found = id;
		votes.find({"trinca_id._id": id_found}).sort({ $natural : -1 }).toArray(
			function(e, res) {
				if (e) callback(e)
				else callback(res)
			});
	}
}

exports.publishTrinca = function(newData, callback){
	trincas.findOne({user:newData.user}, function(e, o){
		newData.date = moment().format('MMMM Do YYYY, h:mm:ss a');
		trincas.insert(newData, {safe: true}, callback);
	});
}

exports.getAllTrincaRecords = function(callback)
{
	trincas.find().sort({ $natural : -1 }).toArray(
		function(e, res) {
		if (e) callback(e)
		else {
			var ind = 0;
			for(ind = 0; ind < res.length; ind++){
				var a = moment(res[ind].date, "MMMM DD YYYY, h:mm:ss a").toArray();
				var b = a;
				res[ind].date = moment(b).startOf('second').fromNow();
			}
			callback(null, res);
		}
	});
}

exports.getAllTrincaUser = function(data, callback)
{
	trincas.find({user:data.user}).sort({ $natural : -1 }).toArray(
		function(e, res) {
		if (e) callback(e)
		else{
			for(ind = 0; ind < res.length; ind++){
				var a = moment(res[ind].date, "MMMM DD YYYY, h:mm:ss a").toArray();
				var b = a;
				res[ind].date = moment(b).startOf('second').fromNow();
			}
		callback(null, res);
		}
	});
}

exports.findTrincaById = function(id, callback)
{
	try{
		var id_found = ObjectID.createFromHexString(id);
	}catch(e){
		var id_found = id;
	}

	trincas.findOne({_id: id_found}, function(e, res) {
 		if(res)
		{
			var a = moment(res.date, "MMMM DD YYYY, h:mm:ss a").toArray();
			var b = a;
			res.date = moment(b).startOf('second').fromNow();
			callback(res);
		}
		else
		{
			callback(e);
		}
	});
}

/* login validation methods */

exports.autoLogin = function(user, pass, callback)
{
	accounts.findOne({user:user}, function(e, o) {
		if (o){
			o.pass == pass ? callback(o) : callback(null);
		}	else{
			callback(null);
		}
	});
}

exports.manualLogin = function(user, pass, callback)
{
	accounts.findOne({user:user}, function(e, o) {
		if (o == null){
			callback('user-not-found');
		}	else{
			validatePassword(pass, o.pass, function(err, res) {
				if (res){
					callback(null, o);
				}	else{
					callback('invalid-password');
				}
			});
		}
	});
}

/* record insertion, update & deletion methods */

exports.addNewAccount = function(newData, callback)
{
	accounts.findOne({user:newData.user}, function(e, o) {
		if (o){
			callback('username-taken');
		}	else{
			accounts.findOne({email:newData.email}, function(e, o) {
				if (o){
					callback('email-taken');
				}	else{
					saltAndHash(newData.pass, function(hash){
						newData.pass = hash;
					// append date stamp when record was created //
						newData.date = moment().format('MMMM Do YYYY, h:mm:ss a');
						accounts.insert(newData, {safe: true}, callback);
					});
				}
			});
		}
	});
}

exports.updateAccount = function(newData, callback)
{
	accounts.findOne({user:newData.user}, function(e, o){
		o.name 		= newData.name;
		o.email 	= newData.email;
		o.country 	= newData.country;
		if (newData.pass == ''){
			accounts.save(o, {safe: true}, function(err) {
				if (err) callback(err);
				else callback(null, o);
			});
		}	else{
			saltAndHash(newData.pass, function(hash){
				o.pass = hash;
				accounts.save(o, {safe: true}, function(err) {
					if (err) callback(err);
					else callback(null, o);
				});
			});
		}
	});
}

exports.updatePassword = function(email, newPass, callback)
{
	accounts.findOne({email:email}, function(e, o){
		if (e){
			callback(e, null);
		}	else{
			saltAndHash(newPass, function(hash){
		        o.pass = hash;
		        accounts.save(o, {safe: true}, callback);
			});
		}
	});
}

/* account lookup methods */

exports.deleteAccount = function(id, callback)
{
	accounts.remove({_id: getObjectId(id)}, callback);
}

exports.getAccountByEmail = function(email, callback)
{
	accounts.findOne({email:email}, function(e, o){ callback(o); });
}

exports.validateResetLink = function(email, passHash, callback)
{
	accounts.find({ $and: [{email:email, pass:passHash}] }, function(e, o){
		callback(o ? 'ok' : null);
	});
}

exports.getAllRecords = function(callback)
{
	accounts.find().toArray(
		function(e, res) {
		if (e) callback(e)
		else callback(null, res)
	});
};

exports.delAllRecords = function(callback)
{
	accounts.remove({}, callback); // reset accounts collection for testing //
}

/* private encryption & validation methods */

var generateSalt = function()
{
	var set = '0123456789abcdefghijklmnopqurstuvwxyzABCDEFGHIJKLMNOPQURSTUVWXYZ';
	var salt = '';
	for (var i = 0; i < 10; i++) {
		var p = Math.floor(Math.random() * set.length);
		salt += set[p];
	}
	return salt;
}

var md5 = function(str) {
	return crypto.createHash('md5').update(str).digest('hex');
}

var saltAndHash = function(pass, callback)
{
	var salt = generateSalt();
	callback(salt + md5(pass + salt));
}

var validatePassword = function(plainPass, hashedPass, callback)
{
	var salt = hashedPass.substr(0, 10);
	var validHash = salt + md5(plainPass + salt);
	callback(null, hashedPass === validHash);
}

/* auxiliary methods */

var getObjectId = function(id)
{
	return accounts.db.bson_serializer.ObjectID.createFromHexString(id)
}

var findById = function(id, callback)
{
	accounts.findOne({_id: getObjectId(id)},
		function(e, res) {
		if (e) callback(e)
		else callback(null, res)
	});
};


var findByMultipleFields = function(a, callback)
{
// this takes an array of name/val pairs to search against {fieldName : 'value'} //
	accounts.find( { $or : a } ).toArray(
		function(e, results) {
		if (e) callback(e)
		else callback(null, results)
	});
}
