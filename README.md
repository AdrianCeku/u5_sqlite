This resource is a wrapper for [sql.js](https://github.com/sql-js/sql.js).

It provides the user with Lua Exports so you can easily acces the sqlite database from your Lua Scripts.

# Why sqlite?
- Sqlite is very convenient. There is no need to setup a databse and establish a connection. Your whole database lies inside one single file which can easily be beacked up and transfered

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

### example 

``
db:createTable("users", { 
    {"id", "INTEGER", "PRIMARY KEY AUTOINCREMENT"},
    {"name", "TEXT"},
    {"age", "INTEGER"},
})
``

## insert(tableName, columnsAndValues)
### Parameters
- tableName | any string
- columnsAndValues | An object that has the names of the columns you want to insert as its keys, and their correspondng values as its values

### example
``
db:insert("users", {
    name = "Adrian",
    age = 23
})
``

## update(tableName, columnsAndValues, where, rawWhere = false)
### Parameters
- tableName | any string
- columnsAndValues | An object that has the names of the columns you want to update as its keys, and their correspondng values as its values
- where | An object that has the colums as its keys and the values that the corresponding column has to equal as its value. Multiple key:value pairs are chained together with AND | Or a string if rawWhere is true
- rawWhere (optional) | If this is true, the where parameter will be interpreted as a string for complex queries

  ### example 1
  ``
  db:update("users", {
    name = "John",
    age = 42
  }, {
    id = 1,
    name = "John",
  }
  )
  ``
    ### example 2
  ``
  db:update("users", {
    name = "John",
    age = 42
  }, "id=1",
  true
  )
  ``

  ## delete(tableName, where, rawWhere = false)
  ### Paremeters
  - tableName | any string
  - where | An object that has the colums as its keys and the values that the corresponding column has to equal as its value. Multiple key:value pairs are chained together with AND | Or a string if rawWhere is true
  - rawWhere (optional) | If this is true, the where parameter will be interpreted as a string for complex queries

      ### example 1
  ``
  db:delete("users", {
    id = 1,
    name = "John",
  }
  )
  ``
    ### example 2
  ``
  db:delete("users", "id=1 AND name = john", true)
  ``

  ## executeRawWithParams(query, params)
  ### Parameters
  - query | Any valid sql query. As per[sql.js](https://sql.js.org/documentation/Database.html#%5B%22run%22%5D) to pass parameters, placeholders need the be prefixed with a ":" in the query
  - params | The parameter object where the key is the name of the placeholder and the value its value

  ### example
  ``
  local query = "INSERT INTO users VALUES (:name, :age)"
  local params = {[":name"] = "John", [":age"] = 42}
  db:executeRawWithParams(query, params)
  ``

  ## executeRaw(query)
  ### Parameters
  - query | Any valid sql query

 ### Example
 ``
db:executeRaw("DROP TABLE users")
``
