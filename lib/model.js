const fs = require('fs');
const mysql = require('mysql');
const model_parser = require('../bin/model_parser.js');
const dir = './models';
const model_driver = require('./model_drivers');
const model2 = require('./model2');
const readline = require('readline');
var stdin = process.openStdin();

let settings = '';

function prompt(query) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    return new Promise(resolve => rl.question(query, ans => {
        rl.close();
        resolve(ans);
    }))
}


function connection(dict = undefined){
  if(dict == undefined)
      return mysql.createConnection(settings);
  settings = dict;
  return mysql.createConnection(dict);
}
function replaceAt(string, index, replace) {
  return string.substring(0, index) + replace + string.substring(index + 1);
}

function findPrimaryKey(table){
  table = JSON.parse(fs.readFileSync('../models/' + table + '.json'));
  //let lenght = 0;
  for(attr in table){
    if(table[attr]['primary'] == true){
      return attr;
    }
  }
}

function findtTable(table,foreign){
  table = JSON.parse(fs.readFileSync('../models/' + table + '.json'));
  return table[foreign]['model'];
}

function all_generator(temp){
  temp.all = function(callback){
    var con = connection();
    con.query("SELECT * FROM " + temp.model + ";",function (e,data){
      //if(e) throw e;
      callback(e,data);
    });
    con.end();
  }
}

function delete_generator(temp){
  temp.delete = function(temp){
    let query = 'DELETE FROM ' + this.model + ' WHERE ';
    let temp2 = {};
    temp2.model = this.model;
    temp2.query = query;
    temp2.filter = function(list,callback){
      let query = this.query;
      if(typeof list == 'string'){
        query += list;
      }else{
        let length = 0;
        for(i in list){
          if(length == Object.keys(list).length - 1)
            query += i + "='" + list[i] + "' ;";
          else
            query += i + "='" + list[i] + "' and ";
          length++;
        }
      }
      var con = connection();
      con.query(query,function(e,data){
        callback(e,data);
      });
      con.end();
    }
    return temp2;
  }
}

function insert_generator(temp){
  temp.insert = function(dict,callback){
    let query = 'INSERT INTO ' +  this.model + ' (';
    let length = 0;
    for(i in dict){
      if(length == Object.keys(dict).length - 1)
        query += i + ") VALUES(" , length = -1;
      else
        query += i + ",";
      length++;
    }
    for(i in dict){
      if(length == Object.keys(dict).length - 1)
        query += "'" + dict[i] + "');" , length = 0;
      else
        query += "'" + dict[i] + "',";
      length++;
    }
    //console.log(query);
    var con = connection();
    con.query(query,function(e,data){
      callback(e,data);
    });
    con.end();
  }
}

function update_generator(temp){
  temp.update = function(dict){
    let query = 'UPDATE ' + this.model + ' SET ';
    let length = 0;
    for(i in dict){
      if(length == Object.keys(dict).length - 1)
        query += i + "='" + dict[i] + "' ";
      else
        query += i + "='" + dict[i] + "' , ";
      length++;
    }
    let temp2 = {};
    temp2.query = query;
    temp2.model = temp.model;
    temp2.filter = function(list,callback){
      let query = this.query + " WHERE ";
      if(typeof list == 'string'){
        query += list;
      }else{
        let length = 0;
        for(i in list){
          if(length == Object.keys(list).length - 1)
            query += i + "='" + list[i] + "'";
          else
            query += i + "='" + list[i] + "' and ";
          length++;
        }
      }
      query += ';';
      var con = connection();
      //console.log(query);
      con.query(query,function (e,data){
        //if(e) throw e;
        callback(e,data);
      });
      con.end();
    }
    return temp2;
  }
}

