var express = require('express');
var mysql = require('mysql');

var app = express();
var handlebars = require('express-handlebars').create({defaultLayout:'main'});

app.use(express.static(__dirname + '/static'));


app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
app.set('port', 6740);

//Body parser for POST//
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded( {extended: false} ));
app.use(bodyParser.json());

//Start of handlers
app.get('/',function(req,res){
  res.render('home');
});

app.get('/browsepokemon',function(req,res){
  var con = sqlObj();
  var sql = "";
  var context = {};
  
  console.log(req.query.key);
  console.log(req.query.value);
   
  if(req.query.key && req.query.value){
		sql = "SELECT * FROM Pokemon WHERE `" + req.query.key + "`=" + req.query.value;
		context.filter = true;
  } else {
		sql = "SELECT * FROM Pokemon";
  }
  console.log(sql);
  con.connect(function(err) {
    if (err) throw err;
    con.query(sql, function (err, result, fields) {
      if (err) throw err;

	context.sqlResult = result;
	context.sqlCol = fields;
	res.render('browsepokemon', context);
	con.end();
    });
  });
});

app.get('/browsetrainer',function(req,res){
	var con = sqlObj();
	var sql = "";
	var context = {};
	
	if(req.query.key && req.query.value){
		sql = "SELECT * FROM Trainer WHERE `" + req.query.key + "`=" + req.query.value;  
		context.filter = true;
	} else {
		sql = "SELECT * FROM Trainer"; 
	}
  
	con.connect(function(err) {
		if (err) throw err;
		con.query(sql, function (err, result, fields) {
			if (err) throw err;

			context.sqlResult = result;
			context.sqlCol = fields;
			res.render('browsetrainer', context);
			con.end();
		});
	});
});

app.get('/browsemove',function(req,res){
	var con = sqlObj();
	var context = {};

	if(req.query.key && req.query.value){
		sql = "SELECT * FROM Move WHERE `" + req.query.key + "`=" + req.query.value;
		context.filter = true;
	} else {
		sql = "SELECT * FROM Move";
	}

	con.connect(function(err) {
		if (err) throw err;
		con.query(sql, function (err, result, fields) {
			if (err) throw err;

			context.sqlResult = result;
			context.sqlCol = fields;
			res.render('browsemove', context);
			con.end();
		});
	});
});

app.get('/browseitem',function(req,res){
	var con = sqlObj();
	var context = {};

	if(req.query.key && req.query.value){
		sql = "SELECT * FROM Item WHERE `" + req.query.key + "`=" + req.query.value;
		context.filter = true;
	} else {
		sql = "SELECT * FROM Item";
	}

	con.connect(function(err) {
		if (err) throw err;
		con.query(sql, function (err, result, fields) {
			if (err) throw err;

			context.sqlResult = result;
			context.sqlCol = fields;
			res.render('browseitem', context);
			con.end();
		});
	});
});
//end browse

//start add
app.get('/addpokemon',function(req,res){

	var con = sqlObj();
	var context = {};
	var moveList = {};
	
	con.connect(function(err) {
		if (err) {
			context.state = "Error: Unable to connect to SQL.";
			res.render('addpokemon', context);
		} else {
			var sql = "SELECT `ID`, `Name` FROM `Move`;"
			con.query(sql, function(err, result){
				if (err) {
					context.state = "Error: Could not obtain move list.";
				} else {
					console.log(result);
					context.pmoves = result;
				}
			});
			
		sql = "SELECT `ID`, `Name` FROM `Trainer`;"
			con.query(sql, function(err, result){
				if (err) {
					context.state = "Error: Could not obtain trainer list.";
				} else {
					//console.log(result);
					context.trainerlist = result;
				}
				res.render('addpokemon', context);
				con.end();
			});			
		}
	});
});

