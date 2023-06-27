import { writeJsonFile } from "@Commonservice/readwriteJson";
import { logIn } from "@POM/login&logoutPage/login";
import { reqBody } from "@dataProvider/requestData";
import { expect, request } from "@playwright/test";

class Order {
  async orderCreate() {
    //New Context
    const newContext = await request.newContext({ ignoreHTTPSErrors: true });
    //End Point
    const create = await newContext.post(
      "http://qa.kongapi.aaludradevelopers.com/btm/sales/order/create?draft=false&quotationConverted=true",
      {
        //Token
        headers: { "x-access-token": logIn.key },
        //Request Body
        data: reqBody.orderCreate(),
      }
    );
    //Assertion
    expect(create.ok()).toBeTruthy();
    //Response
    const createResponse = await create.json();
    //Writing JSON file
    await writeJsonFile(createResponse, "orderCreate");
  }
}
export const salesOrder = new Order();
