var express = require('express');
var router = express.Router();
var fs = require('fs');

/* GET home page. */
router.get('/', function(req, res, next) {

	var files = [];
	try { 
		files = fs.readdirSync('public/output').map((file) => file.split('.')[0])
	} catch (err) {
		files = fs.readdirSync('public/outputCopy').map((file) => file.split('.')[0])
	}

  res.render('index', { files: files });
});

module.exports = router;
