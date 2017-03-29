// Reference to mysql
var mysql = require('mysql');

var pool = mysql.createPool({

    connectionLimit : 10,
    host            : '',
    user            : '',
    password        : '',
    database        : 'finalproject'
    
});

module.exports.pool = pool;