app.post('/addpokemon', function(req, res) {
    var con = sqlObj();
    var context = {};
	
    con.connect(function(err) {
		if (err) {
			context.state = "Error: Unable to connect to SQL.";
			res.render('addpokemon', context);
		} else {
			if(req.body['TrainerSelect'] == "None"){
				req.body['TrainerSelect'] = 'NULL';
			 } else {
				req.body['TrainerSelect'] = "'" + req.body['TrainerSelect'] + "'";
			 }
			 //console.log(req.body['TrainerSelect']);
			var sql1 = "INSERT INTO Pokemon (`SpeciesName`, `Number`, `Nickname`, `Level`, `Gender`, `TrainerID`) VALUES (" + "'" + req.body['SpeciesName'] + "', " + req.body['PokemonNumber'] + ", '" + req.body['Nickname'] + "', " + req.body['Level'] + ", " + req.body['Gender'] + ", " + req.body['TrainerSelect'] + ")";    
			
			con.query(sql1, function (err, result) {
				if (err) {
					console.log(err);
					context.state = "Error: Could not add Pokemon.";
				} else {
					//Adding first move of Pokemon into Pokemon-Move table
					var sql2 = "INSERT INTO `Pokemon-Move` (`PokemonID`, `MoveID`) VALUES (" + result.insertId + "," + req.body['move1'] + ");"
					con.query(sql2, function (err, result) {
					});
					
					//If user selected a second move
					if(req.body['move2'] == "None"){
						//do nothing
					} else {
						sql2 = "INSERT INTO `Pokemon-Move` (`PokemonID`, `MoveID`) VALUES (" + result.insertId + "," + req.body['move2'] + ");"
						con.query(sql2, function (err, result) {
						});
					}

					//If user selected a third move
					if(req.body['move3'] == "None"){
						//do nothing
					} else {
						sql2 = "INSERT INTO `Pokemon-Move` (`PokemonID`, `MoveID`) VALUES (" + result.insertId + "," + req.body['move3'] + ");"
						con.query(sql2, function (err, result) {
						});
					}
					
					//If user selected a forth move
					if(req.body['move4'] == "None"){
						//do nothing
					} else {
						sql2 = "INSERT INTO `Pokemon-Move` (`PokemonID`, `MoveID`) VALUES (" + result.insertId + "," + req.body['move4'] + ");"
						con.query(sql2, function (err, result) {
						});
					}
					
					context.state = "Success: Added Pokemon " + req.body['SpeciesName'];
				}
				
				var sql3 = "SELECT `ID`, `Name` FROM `Move`;"
				con.query(sql3, function(err, result){
					if (err) {
						//do nothing
					} else {
						context.pmoves = result;
						res.render('addpokemon', context);
						con.end();
					}
				});				

			});
		}
    });
});

app.get('/addtrainer',function(req,res){
        res.render('addtrainer');
});

app.post('/addtrainer', function(req, res) {
    var con = sqlObj();
    var context = {};
    con.connect(function(err) {
		if (err) {
			context.state = "Error: Unable to connect to SQL.";
			res.render('addtrainer', context);
		} else {
			console.log("Connected");
			var sql = "INSERT INTO Trainer (`Name`, `Gender`, `Money`) VALUES (" + "'"+ req.body['Name'] +"', '" + req.body['Gender'] + "', '" + req.body['Money'] + "')";
			console.log(sql);
			con.query(sql, function (err, result) {
				if (err) {
					context.state = "Error: Could not add trainer.";
				} else {
					context.state = "Success: Added trainer " + req.body['Name'];
					//console.log(result.affectedRows + " record(s) added");
				}
				res.render('addtrainer', context);
				con.end();
			});
		}
    });
});

app.get('/addmove',function(req,res){
        res.render('addmove');
});

app.post('/addmove', function(req, res) {
    var con = sqlObj();
    var context = {};
    con.connect(function(err) {
		if (err) {
			context.state = "Error: Unable to connect to SQL.";
			res.render('addmove', context);
		} else {
			console.log("Connected");
			var sql = "INSERT INTO `Move` (`Name`, `AttackPower`, `PP`, `Description`) VALUES (" + "'"+ req.body['Name'] +"', '" + req.body['AttackPower'] + "', '" + req.body['PP'] + "', '" + req.body['Description'] + "')";
			console.log(sql);
			con.query(sql, function (err, result) {
				if (err) {
					context.state = "Error: Could not add move.";
				} else {
					context.state = "Success: Added move " + req.body['Name'];
					console.log(result.affectedRows + " record(s) added");
				}
				res.render('addmove', context);
				con.end();
			});
		}
    });
});

