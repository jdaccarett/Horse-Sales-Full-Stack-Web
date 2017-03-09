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


//Insert Data into Adress of Horse
app.get('/sale-form', function (req, res) {
    var context = {};
    context.sentData = req.query;
    
    console.log(context.sentData.state);
    
    //QUERY TO INSERT OWNER INFO

        mysql.pool.query("insert into Owner (`email`, `first_name`, `last_name`, `phone_number`) VALUES (?,?,?,?)", [context.sentData.email, context.sentData.first_name, context.sentData.last_name, context.sentData.phone_number],function(err, result){
      if(err){
        next(err);
        return;
       }           
     });
    


   //QUERY TO INSERT HORSE BREED AND COUNTRY OF ORIGIN
   if(context.sentData.Type && context.sentData.country){
        mysql.pool.query("insert into Breeds (`Type`, `country`) VALUES (?,?)", [context.sentData.Type, context.sentData.country],function(err, result){
      if(err){
        next(err);
        return;
      }
              
    });
  }
   
   
   //QUERY TO INSERT HORSES LOCATION    
   if(context.sentData.state && context.sentData.city && context.sentData.street && context.sentData.zipcode &&          context.sentData.country_of_stay){
      mysql.pool.query("insert into Address (`state`, `city`, `street`, `zipcode`, `country_of_stay`) VALUES (?,?,?,?,?)", [context.sentData.state, context.sentData.city, context.sentData.street, context.sentData.zipcode, context.sentData.country_of_stay],function(err, result){
     if(err){
        next(err);
        return;
      }                 
    });
  }

//  //QUERY TO INSERT HORSE'S INFO
//   if(context.sentData.Type && context.sentData.country){
//        mysql.pool.query("insert into Animal(age, bio, price) VALUES (?,?,?,?,?,?)", [context.sentData.owner_id, context.sentData.age, context.sentData.bio, context.sentData.price],function(err, result){
//      if(err){
//        next(err);
//        return;
//      }
//              
//    });
//  }
    

 res.render('sale-form',context);

});


////Insert Data Into Owner of Horse
//app.get('/User', function (req, res, next){
//    var context = {};
//    context.sentData = req.query;
//    
//    console.log(context.sentData.email);
//    
//    if(context.sentData.email && context.sentData.first_name && context.sentData.last_name, context.sentData.phone_number){
//        mysql.pool.query("insert into Owner (`email`, `first_name`, `last_name`, `phone_number`) VALUES (?,?,?,?)", [context.sentData.email, context.sentData.first_name, context.sentData.last_name, context.sentData.phone_number],function(err, result){
//      if(err){
//        next(err);
//        return;
//      }
//              
//    });
//}
//
//     res.render('user-info',context);
//});


/************************************************************/
/*                   SELECT QUERY ALL TABLES                */
/*                                                          */
/* Displays all the tables Where users can see what horses  */ 
/* are for sale and their cost.                             */                     /************************************************************/
app.get('/forsale', function (req, res, next) {
    var context = {};
    mysql.pool.query('Select Animal.animal_id AS ID,Animal.price AS Asking_Price, Animal.age AS Age, Breeds.Type AS Breed, Owner.first_name As Owner, Owner.phone_number AS Contact, Address.state, Address.city, Medical_Record.records As Medical_Records FROM ANIMAL INNER JOIN Breeds ON Animal.breed_id = Breeds.breed_id INNER JOIN Owner ON Animal.owner_id = Owner.owner_id INNER JOIN Address ON Animal.address_id = Address.address_id INNER JOIN Medical_Record ON Medical_Record.animal_id = Animal.animal_id',function(err, rows, fields){
       if(err){
           next(err);
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



//Insert Data BREEDS Table
app.get('/form', function (req, res, next){
    var context = {};
    context.sentData = req.query;
    
    console.log(context.sentData.Type);
    
    if(context.sentData.Type && context.sentData.country){
        mysql.pool.query("insert into Breeds (`Type`, `country`) VALUES (?,?)", [context.sentData.Type, context.sentData.country],function(err, result){
      if(err){
        next(err);
        return;
      }
              
    });
}

     res.render('form-breed',context);

});



app.use(function(req,res){
  res.type('text/plain');
  res.status(404);
  res.send('404 - Not Found');
});

app.use(function(err, req, res, next){
  console.error(err.stack);
  res.type('plain/text');
  res.status(500);
  res.send('500 - Server Error');
});


app.listen(app.get('port'), function(){
  console.log('Express started on http://localhost:' + app.get('port') + '; press Ctrl-C to terminate.');
});
