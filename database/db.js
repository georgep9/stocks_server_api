const mysql = require('mysql');

const connection = mysql.createConnection({
	host	: 'localhost',
	user	: 'root',
	password: '',
	database: 'webcomputing'
});

connection.connect(function(err) { if (err) throw errr; });

module.exports = (req, res, next) => {
	req.db = connection;
	next();
}


