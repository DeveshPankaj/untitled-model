
let fs = require('fs');

// var models = {
//         "user":{
//                 "id":{"dtype":"int","primary":true,"unique":true},
//                 "name":{"dtype":"string","size":20},
//                 "address":{"dtype":"text"},
//                 "department_id":{"dtype":"foriegn", "model":"department"},
//                 "other_id":{"dtype":"foriegn", "model":"department"}
//                 },
        
//         "department":{
//                 "id":{"dtype":"int","primary":true,"unique":true},
//                 "name":{"dtype":"string","size":20},
//                 "branch_id":{"dtype":"foriegn","model":"branch"}
//                 },
        
//         "branch":{
//                 "id":{"dtype":"int","primary":true,"unique":true},
//                 "name":{"dtype":"string","size":20},
//                 "hod":{"dtype":"string","size":20}
//                 }
//         }


const MODEL_DIR = './models/';


function get(model){
        return JSON.parse(fs.readFileSync(MODEL_DIR+model+'.json'));
}




function find_foreign(model){
        model = get(model);
        for(attr in model){
                if(model[attr]['primary'] == true) return attr;
        }
}

function find_path(Q,Query_map){
        let ql = Q.split('__');

        q = '';
        let table = ql[0];
        let last_table = table;
        let current_table = table;
        for(let attr = 1; attr < ql.length - 1; attr++){
                table = get(table)[ql[attr]]['model'];
                current_table += '__' + ql[attr];
                if(Query_map.indexOf(current_table) == -1){
                        Query_map.push(current_table);
                        q += 'INNER JOIN ' + table + ' AS '+ current_table + ' ON ' + last_table +'.' + ql[attr] + '=' + current_table + '.' + find_foreign(table) + ' '
                }
                last_table = current_table;
        }
        return({'path':q,'link':last_table + '.' + ql[ql.length - 1]});
}



module.exports.get = function(model){
        let temp = {};
        temp.model = model;
        temp.select = [];
        temp.FILTER = [];
        temp.join = '';
        temp.buffer = [];
        temp.show = function(){
                select = '';
                if(this.select.length > 0){
                        let l = 0;
                        for(dic in this.select){
                                l++;
                                select += this.select[dic]['link'] + " AS " + this.select[dic]['path'];
                                if(l < this.select.length) select += ',';
                        }
                }else{
                        select = '*';
                }

                let FILTER = '';
                for(i in this.FILTER){
                        FILTER += ' ' + this.FILTER[i] + ' ';
                        if(i < this.FILTER.length -1){
                                FILTER += " AND ";
                        }
                }

                where = ((this.FILTER.length > 0) ? 'WHERE ' + FILTER : '');



                return ('SELECT ' + select + ' FROM ' + this.model + ' ' + (this.join) + ' ' + where ) + ';';
        }

        temp.value = function(Q){
                let ans = find_path(this.model + '__' + Q, this.buffer);
                this.select.push({'link':ans['link'],'path':Q})

                if(ans['path'].trim().length > 2){
                        this.join += ans['path'] + ' ';
                }
        }

        temp.filter_ = function(key, val){
                let ans;
                let ex = ' ';
                key = key.trim();
                if(key.split(' ').length == 1){
                        ex = '=';
                }
                ans = find_path(this.model+'__'+key,this.buffer);
                this.FILTER.push(ans['link'] + ex +"'" + val + "' ");
        
                if(ans['path'].trim().length > 2){
                        this.join += ans['path'] + ' ';
                }
        }

        temp.values = function(l){
                for(v in l){
                        this.value(l[v]);
                }
        }
        temp.filters = function(dic){
                for(key in dic){
                        this.filter_(key,dic[key]);
                }
        }
        temp.rename = function(dic){
                for(key in dic){
                        for(let i in this.select){
                                if(this.select[i]['path'] == key){
                                        this.select[i]['path'] = dic[key];
                                        break;
                                }
                        }
                }
                return temp;
        }
        return temp;
}