function select(table,foreigns){
  let currentTable = table;
  let JOIN = '';
  let SELECT = '';
  let previous_table = '';
  let previous_table_name = table;
  for(let i = 0; i < foreigns.length - 1; i++){
    previous_table = currentTable;
    currentTable = findtTable(currentTable,foreigns[i]);

    JOIN += '  inner join ' + currentTable + ' as ' + foreigns[i] + ' on ' + previous_table_name + '.' + foreigns[i] + '=' + foreigns[i]  + '.' + findPrimaryKey(currentTable);

    // JOIN += ' inner join ' + currentTable + ' as ' + foreigns[i] + ' on ' + previous + '.' + foreigns[i] + '=' + foreigns[i] + '.' + findPrimaryKey(currentTable) +' ';
    previous_table_name = foreigns[i];
  }
  //console.log(JOIN);
  return currentTable + '.' + foreigns[foreigns.length - 1];
}

function values_generator(temp){

  temp.m = model2.get(temp.model);
  temp.values = function(list=[]){
    temp.m.values(list);
    //console.log(temp.m.show());
    temp.m.all = function(callback){
      var con = connection();
      //console.log(temp.m.show())
      con.query(temp.m.show(),function(e,data){
        if(e) throw e;
        callback(e,data);
      });
      con.end();
    }

    temp.m.filter = function(dict,callback){
      var con = connection();
      temp.m.filters(dict);
      con.query(temp.m.show(),function(e,data){
        if(e) throw e;
        callback(e,data);
      });
      con.end();
    }
    return temp.m;
  }

  // temp.values = function(list){

  //   let set = new Set();

  //   query = 'SELECT ';


  //   for(let i = 0; i < list.length; i++){

  //     if(list[i].indexOf('__') == -1 ){

  //       if(i == list.length - 1){
  //         query += temp.model+'.'+list[i] + ' as '+list[i]+" ";
  //       }
          
  //       else{
  //         query += temp.model+'.'+list[i] + ' as '+list[i]+' , ';
  //       }
          
  //     }
  //     else{
  //        let foreign = list[i].split('__');
  //        console.log(select(temp.model,foreign));
  //       // for(let j=0; j < tables.length - 1; j++){
  //       //   set.add(tables[j]);
  //       // }

  //       // if(i == list.length - 1){
  //       //   query += list[i].split('__').join('.') + ' as '+list[i]+' ';
  //       // }
          
  //       // else{
  //       //   query += list[i].split('__').join('.') + ' as '+list[i]+' , ';
  //       // }
  //     }
  //   }
  //   let table = ' ';
  //   for(t of set){
  //     table += t + ' , ';
  //   }

  //   table = replaceAt(table, table.length-2, ' ');
  //   console.log(table);


  //   let temp2 = {};
  //   temp2.query = query;
  //   temp2.model = temp.model;

  //   // All
  //   temp2.all = function(callback){
  //     let query = this.query;
  //     query += 'FROM '+this.model+' ;';
  //     console.log(query);
  //     var con = connection();
  //     con.query(query,function(e,data){
  //       callback(e,data);
  //     });
  //     con.end();
  //   }



  //   // Filter 
  //   temp2.filter = function(list,callback){

  //     let query = this.query + "FROM " + temp.model + " WHERE ";
  //     if(typeof list == 'string'){
  //       query += list;
  //     }else{
  //       let length = 0;
  //       for(i in list){
  //         if(length == Object.keys(list).length - 1)
  //           query += i + "='" + list[i] + "'";
  //         else
  //           query += i + "='" + list[i] + "' and ";
  //         length++;
  //       }
  //     }
  //     query += ';';
  //     var con = connection();
  //     con.query(query,function (e,data){
  //       //if(e) throw e;
  //       callback(e,data);
  //     });
  //     con.end();
  //   }
  //   return temp2;
  // }
}

function filter_generator(temp){
  temp.filter = function(list,callback){
    query = "SELECT * FROM " + temp.model + " WHERE ";
    if(typeof list == 'string'){
      query += list;
    }else{
      let length = 0;
      for(i in list){
        if(length == Object.keys(list).length - 1)
          query += i + "='" + list[i] + "'";
        else
          query += i + "='" + list[i] + "' and ";
        length++;
      }
    }
    query += ';';
    var con = connection();
    con.query(query,function (e,data){
      //if(e) throw e;
      callback(e,data);
    });
    con.end();
  }
}