app.get('/additem',function(req,res){
	var con = sqlObj();
	var context = {};
	
	con.connect(function(err) {
		if (err) {
			context.state = "Error: Unable to connect to SQL.";
			res.render('additem', context);
		} else {
            var sql_Trainer = "SELECT `ID`, `Name` FROM `Trainer`";
            var sql_Pokemon = "SELECT `ID`, `SpeciesName` FROM `Pokemon`";
			con.query(sql_Trainer, function(err, result){
				if (err) {
					context.state = "Error: Could not run query.";
				} else {
					//console.log(result);
					context.trainer = result;
				}
				
            });
            
            con.query(sql_Pokemon, function(err, result){
				if (err) {
					context.state = "Error: Could not run query.";
				} else {
					//console.log(result);
					context.pokemon = result;
				}
				res.render('additem', context);
				con.end();
            });
		}
	});
});

app.post('/additem', function(req, res) {
    var con = sqlObj();
    var context = {};
	var sql = "";
	var sql_ItemHolder = "";

    con.connect(function(err) {
		if (err) {
			context.state = "Error: Unable to connect to SQL.";
			res.render('additem', context);
		} else {
			if(req.body['TrainerID'] == "None" && req.body['PokemonID'] == "None"){
				sql = "INSERT INTO Item (`Name`, `ActionType`, `ActionValue`, `Description`) VALUES (" + "'"+ req.body['Name'] +"', " + req.body['ActionType'] + ", " + req.body['ActionValue'] + ", '" + req.body['Description'] + "')"; 

				con.query(sql, function(err, result){
					if (err) {context.state = "Error: Could not add item.";}
					else {context.state = "Item added.";}
				});
			} else if (req.body['TrainerID'] != "None"){ //Note: Even if PokemonID is selected, TrainerID overrides PokemonID selection
				sql_ItemHolder = "INSERT INTO `ItemHolder`(`TrainerID`) VALUES (" + req.body['TrainerID'] + ")";
				con.query(sql_ItemHolder, function(err, result){
					if (err) {
						context.state = "Error: Could not add item.";
					}else {
						sql = "INSERT INTO Item (`Name`, `ActionType`, `ActionValue`, `Description`, `ItemHolderID`) VALUES (" + "'"+ req.body['Name'] +"', " + req.body['ActionType'] + ", " + req.body['ActionValue'] + ", '" + req.body['Description'] + "', " + result.insertId + ")"; 
						
						con.query(sql, function(err, result){
							if (err) {context.state = "Error: Could not add item.";}
							else {context.state = "Item added.";}
						});
					}
				});
			} else { //req.body['PokemonID'] != "None"
				sql_ItemHolder = "INSERT INTO `ItemHolder`(`PokemonID`) VALUES (" + req.body['PokemonID'] + ")";
				
				con.query(sql_ItemHolder, function(err, result){
					if (err) {
						context.state = "Error: Could not add item.";
					}else {
						sql = "INSERT INTO Item (`Name`, `ActionType`, `ActionValue`, `Description`, `ItemHolderID`) VALUES (" + "'"+ req.body['Name'] +"', " + req.body['ActionType'] + ", " + req.body['ActionValue'] + ", '" + req.body['Description'] + "', " + result.insertId + ")"; 
						
						con.query(sql, function(err, result){
							if (err) {context.state = "Error: Could not add item.";}
							else {context.state = "Item added.";}
						});
					}
				});
			}
			
			var sql_Trainer = "SELECT `ID`, `Name` FROM `Trainer`";
            var sql_Pokemon = "SELECT `ID`, `SpeciesName` FROM `Pokemon`";
			con.query(sql_Trainer, function(err, result){
				if (err) {
					context.state = "Error: Could not run query.";
				} else {
					//console.log(result);
					context.trainer = result;
				}
				
            });
            
            con.query(sql_Pokemon, function(err, result){
				if (err) {
					context.state = "Error: Could not run query.";
				} else {
					//console.log(result);
					context.pokemon = result;
				}
				res.render('additem', context);
				con.end();
            });
			
			
		}
    });
});
// add end

// delete start
// render dropdown to remove trainer
app.get('/removetrainer',function(req,res){

	var con = sqlObj();
	var context = {};
	
	con.connect(function(err) {
		if (err) {
			context.state = "Error: Unable to connect to SQL.";
			res.render('removetrainer', context);
		} else {
			var sql = "SELECT `ID`, `Name` FROM `Trainer`;"
			con.query(sql, function(err, result){
				if (err) {
					context.state = "Error: Could not run query.";
				} else {
					//console.log(result);
					context.trainer = result;
				}
				res.render('removetrainer', context);
				con.end();
			});
		}
	});
});


