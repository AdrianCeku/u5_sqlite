This resource is a wrapper for [sql.js](https://github.com/sql-js/sql.js).

It provides the user with Lua Exports so you can easily acces the sqlite database from your Lua Scripts.

If you like my work and want to help keep open source alive, please consider donating to my [ko-fi](https://ko-fi.com/adrianceku)❤️

# Why sqlite?
Sqlite is very convenient. There is no need to setup a databse and establish a connection. Your whole database lies inside one single file which can easily be beacked up and transfered

# Getting started
- Download the resource and place it inside your resource folder
- Add ensure u5_sqlite to you cfg
- Add ``local db = exports["u5_sqlite"]`` to your server script
- You can now use the exports in your server scripts

# Exports
## createTable(tableName, columns)
### Parameters 
- tableName | any string
- columns | arrays that consist of columnName, columnsDatatype and constraints in that order

### Example 

``
db:createTable("users", { 
    {"id", "INTEGER", "PRIMARY KEY AUTOINCREMENT"},
    {"name", "TEXT"},
    {"age", "INTEGER"},
})
``

Results in Query: ``CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT,name TEXT ,age INTEGER )``

## insert(tableName, columnsAndValues)
### Parameters
- tableName | any string
- columnsAndValues | An object that has the names of the columns you want to insert as its keys, and their correspondng values as its values

### Example
``
db:insert("users", {
    name = "Adrian",
    age = 23
})
``

Results in Query: ``INSERT INTO users (name,age) VALUES (:name,:age)``

And Parameters : ``{":name": "Adrian", ":age": 23}``

## update(tableName, columnsAndValues, where, rawWhere = false)
### Parameters
- tableName | any string
- columnsAndValues | An object that has the names of the columns you want to update as its keys, and their correspondng values as its values
- where | An object that has the colums as its keys and the values that the corresponding column has to equal as its value. Multiple key:value pairs are chained together with AND | Or a string if rawWhere is true
- rawWhere (optional) | If this is true, the where parameter will be interpreted as a string for complex queries

### Example 1
``
db:update("users", {
name = "John",
age = 42
}, {
id = 1,
name = "Adrian",
}
)
``

Results in Query: ``UPDATE users SET name=:nameVal,age=:ageVal WHERE (id=:idIf AND name=:nameIf)``

And Parameters ``{ ":nameVal": "John", ":ageVal": 42, ":idIf":1, ":nameIf": "Adrian"}``

### Example 2
``
db:update("users", {
name = "John",
age = 42
}, "id=1",
true
)
``

Results in Query: ``UPDATE users SET name=:nameVal,age=:ageVal WHERE (id = 1)``

And Parameters ``{":nameVal":"John", ":ageVal": 43}``

## delete(tableName, where, rawWhere = false)
### Paremeters
- tableName | any string
- where | An object that has the colums as its keys and the values that the corresponding column has to equal as its value. Multiple key:value pairs are chained together with AND | Or a string if rawWhere is true
- rawWhere (optional) | If this is true, the where parameter will be interpreted as a string for complex queries

### Example 1
``
db:delete("users", {
id = 1,
name = "John",
}
)
``

Results in Query: ``DELETE FROM users WHERE (id=:id AND name=:name) ``
And Parameters: ``{":id":1, ":name": "John"}``

### Example 2
``
db:delete("users", "id=1 AND name = 'john'", true)
``

Results in Query: ``DELETE FROM users WHERE (id=1 AND name = 'John')``

## executeRawWithParams(query, params)
### Parameters
- query | Any valid sql query. As per[sql.js](https://sql.js.org/documentation/Database.html#%5B%22run%22%5D) to pass parameters, placeholders need the be prefixed with a ":" in the query
- params | The parameter object where the key is the name of the placeholder and the value its value

Can be any string and parameter combination that is allowed in [sql.js´s "run" function](https://sql.js.org/documentation/Database.html#%5B%22run%22%5D)

## executeRaw(query)
### Parameters
- query | Any valid sql query

### Example
``
db:executeRaw("DROP TABLE users")
``

## select(tableName, columns, where, rawWhere = false)
### Parameters
- tableName | any string
- columns | Array that consists of the column names that you want to retrive
- where | An object that has the colums as its keys and the values that the corresponding column has to equal as its value. Multiple key:value pairs are chained together with AND | Or a string if rawWhere is true
- rawWhere (optional) | If this is true, the where parameter will be interpreted as a string for complex queries

### Return
Returns an array of objects. The objects have the columns as their keys and their corresponding values as their values.

### Example
``
db:select("users", {"name","age"}, {id=1})
``

Results in Query: ``SELECT name,age FROM users WHERE (id=:id)``

And Parameters: ``{":id":1}``

And Returns: ``[{"age":42,"name":"John"}]``
