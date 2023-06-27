import { logIn } from "@POM/login&logoutPage/login";
import { request, expect } from "@playwright/test";
import { reqBody } from "@dataProvider/requestData";
import { readJsonFile, writeJsonFile } from "@Commonservice/readwriteJson";

class quotation {
  //quotationCreate
  async createQuotation() {
    const newContext = await request.newContext({ ignoreHTTPSErrors: true });
    //Endpoint
    const create = await newContext.post(
      "http://qa.kongapi.aaludradevelopers.com/btm/sales/quotation/create?draft=false&enquiryConverted=true",
      {
        //Token
        headers: { "x-access-token": logIn.key },
        //Request Body data
        data: await reqBody.quotationCreate(),
      }
    );
    expect(create.ok()).toBeTruthy();
    //Created Response
    const response = await create.json();
    //Writing Json file for Response
    await writeJsonFile(response, "quotationCreate");
  }

  //quotationApprove
  async approveQuotation() {
    interface quotationData {
      data: {
        estimateid: number;
      };
    }
    const newContext = await request.newContext({ ignoreHTTPSErrors: true });
    const quotationStatus = (await readJsonFile(
      "tests-results\\outPut\\quotationCreate.json"
    )) as quotationData;
    //Endpoint
    const approve = await newContext.post(
      `http://qa.kongapi.aaludradevelopers.com/btm/base/workflowstatus/edit/${quotationStatus.data.estimateid}`,
      {
        //Token
        headers: { "x-access-token": logIn.key },
        //Request Body data
        data: await reqBody.quotationApprove(),
      }
    );
    expect(approve.ok()).toBeTruthy();
    //Response
    const response = await approve.json();
    //Writing Json file for Response
    await writeJsonFile(response, "QuotationApprove");
  }
}

export const salesQuotation = new quotation();
