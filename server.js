const fs = require('fs');
const name = GetCurrentResourceName()
const defaultPath = "./resources/" + name
const dbFileName = "db.sqlite"
const dbFilePath = defaultPath + "/db/" + dbFileName
const initSqlJs = require("./db/sql-wasm.js");
const filebuffer = fs.readFileSync(dbFilePath);

(async () => {
  const sql = await initSqlJs();
  const db = new sql.Database(filebuffer)

  function saveDb() {
    const data = db.export()
    const buffer = Buffer.from(data)
    fs.writeFileSync(dbFilePath, buffer)
  }

  let sqlstr = "CREATE TABLE test (id int, testString string);"
  db.run(sqlstr); // Run the query without returning anything
  saveDb()
})()



