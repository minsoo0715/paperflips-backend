import mysql from "mysql";
import { dbconfig } from "../config/database";

export let connection = mysql.createConnection(dbconfig);

connection.on("error", (err: mysql.MysqlError) => {
    if (err.code === "PROTOCOL_CONNECTION_LOST") {
      connection = mysql.createConnection(dbconfig);
    }
});