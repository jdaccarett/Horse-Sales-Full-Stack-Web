// Reference to mysql
var mysql = require('mysql');

var pool = mysql.createPool({

    connectionLimit : 10,
    host            : 'localhost',
    user            : 'root',
    password        : 'weeman91',
    database        : 'finalproject'

});

module.exports.pool = pool;
