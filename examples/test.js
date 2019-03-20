var model = require('untitled-model');
// var settings = require('./__settings/settings.js');
// model.connection(settings.DATABASE.default);
// model.migrate();

var User = model.get('user')



//var user = model.get('user');
// var department = model.get('department');
// var branch = model.get('branch');


// select user.name as name, department.name as department__name, branch.name as department__branch__name from user inner join department on user.department=department.id join branch on department.branch=branch.id;

// model.migrate('user.json');


// console.log(user);
// branch.insert({"name":"CSE"},(e, data)=>{});


// user.insert({"name":"Pankaj","department_id":1,"other_id":2},(e,d)=>{
//     if(e) throw e;
//     console.log(d);
// });

// user.insert({"name":"Harry","department_id":2,"other_id":1},(e,d)=>{
//     if(e) throw e;
//     console.log(d);
// });

// console.log(user.values(['name','branch__name']));
// user.values(['name','department_id__branch_id__name','other_id__branch_id__name'])

// .rename({"name":"Nam"})

// .filter({'id >':-1,'name':'pankaj'},function(e,data){
// 	if(e) throw e;
// 	console.log(data);
// });

// user.values(['name','department_id__branch_id__name','other_id__branch_id__name']).all(function(e,data){
// 	if(e) throw e;
// 	console.log(data);
// });


// user.all((err, data)=>{
//     if(err) throw err;
//     console.log(data);
// });