app.post('/removetrainer', function(req, res) {
	var con = sqlObj();
	var context = {};
	con.connect(function(err) {
		if (err) {
			context.state = "Error: Unable to connect to SQL.";
			res.render('removetrainer', context);
		} else {
            // contected
            //console.log("connected");

            var sql = "DELETE FROM `Trainer` WHERE `ID`=" + req.body['TrainerID'];
			//console.log(sql);
			con.query(sql, function (err, result) {
				if (err) { 
					context.state = "Error: Could not remove trainer or none was selected."; 
				} else {
					context.state = "Success: Deleted trainer"; 
                    //console.log(result.affectedRows + " record(s) deleted");                  
				}
            });
            // render drop down
            var sql2 = "SELECT `ID`, `Name` FROM `Trainer`;"
            con.query(sql2, function(err, result){
                if (err) {
                    //do nothing
                } else {
                    context.trainer = result;
                    res.render('removetrainer', context);
                    con.end();
                }
            });		
		}
	});
});





// generate pre populate drop down for removing pokemon
app.get('/removepokemon',function(req,res){

	var con = sqlObj();
	var context = {};
	
	con.connect(function(err) {
		if (err) {
			context.state = "Error: Unable to connect to SQL.";
			res.render('removepokemon', context);
		} else {
			var sql = "SELECT `ID`, `SpeciesName` FROM `Pokemon`;"
			con.query(sql, function(err, result){
				if (err) {
					context.state = "Error: Could not run query.";
				} else {
					//console.log(result);
					context.pokemon = result;
				}
				res.render('removepokemon', context);
				con.end();
			});
		}
	});
});


app.post('/removepokemon', function(req, res) {
	var con = sqlObj();
	var context = {};
	con.connect(function(err) {
		if (err) {
			context.state = "Error: Unable to connect to SQL.";
			res.render('removepokemon', context);
		} else {
            // contected
            //console.log("connected");

            var sql = "DELETE FROM `Pokemon` WHERE `ID`=" + req.body['PokemonID'];
			//console.log(sql);
			con.query(sql, function (err, result) {
				if (err) { 
					context.state = "Error: Could not remove pokemon or none was selected."; 
				} else {
					context.state = "Success: Deleted pokemon"; 
                    //console.log(result.affectedRows + " record(s) deleted");                  
				}
            });
            // render drop down
            var sql2 = "SELECT `ID`, `SpeciesName` FROM `Pokemon`;"
            con.query(sql2, function(err, result){
                if (err) {
                    //do nothing
                } else {
                    context.pokemon = result;
                    res.render('removepokemon', context);
                    con.end();
                }
            });		
		}
	});
});





// render pepopulated drop down for remvoing move
app.get('/removemove',function(req,res){

	var con = sqlObj();
	var context = {};
	
	con.connect(function(err) {
		if (err) {
			context.state = "Error: Unable to connect to SQL.";
			res.render('removemove', context);
		} else {
			var sql = "SELECT `ID`, `Name` FROM `Move`;"
			con.query(sql, function(err, result){
				if (err) {
					context.state = "Error: Could not run query.";
				} else {
					console.log(result);
					context.move = result;
				}
				res.render('removemove', context);
				con.end();
			});
		}
	});
});


app.post('/removemove', function(req, res) {
	var con = sqlObj();
	var context = {};
	con.connect(function(err) {
		if (err) {
			context.state = "Error: Unable to connect to SQL.";
			res.render('removemove', context);
		} else {
            		
            		//console.log("connected");

            		var sql = "DELETE FROM `Move` WHERE `ID`=" + req.body['MoveID'];
			//console.log(sql);
			con.query(sql, function (err, result) {
				if (err) { 
					context.state = "Error: Could not remove move or none was selected."; 
				} else {
					context.state = "Success: Deleted move"; 
                    			//console.log(result.affectedRows + " record(s) deleted");                  
				}
            		});
            		// re- render drop down
            		var sql2 = "SELECT `ID`, `Name` FROM `Move`;"
            		con.query(sql2, function(err, result){
               	 	if (err) {
                    		//do nothing
                	} else {
                    		context.move = result;
                    		res.render('removemove', context);
                    		con.end();
                	}
            		});		
	       }
	});
});


