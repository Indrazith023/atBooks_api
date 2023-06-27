import { request } from "playwright";
import { reqBody } from "@dataProvider/requestData";
import { expect } from "@playwright/test";
import { writeJsonFile } from "@Commonservice/readwriteJson";

class Login {
  key: string;
  async loginFunctionality() {
    const newContext = await request.newContext({ ignoreHTTPSErrors: true });
    //Endpoint
    const login = await newContext.post(
      "http://qa.kongapi.aaludradevelopers.com/btm/auth/signin",
      {
        //Request body data
        data: await reqBody.Logindata(),
      }
    );
    expect(login.ok()).toBeTruthy();
    //Response
    const response = await login.json();
    //Writing Json file for Response
    await writeJsonFile(response, "login");
    const status = response.status;
    //Token
    if (status) {
      this.key = response.data.sfckey;
    } else {
      this.key = response.err;
    }
  }
}
export const logIn = new Login();
