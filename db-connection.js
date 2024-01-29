import mysql from "mysql";

const mysqlConnection = mysql.createConnection({
  host: "sql6.freemysqlhosting.net",
  user: "sql6680499",
  password: "UP7n2K1hsS",
  database: "sql6680499",
});

export default mysqlConnection;
