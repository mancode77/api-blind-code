import mysql from "mysql";

const mysqlConnection = mysql.createConnection({
  host: "iwm.h.filess.io",
  user: "codeblind_killjobyes",
  password: "cdb69b94962eed9107ef6d988c1843463103efb0",
  database: "codeblind_killjobyes",
  port: 3307
});

export default mysqlConnection;
