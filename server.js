const fs = require('fs')
const initSqlJs = require("./db/sql-wasm.js")

const resourceName = "u5_sqlite"
const dbFileName = "db.sqlite"
const defaultPath = "./resources/" + resourceName
const dbFilePath = defaultPath + "/db/" + dbFileName
const filebuffer = fs.readFileSync(dbFilePath)

const warnTime = 100
const verbose = true

on("u5_sqlite:js:dbready", async () => {
    console.log("SQLITE DATABSE READY")
})

//---------------------------------- MAIN START ----------------------------------\\
const main = async () => {
    const sql = await initSqlJs();
    const db = new sql.Database(filebuffer)

    function saveDb() {
        if(verbose) console.log("Saving database")
        const data = db.export()
        const buffer = Buffer.from(data)
        fs.writeFileSync(dbFilePath, buffer)
    }

    function createTable(tableName, columns) {
        const columnsString = columns.map(column => `${column[0]} ${column[1]} ${column[2] ?? ""}`).join(',')
        const query = `CREATE TABLE IF NOT EXISTS ${tableName} (${columnsString})`
        
        const time1 = Date.now()
        db.run(query)
        const time2 = Date.now()

        saveDb()

        if (verbose || (time2 - time1 > warnTime)) {
            console.log("Executing: \n", query)
            console.log("Took: \n", (time2 - time1) + "ms to execute")
        }
    }

    // createTable("users", [
    //     {"id","integer","PRIMARY KEY AUTOINCREMENT"},
    //     {"name","string", "NOT NULL"},
    //     {"age", "integer", "NOT NULL"}
    // ])

    //Create a table called "users" with the columns "id", "name" and "age". The column "id" is the primary key and auto increments, the other columns are not null

    function insert(tableName, columnsAndValues) {
        const columns = Object.keys(columnsAndValues)
        const columnsString = columns.join(',')
        const valueParams = columns.map(column => `:${column}`).join(',')
        const paramValues = columns.reduce((acc, column) => {
            acc[":" + column] = columnsAndValues[column]
            return acc
        }, {})

        const query = `INSERT INTO ${tableName} (${columnsString}) VALUES (${valueParams})`

        const time1 = Date.now()
        db.run(query, paramValues)
        const time2 = Date.now()

        saveDb()

        if (verbose || (time2 - time1 > warnTime)) {
            console.log("Executing: \n", query, paramValues)
            console.log("Took: \n", (time2 - time1) + "ms to execute")
        }
    }

    // insert("users", {"age": 23, "name": "adrian"}) 
    //Insert a row in the table "users" with the columns "age" and "name" and the values 23 and "adrian"

    function update(tableName, columnsAndValues, where, rawWhere = false) {
        if(verbose && rawWhere) console.warn("Using rawWhere:", where)
        const columns = Object.keys(columnsAndValues)
        const columnsString = columns.map(column => `${column}=:${column}Val`).join(',')
        const whereColumns = Object.keys(where)
        const whereString = (
            rawWhere 
            ? where 
            : whereColumns.map(column => `${column}=:${column}If`).join(' AND ')
        )
        const paramValues = (() => {
            const params = columns.reduce((acc, column) => {
                acc[":" + column + "Val"] = columnsAndValues[column]
                return acc
            }, {})
            if (rawWhere) return params

            return whereColumns.reduce((acc, column) => {
                acc[`:${column}If`] = where[column]
                return acc
            }, params)
        })()

        const query = `UPDATE ${tableName} SET ${columnsString} WHERE (${whereString})`

        const time1 = Date.now()

        if(rawWhere) db.run(query)
        else db.run(query, paramValues)

        const time2 = Date.now()
        
        if (verbose || (time2 - time1 > warnTime)) {
            console.log("Executing: \n", query, paramValues)
            console.log("Took: \n", (time2 - time1) + "ms to execute")
        }
        
        saveDb()
    }

    // update("users", {"name": "johnny", "age": 69}, {"id": 1, "age": 420}) 
    // Replace the column "name" with "johnny" and "age" with 420 where the column "id" is 1 and "age" is 69
    
    // update("users", {"age": 69, "name": "john"}, "1=1", true)
    //Replace the column "age" with 69 and "name" with "john" but the condition is passed as a string and eveluated as is. 
    //In this case 1=1 will always be true so it replaces every entry. Be careful to not give users acces to the condition value if used like this.

    function deleteRows(tableName, where, rawWhere = false) {
        if(verbose && rawWhere) console.warn("Using rawWhere:", where)
        const whereColumns = Object.keys(where)
        const whereString = (
            rawWhere
                ? where
                : whereColumns.map(column => `${column}=:${column}`).join(' AND ')
        )
        const paramValues = (() => {
            if (rawWhere) return where
            return whereColumns.reduce((acc, column) => {
                acc[`:${column}`] = where[column]
                return acc
            }, {})
        })()
        
        const query = `DELETE FROM ${tableName} WHERE (${whereString})`

        const time1 = Date.now()
        
        if(rawWhere) db.run(query)
        else db.run(query, paramValues) 
        
        const time2 = Date.now()
        if (verbose || (time2 - time1 > warnTime)) {
            console.log("Executing: \n", query, paramValues)
            console.log("Took: \n", (time2 - time1) + "ms to execute")
        }
        
        saveDb()
    }

    // deleteRows("users", {"id": 3, "age": 420})
    // deleteRows("users", "1=1", true)
    //Delete the row where the column "id" is 1 and "age" is 420. Can be used with rawWhere like the update function. 
    //As this deletes entries, be very careful when giving users the ability to use this

    function executeRawWithParams(query, params) {
        if(verbose) console.warn("Using raw query with params:", query, params)
        const time1 = Date.now()

        db.run(query, params)
        
        const time2 = Date.now()
        if (verbose || (time2 - time1 > warnTime)) {
            console.log("Executing: \n", query, values)
            console.log("Took: \n", (time2 - time1) + "ms to execute")
        }
        
        saveDb()
    }

    // executeRawWithParams("INSERT INTO users (name, age) VALUES (:name, :age)", {":name": "john", ":age": 69})
    // Execute a raw query with parameters. In this case it replaces the column "name" with "john" where the column "id" is 1
    // This function is safer than executeRaw as it uses parameters instead of directly inserting values into the query
    // but you should still be very careful with it when using user input

    function executeRaw(query) {
        if(verbose) console.warn("Using raw query:", query)
        const time1 = Date.now()

        db.run(query)
        
        const time2 = Date.now()
        if (verbose || (time2 - time1 > warnTime)) {
            console.log("Executing: \n", query)
            console.log("Took: \n", (time2 - time1) + "ms to execute")
        }
        
        saveDb()
    }

    // executeRaw("DROP TABLE users")
    // Execute a raw query. In this case it deletes the table "users". 
    // Ideally you would never use this, but sometimes you need very complex queries.
    // DO NOT PASS UNSANITIZED USER INPUT TO THIS FUNCTION AND GENERALLY BE EXTREMELY CAREFUL WITH THIS FUNCTION

    function select(tableName, columns, where, rawWhere = false) {
        if(verbose && rawWhere) console.warn("Using rawWhere:", where)
        const columnsString = columns.join(',')
        const whereColumns = Object.keys(where)
        const whereString = (
            rawWhere
                ? where
                : whereColumns.map(column => `${column}=:${column}`).join(' AND ')
        )
        const paramValues = (() => {
            if (rawWhere) return
            return whereColumns.reduce((acc, column) => {
                acc[`:${column}`] = where[column]
                return acc
            }, {})
        })()

        const query = `SELECT ${columnsString} FROM ${tableName} WHERE (${whereString})`

        const time1 = Date.now()
        const result = db.exec(query, paramValues)
        const time2 = Date.now()

        if (verbose || (time2 - time1 > warnTime)) {
            console.log("Executing: \n", query, paramValues)
            console.log("Took: \n", (time2 - time1) + "ms to execute")
            console.log("Result: \n", result)
        }

        return result
    }

    // select("users", ["name", "age"], {"id": 1, "age": 69})
    // Select the columns "name" and "age" from the table "users" where the column "id" is 1 AND "age" is 69
    // Returns an array of objects with the columns as keys and the values as values
    // Can aslso use rawWhere like the update and delete functions

    on("u5_sqlite:js:createTable", createTable)
    on("u5_sqlite:js:insert", insert)
    on("u5_sqlite:js:update", update)
    on("u5_sqlite:js:delete", deleteRows)
    on("u5_sqlite:js:executeRawWithParams", executeRawWithParams)
    on("u5_sqlite:js:executeRaw", executeRaw)

    on("u5_sqlite:js:select", (callbackId, tableName, columns, where, rawWhere) => {
        const result = select(tableName, columns, where, rawWhere)
        emit("u5_sqlite:lua:callbackResult", callbackId, result)
    })

    on('onResourceStop', (resource) => {
        if (resource === resourceName) {
            saveDb()
        }
    })
}
//---------------------------------- MAIN END ----------------------------------\\

(async () => {
    await main()
    emit("u5_sqlite:js:dbready")
})()


