import reader from "xlsx";

export function excelReader(FilePath: string, Sheet: string | number) {
  return new Promise((resolve) => {
    const excel = reader.readFile(FilePath);
    let data: any[] = [];
    const sheetName = excel.Sheets[Sheet];
    const temp = reader.utils.sheet_to_json(sheetName);
    temp.forEach((res) => {
      data.push(res);
    });
    resolve(data);
  });
}