var fs = require('fs');
const mysql = require('mysql');
const model_parser = require('../bin/model_parser.js');

let model_dir = './models/';
let settings = undefined;

let q = [];



function replaceAt(string, index, replace) {
  return string.substring(0, index) + replace + string.substring(index + 1);
}



// function connection(dict = undefined){
//   if(dict == undefined)
//       return mysql.createConnection(settings);
//   settings = dict;
//   return mysql.createConnection(dict);
// }


function solve (file_name){

  let file = JSON.parse(fs.readFileSync(model_dir + file_name));
  for(let attr in file){

    for(let property in file[attr]){

      if(file[attr][property] == 'foreign'){

        let temp = file[attr]['model'] + '.json';
        solve(temp);
      }
    }
  }

  //create query

  let query = 'CREATE TABLE ' + file_name.split('.')[0] + '(';

  for(let i in file){
    query += i +' ';
    let dtype = '';
    let temp_query = '';
    for(let j in file[i]){
      if(j == 'dtype'){
        dtype = model_parser[j][file[i][j]];
        if(file[i][j] == "foreign"){
          if(file[i]['model'] != undefined){
            let temp = JSON.parse(fs.readFileSync('./models/' + file[i]['model'] + '.json'));
            for(row in temp){
              for(col in temp[row]){
                if(col == "primary"){
                  //console.log(temp[row]['dtype']);
                  let temp2 = " " + model_parser['dtype'][temp[row]['dtype']] + '(' + (temp[row]['size'] != undefined ? temp[row]['size'] : model_parser['default'][temp[row]['dtype']]) + ')';
                  let relation =  dtype + "(" + i + ") REFERENCES " + file[i]['model'] + "(" + row + ")";
                  dtype = temp2 + ", " + relation;

                  //console.log(relation)
                  break;
                }
              }
              break;
            }
          }
        }
      }
      else if(j == 'size')
        dtype += '(' + file[i][j] + ')';
      else if(j == 'secure') continue;
      else
        temp_query += model_parser[j] + ' ';
    }
    query += dtype + ' ' + temp_query + ', ';
  }
  query = replaceAt(query,query.length - 2, ');');

  q.push({key:file_name.split('.')[0],value:query});
  return q;
}
///////////////////////// CREATING TABLE IN DATABASE //////////////////////////
/// <-----------------

  // con.query("DESCRIBE " + file_name.split('.')[0],function(e,data){
  //   // If table doesn't exist
  //   if(e && e.code == 'ER_NO_SUCH_TABLE'){
  //     // If not in process
  //     if(!in_process.has(file_name)){
  //       in_process.add(file_name);
  //       console.log('Migrating ' + file_name + ' ....');
  //       con.query(query,function(e,data){
  //         if(e && e.code == 'ER_TABLE_EXISTS_ERROR') console.log();
  //         //  else if(e && e.code != 'ER_TABLE_EXISTS_ERROR') throw e;
  //         //if(e && e.code != 'ER_TABLE_EXISTS_ERROR') throw e;
  //         //in_process.add(file_name);
          
  //         console.log('Table Created ' + file_name);
  //       });
  //     }

  //   }
  //   // Other errors on table description

  //   else if(e){throw e;}
  //   else{
  //     console.log();
  //     // ************UNDER DEVELOPMENT !! **********************//
  //     // let attr_name = null;
  //     // let attr_type = null;
  //     // let attr_is_prime = null;
  //     // let attr_is_foreign = null;
  //     // let error = false;
  //     //   console.log(file_name);
  //     //   for(let field_dict in data){
  //     //
  //     //     attr_name = data[field_dict]['Field'];
  //     //     attr_type = data[field_dict]['Type'];
  //     //     attr_is_prime = data[field_dict]['Key'] == "PRI";
  //     //     attr_is_foreign = data[field_dict]['Key'] == "MUL";
  //     //
  //     //     if(model_parser["SQL-dtypes"][file[attr_name]['dtype']]+'('+(file[attr_name]['size']==undefined ? model_parser.default[file[attr_name]['dtype']]:file[attr_name]['size'] )+')' != attr_type && model_parser["SQL-dtypes"][file[attr_name]['dtype']] != "FOREIGN KEY" && !error)error = true;
  //     //
  //     //     console.log(error);
  //     //     // ************UNDER DEVELOPMENT !! **********************//
  //     //     if(error){
  //     //       con.query('DROP TABLE '+file_name.split('.')[0],(err, data)=>{
  //     //         if(err) throw err;
  //     //
  //     //         con.query(query,(err, data)=>{
  //     //           if( err ) throw err;
  //     //           console.log('Table has been recreated');
  //     //
  //     //         });
  //     //       });
  //     //     }
  //     //
  //     //
  //     //   }
  //     //   console.log('Model has ' + Object.keys(file).length +' attr.. ');
  //     //   console.log('Table has ' + Object.keys(data).length +' attr.. ');
  //     //   console.log(file,data);
  //     }
  //   con.end();
  // });

  // -------------->
  //con.end();
  //console.log(query);

// ************************************************************* //



module.exports.solve = solve;
//solve('student.json');
//console.log(hasForeignKey('branch.json'));


