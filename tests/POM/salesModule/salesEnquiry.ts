import { expect, request } from "@playwright/test";
import { logIn } from "../login&logoutPage/login";
import { reqBody } from "@dataProvider/requestData";
import { writeJsonFile, readJsonFile } from "@Commonservice/readwriteJson";

class Enquiry {
  //enquiryCreate
  async createEnquiry() {
    const apiContext = await request.newContext({ ignoreHTTPSErrors: true });
    //Endpoint
    const create = await apiContext.post(
      "http://qa.kongapi.aaludradevelopers.com/btm/sales/enquiry/create?draft=false",
      {
        //Token
        headers: { "x-access-token": logIn.key },
        //Request body
        data: await reqBody.enquiryCreate(),
      }
    );
    expect(create.ok()).toBeTruthy();
    //Response
    const createResponse = await create.json();
    //Writing response to JSON
    await writeJsonFile(createResponse, "enquiryCreate");
  }

  //enquiryApprove
  async enquiryApprove() {
    interface EnquiryData {
      data: {
        enquiryid: number;
      };
    }
    const apiContext = await request.newContext({ ignoreHTTPSErrors: true });
    //Read created enquiry response
    const enquiryStatus = (await readJsonFile(
      "tests-results\\outPut\\enquiryCreate.json"
    )) as EnquiryData;
    //Endpoint
    const enqApprove = await apiContext.post(
      `http://qa.kongapi.aaludradevelopers.com/btm/sales/enquiry/edit/${enquiryStatus.data.enquiryid}`,
      {
        //Token
        headers: { "x-access-token": logIn.key },
        //Request body
        data: await reqBody.enquiryApprove(),
      }
    );
    const enqApproveResponse = await enqApprove.json();
    await writeJsonFile(enqApproveResponse, "enqApprove");
  }
}
export const salesEnquiry = new Enquiry();
