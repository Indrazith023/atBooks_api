import { PathLike } from "fs";
import fs from "fs/promises";
import { Stream } from "stream";

export function writeJsonFile(
  FileData:
    | string
    | NodeJS.ArrayBufferView
    | Iterable<string | NodeJS.ArrayBufferView>
    | AsyncIterable<string | NodeJS.ArrayBufferView>
    | Stream,
  FileName: any,
  FilePath?: any
) {
  return new Promise((resolve, rejects) => {
    FileData = JSON.stringify(FileData);
    let path = FilePath
      ? `${FilePath}/${FileName}.json`
      : `tests-results/outPut/${FileName}.json`;
    fs.writeFile(path, FileData)
      .then((data) => resolve(data))
      .catch((err) => console.log(err));
  });
}

export function readJsonFile(FilePath: PathLike | fs.FileHandle) {
  return new Promise((resolve, rejects) => {
    fs.readFile(FilePath, "utf-8")
      .then((data) => {
        data = JSON.parse(data);
        resolve(data);
      })
      .catch((err) => {
        console.log(err);
        resolve(null);
      });
  });
}
