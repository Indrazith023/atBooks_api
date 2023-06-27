import mysql from "mysql";
import { writeJsonFile } from "@Commonservice/readwriteJson";
import data from "../../Database/database.json";

export function readdb(Query: string | mysql.QueryOptions, Filename?: any) {
  return new Promise((resolve, rejects) => {
    const connection = mysql.createConnection(data.config);
    connection.query(Query, (err, data) => {
      if (err) rejects(err);
      else {
        if (Filename) {
          writeJsonFile(data, Filename, "tests-results/dbData");
        }
        resolve(data);
      }
    });
  });
}
