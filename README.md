## Untitled-model [Documentation](http://untitledjs/model/) 
  Rapid sql query generator extention for [node](http://nodejs.org).
  
  [![NPM Version][npm-image]][npm-url] [![NPM Downloads][downloads-image]][downloads-url]


- [Installation](#installation)
- [Features](#features)
- [Quick Start](#quick-start)
- [Model](#user-model-:)
- [Foreign Key](#foreign-key)
- [Functions](#features)
    - [filter()](#user.filter(callback)-``requires-sql-connection``)
    - [values()](#user.values(['attr'])-``sql-projection``)
    - [all(callback)](#user.all(callback)-``requires-sql-connection``)
    - [update(callback)](#update({})-``returns-model``)
- [model](#user-=--model.get('user'))

## Installation

This is a [Node.js](https://nodejs.org/en/) module available through the
[npm registry](https://www.npmjs.com/).

Before installing, [download and install Node.js](https://nodejs.org/en/download/).
Node.js 0.10 or higher is required.

Installation is done using the
[`npm install` command](https://docs.npmjs.com/getting-started/installing-npm-packages-locally):

```bash
$ npm install untitled-model
```
###### test installation
```terminal
$ node
> var model = require('untitled-model')
>
```
Follow [our installing guide](http://untitledjs.com/model/guide/#installing/)
for more information.

## Features

  * Mysql database support
  * Fetching data from database from sql
  * Fetching data from relational database [foreign key]
  * row SQL query [ all / filter / values / update / delete ]


###### Security Issues

If you discover a security vulnerability in ```untitled-model```, please see [Security Policies and Procedures](Security.md).

## Quick Start

   Start new project
```bash
$ mkdir myWeb && cd myWeb
$ node init
$ node i untitled-model
```

  Create model:

```bash
# make sure your current dir should be ~/myWeb/
$ mkdir models
$ touch ./models/user.json
```

######  User model :
   Copy and past this inside ```~/models/user.json```


```json
{
  "id" : {"dtype":"int","primary":true,"unique":true,"size":8,"auto-inc":true},
  "name" : {"dtype":"string","size":100},
  "address" : {"dtype":"text"},
  "password" : {"dtype":"string","size":100,"secure":true}
}
```

## Migrating models
   ```/myWeb/test.js```
   
```js
var model = require('untitled-model');
model.connection(
    {   
        host: "localhost",
        user: "root",
        password: "",
        database:"test"
    }
);
model.migrate('user.json');
```

## Philosophy

   The untitled-model philosophy is to provide a tool for programmers to send and receive 
   data to and from sql database.
   Migrate function is use to generate tables inside database.
   It supports relational database [```foreign key```](#foreign-key) concept.
   
###### foreign key
***department.json***
```json
{
    "id" : {"dtype":"int","primary":true,"auto-inc":true},
    "name" : {"dtype":"string","size":100}
}
```


***user.json***
```json
{
    "id" : {"dtype":"int","primary":true,"unique":true,"size":8,"auto-inc":true},
    "name" : {"dtype":"string","size":100},
    "address" : {"dtype":"text"},
    "password" : {"dtype":"string","size":100,"secure":true},
    "department":{"dtype":"foreign", "model":"department"}
 }

```

## Functions

 - ### User =  model.get('user')
    ```javascript
         User = { 
          model: 'user',
          all: [Function],
          filter: [Function],
          values: [Function],
          update: [Function],
          insert: [Function],
          delete: [Function] ,
          
          m: { 
                model: 'user',
                select: [],
                FILTER: [],
                join: '',
                buffer: [],
                show: [Function],
                value: [Function],
                filter_: [Function],
                values: [Function],
                filters: [Function],
                rename: [Function] 
            },
         }
    ```
    
 - ##### User.all(callback) ``requires sql connection``
     ```javascript
        // It returns data to callback unction
        all(callback){
          let table = this.model;
          let project = this.m.select;
          . . .
          . . .
          query = "select " +select+" from " + table ;
          . . . 
          callback(error, data);
        }
     
     Example:
  
       User.all(function(err,data){
        if(e) throw e;
        console.log(data);
       });
    ```
    
 - ##### User.filter({},callback) ``requires sql connection``
    ```javascript
        // It returns data to callback unction
        filter({id:5},callback){
          let table = this.model;
          let project = this.m.select;
          . . .
          . . .
          query = "select " +select+" from " + table + " WHERE " + filters;
          . . . 
          callback(error, data);
        } 
     
     Example:
       User.filter({'id': 2},callback);
       User.filter({'id > ': 2},callback);
       User.filter({'id': 2,'name':'someone'},callback);
       
       User.filter({'id': 2},function(err,data){
           if(err) throw err;
           console.log(data);
       });
    ```
 - ##### User.values(['attr']) ``sql projection``

     * ***use __ for foreign table***
        ```javascript
            // It returns data to callback unction
            function(select=[]){
              . . .
              _set_select_vlaues_
              . . . 
              return this.m;
            }
            
            Example:
                  User = User.values(['name','department__name'])
                  User.all((error, data)=>{
                      if(error) throw error;
                      console.log(data);
                  });
                   
                           // or
                    
                  User = User.values(['name','department__name'])
                  User.filter({id:5},(error, data)=>{
                      if(error) throw error;
                      console.log(data);
                  })
        ```
        - ##### show() ``// returns Query string``
        - ##### rename({}) ``// rename the attributes in query string``
            ```javascript
              rename({name:"UserName"});
            ```
        - [filter(callback)](#user.filter(callback)-``requires-sql-connection``)
        - [all(callback)](#user.all(callback)-``requires-sql-connection``)
        
* ##### update({}) ``returns model``
    ```javascript
        User.update({name:'pankaj'}).filter({name:'pankajdevesh'},(e, data)=>{
            if(e) throw  e;
            console.log(data);
        });
    ```
    
* ##### insert({}, callback) ``insert into database``
    ```javascript
          User.insert({name:'javascript'},(error, data)=>{
            if(error) throw error;
            console.log(data);
          });
    ```
    
* ##### delete().filter({},callback) ``delete from database``
    ```javascript
          User.delete().filter({id:5},(error, data)=>{
            if(error) throw error;
            console.log(data);
          });
    ```


## License

  [MIT](LICENSE)

[npm-image]: https://img.shields.io/npm/v/untitled-model.svg
[npm-url]: https://npmjs.org/package/untitled-model

[downloads-image]: https://img.shields.io/npm/dm/untitled-model.svg
[downloads-url]: https://npmjs.org/package/untitled-model