// function values_generator(temp){
//   temp.values = function(callback){
//     con.connect(function(e){
//       if (e) throw e;
//       con.query("SELECT * FROM " + temp.model + ";",function (e,data){
//         //if(e) throw e;
//         callback(e,data);
//       });
//       con.end();
//     });
//   }
// }

module.exports.get = function(model){
  var temp = {};
  temp.model = model;
  all_generator(temp);
  filter_generator(temp);
  values_generator(temp);
  update_generator(temp);
  insert_generator(temp);
  delete_generator(temp);
  //values_generator(temp);
  return temp;
}

// function createTable(file_name){
//   let temp = fs.readFileSync('../models/' + file_name);
//   let file = JSON.parse(temp);
//   let query = 'CREATE TABLE ' + file_name.split('.')[0] + '(';
//   for(i in file){
//     query += i +' ';
//     let dtype = '';
//     let temp_query = '';
//     for(j in file[i]){
//       if(j == 'dtype'){
//         dtype = model_parser[j][file[i][j]];
//         if(file[i][j] == "foreign"){
//           if(file[i]['model'] != undefined){
//             let temp = JSON.parse(fs.readFileSync('../models/' + file[i]['model'] + '.json'));
//             for(row in temp){
//               for(col in temp[row]){
//                 if(col == "primary"){
//                   console.log(temp[row]['dtype']);
//                   let temp2 = " " + model_parser['dtype'][temp[row]['dtype']] + '(' + (temp[row]['size'] != undefined ? temp[row]['size'] : model_parser['default'][temp[row]['dtype']]) + ')';
//                   dtype = temp2 + " " + dtype + " REFERENCES " + file[i]['model'] + "(" + row + ")";
//                   break;
//                 }
//               }
//               break;
//             }
//           }
//         }
//       }
//       else if(j == 'size')
//         dtype += '(' + file[i][j] + ')';
//       else if(j == 'secure') continue;
//       else
//         temp_query += model_parser[j] + ' ';
//     }
//     query += dtype + ' ' + temp_query + ', ';
//   }
//   query = replaceAt(query,query.length - 2, ');');
//   console.log(query);
//     var con = connection();
//     con.query(query,function(e,data){
//       if(e) throw e;
//       console.log("Table Created");
//     });
//     con.end();
// }
var rl = readline.createInterface(process.stdin, process.stdout);

function exec(ql, t, con, in_queue){
  t++;
  //console.log(ql[t]);
  let con_ = connection(con);
  let dic = ql[t];
  let key = dic.key;
  let value = dic.value;
  if(! in_queue.has(key) ){
    in_queue.add(key);
    con_.query(value,(e, d)=>{
      if(e && e.code == 'ER_TABLE_EXISTS_ERROR')console.log(e.message);

      else if(e && e.code != 'ER_TABLE_EXISTS_ERROR') throw e;
      else
        console.log('Created Table ' + key + ' .....');

      if(ql.length -1 > t){
        setTimeout(()=>{exec(ql, t, con,in_queue);}, 100);
      }
    });
  }else{
    if(ql.length -1 > t){
      exec(ql, t, con,in_queue);
    }
    return in_queue;
  }

  
  
  con_.end();
}

module.exports.migrate = function(file_name = false, con = undefined){
  
  if(!file_name){
    let map = new Set();
    let ql = [];

    fs.readdir(dir, (err, files) => {
      for(file_number in files){
        let query_dict = model_driver.solve(files[file_number]);
        for(let query_ in query_dict){
          if(! map.has(query_dict[query_].key) ){
            map.add(query_dict[query_].key);
            ql.push(query_dict[query_]);
          }
        }
        // console.log(exec(qll, -1, (con == undefined) ? settings : con, in_queue));
      }


      let in_queue = new Set();
      exec(ql, -1, (con == undefined) ? settings : con, in_queue);
        //con.end();
    });
  }else{
    let ql = model_driver.solve(file_name);
    let in_queue = new Set();
    exec(ql, -1, (con == undefined) ? settings : con, in_queue);
    // con.end();
  }
}

module.exports.connection = connection;

// *************************************************** //