// render pre populated drop down
app.get('/removeitem',function(req,res){

	var con = sqlObj();
	var context = {};
	
	con.connect(function(err) {
		if (err) {
			context.state = "Error: Unable to connect to SQL.";
			res.render('removeitem', context);
		} else {
			var sql = "SELECT `ID`, `Name` FROM `Item`;"
			con.query(sql, function(err, result){
				if (err) {
					context.state = "Error: Could not run query.";
				} else {
					console.log(result);
					context.item = result;
				}
				res.render('removeitem', context);
				con.end();
			});
		}
	});
});


app.post('/removeitem', function(req, res) {
	var con = sqlObj();
	var context = {};
	con.connect(function(err) {
		if (err) {
			context.state = "Error: Unable to connect to SQL.";
			res.render('removeitem', context);
		} else {
            		console.log("connected");
            		var sql = "DELETE FROM `Item` WHERE `ID`=" + req.body['ItemID'];
			console.log(sql);
			con.query(sql, function (err, result) {
				if (err) { 
					context.state = "Error: Could not remove item or none was selected."; 
				} else {
					context.state = "Success: Deleted item "; 
                    			console.log(result.affectedRows + " record(s) deleted");                  
				}
            		});
            		// re-render drop down
            		var sql2 = "SELECT `ID`, `Name` FROM `Item`;"
            		con.query(sql2, function(err, result){
                	if (err) {
                    //do nothing
                } else {
                    context.item = result;
                    res.render('removeitem', context);
                    con.end();
                }
            });		
		}
	});
});

// delete end


// update start
app.get('/modifypokemon',function(req,res){

	var con = sqlObj();
	var context = {};
	
	con.connect(function(err) {
		if (err) {
			context.state = "Error: Unable to connect to SQL.";
			res.render('modifypokemon', context);
		} else {
			var sql = "SELECT `ID`, `SpeciesName` FROM `Pokemon`;"
			con.query(sql, function(err, result){
				if (err) {
					context.state = "Error: Could not run query.";
				} else {
					console.log(result);
					context.pokemon = result;
				}
				res.render('modifypokemon', context);
				con.end();
			});
		}
	});
});

app.post('/modifypokemon',function(req,res){
    var con = sqlObj();
    var context = {};
    con.connect(function(err) {
        if (err) {
            context.state = "Error: Unable to connect to SQL."; 
			res.render('modifypokemon', context);
        } else {
	    if(req.body['TrainerID'] == ""){
               req.body['TrainerID'] = 'NULL';
            } else {
               req.body['TrainerID'] = "'" + req.body['TrainerID'] + "'";
            }
            var sql = "UPDATE `Pokemon` SET `SpeciesName`=" + "'" + req.body['SpeciesName'] + "'" + ", `Number`=" + req.body['Number'] + ", `Nickname`=" + "'" + req.body['Nickname'] + "'" + ", `Gender`= "  + req.body['Gender'] + ', `TrainerID`=' + req.body['TrainerID'] + " WHERE `ID`=" + req.body['PokemonID'];
            console.log(sql);
            con.query(sql, function (err, result) {
                if (err) { context.state = "Error: Could not update Pokemon table."; }
                else {
                    context.state = "Success: Updated Pokemon " + req.body['PokemonID'];
                    console.log(result.affectedRows + " record(s) updated");
                }
                res.render('modifypokemon', context);
				con.end();
            });
        }
    });
});

app.get('/modifyitem',function(req,res){

	var con = sqlObj();
	var context = {};
	
	con.connect(function(err) {
		if (err) {
			context.state = "Error: Unable to connect to SQL.";
			res.render('modifyitem', context);
		} else {
			var sql = "SELECT `ID`, `Name` FROM `Item`;"
			con.query(sql, function(err, result){
				if (err) {
					context.state = "Error: Could not run query.";
				} else {
					console.log(result);
					context.item = result;
				}
				res.render('modifyitem', context);
				con.end();
			});
		}
	});
});

