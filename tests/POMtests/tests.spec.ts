import { test } from "@playwright/test";
import { logIn } from "@POM/login&logoutPage/login";
import { salesEnquiry } from "@POM/salesModule/salesEnquiry";
import { logOut } from "@POM/login&logoutPage/logout";
import { salesQuotation } from "@POM/salesModule/salesQuotation";
import { salesOrder } from "@POM/salesModule/salesOrder";

// test.beforeAll(async () => {
//   await logIn.loginFunctionality();
// });
test("Sales", async () => {
  // await salesEnquiry.createEnquiry();
  // await salesEnquiry.enquiryApprove();
  // await salesQuotation.createQuotation();
  // await salesQuotation.approveQuotation();
  // await salesOrder.orderCreate();
  await logIn.loginFunctionality();
});
test.afterAll(async () => {
  await logOut.logoutFunctionality();
});
