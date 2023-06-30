import { createConnection, MysqlError } from "mysql";
import { dbconfig } from "../config/database";

export const connection = createConnection(dbconfig);

connection.on("error", (err: MysqlError) => {
  if (err.code === "PROTOCOL_CONNECTION_LOST") {
    connection.resume();
  }
});
