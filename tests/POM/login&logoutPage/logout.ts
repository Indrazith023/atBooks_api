import { writeJsonFile } from "@Commonservice/readwriteJson";
import { expect, request } from "@playwright/test";
import { logIn } from "./login";

class logout {
  async logoutFunctionality() {
    const newContext = await request.newContext();
    //Endpoint
    const logout = await newContext.get(
      `http://qa.kongapi.aaludradevelopers.com/btm/auth/signout/?key=${logIn.key}`
    );
    expect(logout.ok()).toBeTruthy();
    //Response
    const logoutResponse = await logout.json();
    //Writing Json file for Response
    await writeJsonFile(logoutResponse, "logout");
  }
}
export const logOut = new logout();
