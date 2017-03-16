var express = require('express');
var mysql = require('./dbcon.js');

var app = express();
var handlebars = require('express-handlebars').create({
    default: 'main'
});
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
app.set('port', process.argv[2]);
//Allows me to use stylesheets in handlebars.
app.use(express.static('public'));



//home page starts with get.
app.get('/', function (req, res) {
    res.render('homePage');
});

//Form to add info to all the tables
app.get('/insert', function (req, res) {
    res.render('sale-form');
});

/************************************************************/
/*                   INSERTS INTO ALL TABLES                */
/*                                                          */
/* Inserts Into all the tables needed to add a horse for    */
/* forsale including its location and owner_info            */
/************************************************************/

app.get('/add-horse', function (req, res) {

    var context = {};
    context.sentData = req.query;

    //QUERY TO INSERT OWNER INFO
    mysql.pool.query("insert into Owner (`email`, `first_name`, `last_name`, `phone_number`) VALUES (?,?,?,?)", [context.sentData.email, context.sentData.first_name, context.sentData.last_name, context.sentData.phone_number], function (err, result) {
        if (err) {
            next(err);
            return;
        }
    });
    
    //QUERY TO INSERT HORSE BREED AND COUNTRY OF ORIGIN
    if (context.sentData.Type && context.sentData.country) {
        mysql.pool.query("insert into Breeds (`Type`, `country`) VALUES (?,?)", [context.sentData.Type, context.sentData.country], function (err, result) {
            if (err) {
                console.log("error:" + err);
                next(err);
                return;
            }
        });
    }

   //QUERY TO INSERT HORSES LOCATION
   if (context.sentData.state && context.sentData.city && context.sentData.street && context.sentData.zipcode && context.sentData.country_of_stay) {
       mysql.pool.query("insert into Address (`state`, `city`, `street`, `zipcode`, `country_of_stay`) VALUES (?,?,?,?,?)", [context.sentData.state, context.sentData.city, context.sentData.street, context.sentData.zipcode, context.sentData.country_of_stay], function (err, result) {
           if (err) {
               console.log("error:" + err);
               next(err);
               return;
           }
       });
   }

  //QUERY TO INSERT HORSE'S INFO
  if (context.sentData.email && context.sentData.Type && context.sentData.street && context.sentData.age && context.sentData.bio && context.sentData.price) {
      mysql.pool.query("insert into Animal (owner_id, breed_id, address_id, age, bio, price) Values((SELECT owner_id From Owner Where email = ?), (SELECT breed_id From Breeds Where Type = ?), (SELECT address_id From Address Where street = ?), ?, ?, ?)", [context.sentData.email, context.sentData.Type, context.sentData.street, context.sentData.age, context.sentData.bio, context.sentData.price], function (err, result) {
          if (err) {
              console.log("error:" + err);
              next(err);
              return;
          }
      });
  }
    
    console.log('Street = '+context.sentData.street);
    console.log('Records = '+context.sentData.records);
    console.log('age = '+context.sentData.age);

    
  //QUERY TO INSERT Medical_Info
  if (context.sentData.email && context.sentData.price && context.sentData.records) {
      mysql.pool.query('insert into Medical_Record (animal_id, owner_id, `records`) VALUES ((SELECT animal_id From Animal Where price = ?), (SELECT owner_id From Owner Where email = ?), ?)', [context.sentData.price, context.sentData.email, context.sentData.records], function (err, result) {
          if (err) {
              console.log("error:" + err);
              next(err);
              return;
          }
      });
  }
  res.render('homePage');
  });

/************************************************************/
/*                   SELECT QUERY ALL TABLES                */
/*                                                          */
/* Displays all the tables Where users can see what horses  */
/* are for sale and their cost.                             */                     /************************************************************/
app.get('/forsale', function (req, res, next) {
    var context = {};
    mysql.pool.query('Select Animal.animal_id AS ID,Animal.price AS Asking_Price, Animal.age AS Age, Breeds.Type AS Breed, Owner.first_name As Owner, Owner.phone_number AS Contact, Address.state, Address.city, Medical_Record.records As Medical_Records FROM ANIMAL INNER JOIN Breeds ON Animal.breed_id = Breeds.breed_id INNER JOIN Owner ON Animal.owner_id = Owner.owner_id INNER JOIN Address ON Animal.address_id = Address.address_id INNER JOIN Medical_Record ON Medical_Record.animal_id = Animal.animal_id', function (err, rows, fields) {
    if (err) {
        next(err);
        console.log("error:" + err);
        return;
    }
    context.results = JSON.stringify(rows);
    var horses = [];
    for (var i = 0, len = rows.length; i < len; i++) {
        horses.push(rows[i]);
    }
    context.results = horses;
    res.render('forsale', context);
 
   });

});


//Form to update price of certain horse
app.get('/Update', function (req, res) {
    res.render('price-form');
});

//Query to Update Price
app.get('/price-change', function (req, res, next) {
    var context = {};
    context.sentData = req.query;
    mysql.pool.query("UPDATE Animal SET price = ? WHERE animal_id = ?", [context.sentData.price, context.sentData.animal_id], function (err, rows, fields) {
        if (err) {
            next(err);
            return;
        }
    });
});



//Form to updata price of certain horse
app.get('/search', function (req, res) {
    res.render('search-form');
});


/************************************************************/
/*                   UPDATE PRICE QUERY                     */
/*                                                          */
/* Updates the price of the horse id that was selected      */
/************************************************************/

app.get('/search-price', function (req, res, next) {
    var context = {};
    context.sentData = req.query;

    mysql.pool.query("Select Animal.animal_id AS ID,Animal.price AS Asking_Price, Animal.age AS Age, Breeds.Type AS Breed, Owner.first_name As Owner, Owner.phone_number AS Contact, Address.state, Address.city, Medical_Record.records As Medical_Records FROM ANIMAL INNER JOIN Breeds ON Animal.breed_id = Breeds.breed_id INNER JOIN Owner ON Animal.owner_id = Owner.owner_id INNER JOIN Address ON Animal.address_id = Address.address_id INNER JOIN Medical_Record ON Medical_Record.animal_id = Animal.animal_id where Animal.price <= ?", [context.sentData.price], function (err, rows, fields) {
    if (err) {
        next(err);
        return;
    }
    context.results = JSON.stringify(rows);
    var horses = [];
    for (var i = 0, len = rows.length; i < len; i++) {
        horses.push(rows[i]);
    }
    context.results = horses;
    res.render('search-table', context);
    
    });
});

//NOT FOUND
app.use(function(req,res){
  res.type('text/plain');
  res.status(404);
  res.send('404 - Not Found');
});

//SERVER ERROR
app.use(function(err, req, res, next){
  console.error(err.stack);
  res.type('plain/text');
  res.status(500);
  res.send('500 - Server Error');
});


app.listen(app.get('port'), function(){
  console.log('Express started on http://localhost:' + app.get('port') + '; press Ctrl-C to terminate.');
});