app.post('/modifyitem',function(req,res){
  var con = sqlObj();
  var context = {};
  con.connect(function(err) {
    if (err) {
        context.state = "Error: Unable to connect to SQL.";
		res.render('modifyitem', context);
    } else {
        var sql = "UPDATE `Item` SET `Name`=" + "'" + req.body['Name'] + "'" + ", `ActionType`=" + req.body['ActionType'] + ", `ActionValue`=" + req.body['ActionValue'] + ", `Description`= "  + "'" + req.body['Description'] + "'" + " WHERE `ID`=" + req.body['ItemID'];
        console.log(sql);
        con.query(sql, function (err, result) {
            if (err) { context.state = "Error: Could not update item or the item does not exist."; }
            else {
                context.state = "Success: Updated item " + req.body['ItemID']; 
                console.log(result.affectedRows + " record(s) updated"); 
            }
            res.render('modifyitem', context);
			con.end();
        });
    };
  });
});

app.get('/modifytrainer',function(req,res){

	var con = sqlObj();
	var context = {};
	
	con.connect(function(err) {
		if (err) {
			context.state = "Error: Unable to connect to SQL.";
			res.render('modifytrainer', context);
		} else {
			var sql = "SELECT `ID`, `Name` FROM `Trainer`;"
			con.query(sql, function(err, result){
				if (err) {
					context.state = "Error: Could not run query.";
				} else {
					console.log(result);
					context.trainer = result;
				}
				res.render('modifytrainer', context);
				con.end();
			});
		}
	});
});

app.post('/modifytrainer',function(req,res){
  var con = sqlObj();
  var context = {};
  con.connect(function(err) {
    if (err) {
        context.state = "Error: Unable to connect to SQL.";
		res.render('modifytrainer', context);
    } else {
         var sql = "UPDATE `Trainer` SET `Name`=" + "'" + req.body['Name'] + "'" + ", `Gender`= "  + req.body['Gender'] + ', `Money`=' + req.body['Money'] + " WHERE `ID`=" + req.body['TrainerID'];
        console.log(sql);
        con.query(sql, function (err, result) {
            if (err) { context.state = "Error: Could not update trainer table."; }
            else {
                context.state = "Success: Updated trainer " + req.body['TrainerID'];
                console.log(result.affectedRows + " record(s) updated");
            }
            res.render('modifytrainer', context);
			con.end();
        });
    };
  });
});

app.get('/modifymove',function(req,res){

	var con = sqlObj();
	var context = {};
	
	con.connect(function(err) {
		if (err) {
			context.state = "Error: Unable to connect to SQL.";
			res.render('modifymove', context);
		} else {
			var sql = "SELECT `ID`, `Name` FROM `Move`;"
			con.query(sql, function(err, result){
				if (err) {
					context.state = "Error: Could not run query.";
				} else {
					console.log(result);
					context.move = result;
				}
				res.render('modifymove', context);
				con.end();
			});
		}
	});
});

app.post('/modifymove',function(req,res){
  var con = sqlObj();
  var context = {};
  con.connect(function(err) {
    if (err) {
        context.state = "Error: Unable to connect to SQL.";
		res.render('modifymove', context);
    } else {
         var sql = "UPDATE `Move` SET `Name`='" + req.body['Name'] + "', `AttackPower`= "  + req.body['AttackPower'] + ", `PP`=" + req.body['PP'] + ", `Description`= '" + req.body[`Description`] + "' WHERE `ID`=" + req.body['MoveID'];
	 
        console.log(sql);
        con.query(sql, function (err, result) {
            if (err) { context.state = "Error: Could not update move table."; }
            else {
                context.state = "Success: Updated move " + req.body['MoveID'];
                console.log(result.affectedRows + " record(s) updated");
            }
            res.render('modifymove', context);
			con.end();
        });
    };
  });
});

// update end
app.use(function(req,res){
  res.status(404);
  res.render('404');
});

app.use(function(err, req, res, next){
  console.error(err.stack);
  res.type('plain/text');
  res.status(500);
  res.render('500');
});

app.listen(app.get('port'), function(){
  console.log('Express started on http://localhost:' + app.get('port') + '; press Ctrl-C to terminate.');
});

function sqlObj(){
	return mysql.createConnection({
		host: "classmysql.engr.oregonstate.edu",
		user: "cs340_youncher",
		password: "UPDATEPASSWORD",
		database: "cs340_youncher"
	});
}
