import { excelReader } from "@Commonservice/xlsx";
import { readdb } from "@Commonservice/database";
import dbTbl from "../../Database/database.json";
import { readJsonFile } from "@Commonservice/readwriteJson";

class requestBody {
  //Request body for Login functionality
  Logindata = async () => {
    const reqdata = await excelReader("RequestData.xlsx", "LoginData");
    return {
      loginid: reqdata[0].EmailID,
      loginpwd: reqdata[0].Password,
    };
  };

  //Username getting using email id in database
  Username = async () => {
    return await readdb(
      `SELECT * FROM ${dbTbl.UserTable} WHERE emailid="${
        (
          await this.Logindata()
        ).loginid
      }" AND tenantid= 5`
    ).then((data) => {
      return { username: data[0].profilename, userid: data[0].userid };
    });
  };

  //Request body for enquiry create functionality
  enquiryCreate = async () => {
    const data = (await excelReader("RequestData.xlsx", "Enquiry")) as Array<
      Record<string, unknown>
    >;
    //ExcelColumns
    const {
      FinancialYear,
      BranchCode,
      Assignee_EmpoyeeCode,
      CustomerCode,
      tenantid,
    } = data[0];
    const total = [];
    const prod = [];
    for (const response of data) {
      const { ProductCode, prodPrice, quantity } = response;
      //Enquiry Total
      total.push(+quantity * +prodPrice);
      //PRODUCT DETAILS
      prod.push({
        finyear: FinancialYear ? FinancialYear : "01-Apr-2023 - 31-Mar-2024",
        branchid: BranchCode
          ? await readdb(
              `SELECT * FROM ${dbTbl.BranchTable} WHERE branchcode="${BranchCode}" AND tenantid=${tenantid}`
            ).then((data) => {
              return data[0].branchid;
            })
          : "HO",
        tenantid: tenantid,
        price: +prodPrice,
        quantity: +quantity,
        cqty: +quantity,
        prodid: ProductCode
          ? await readdb(
              `SELECT * FROM ${dbTbl.ProductTable} WHERE prodcode="${ProductCode}" AND tenantid=${tenantid}`
            ).then((data) => {
              return data[0].prodid;
            })
          : "",
        produomid: await readdb(
          `SELECT * FROM ${dbTbl.ProductTable} WHERE prodcode="${ProductCode}" AND ${tenantid}`
        ).then(async (data) => {
          const id = await readdb(
            `SELECT * FROM ${dbTbl.ProductUOMTable} WHERE prodid=${data[0].prodid} AND tenantid=${tenantid}`
          ).then((id) => {
            return id[0].produomid;
          });
          return id;
        }),
        basicvalue: +prodPrice * +quantity,
        basicamount: +prodPrice * +quantity,
        particulars: "",
        lastupdatedby: (await this.Username()).username,
        lastupdateddt: new Date().toISOString(),
        roundoff: 0,
      });
    }
    const totalValue = total.reduce(
      (previous, current) => previous + current,
      0
    );
    const createEnquiry = {
      finyear: FinancialYear ? FinancialYear : "01-Apr-2023 - 31-Mar-2024",
      branchid: BranchCode
        ? await readdb(
            `SELECT * FROM ${dbTbl.BranchTable} WHERE branchcode="${BranchCode}" AND tenantid=${tenantid}`
          ).then((data) => {
            return data[0].branchid;
          })
        : "HO",
      tenantid: tenantid,
      enquirydt: new Date().toISOString().slice(0, 10),
      enquirytype: "goods",
      enquirystatus: 48,
      reference: "GOOGLE",
      assignedto: Assignee_EmpoyeeCode
        ? await readdb(
            `SELECT * FROM ${dbTbl.EmpoyeeTable} WHERE employeecode="${Assignee_EmpoyeeCode}" AND tenantid=${tenantid}`
          ).then((data) => {
            return data[0].employeeid;
          })
        : 1,
      ccyid: 82,
      source: 1779,
      enquirytotal: totalValue,
      status: "Active",
      lastupdatedby: (await this.Username()).username,
      lastupdateddt: new Date().toISOString(),
      contactid: CustomerCode
        ? await readdb(
            `SELECT * FROM ${dbTbl.ContactTable} WHERE contactcode="${CustomerCode}" AND tenantid=${tenantid}`
          ).then((data) => {
            return data[0].contactid;
          })
        : "",
      otherdetails: [],
      enqdetails: [],
      roundoff: 0,
      isrevised: false,
      referencedt: new Date().toISOString().slice(0, 10),
      createdby: (await this.Username()).username,
      history: [
        {
          reftype: "sl_enquiry",
          createduserid: (await this.Username()).userid,
          tenantid: tenantid,
          branchid: BranchCode
            ? await readdb(
                `SELECT * FROM ${dbTbl.BranchTable} WHERE branchcode="${BranchCode}" AND tenantid=${tenantid}`
              ).then((data) => {
                return data[0].branchid;
              })
            : "HO",
          finyear: FinancialYear ? FinancialYear : "01-Apr-2023 - 31-Mar-2024",
          description: "Sales - Enquiry info created",
          actiontype: "CREATED",
          status: "Active",
          createdby: (await this.Username()).username,
          createddt: new Date().toISOString(),
          groupby: 1680785908305,
        },
      ],
    };
    createEnquiry.enqdetails = prod;
    return createEnquiry;
  };

  //Request for Enquiry approve functionality
  enquiryApprove = async () => {
    interface EnquiryData {
      data: {
        enquiryid: number;
      };
    }
    const enquiry = (await readJsonFile(
      "tests-results\\outPut\\enquiryCreate.json"
    )) as EnquiryData;
    return {
      enquiryid: enquiry.data.enquiryid,
      enquirystatus: await readdb(
        `SELECT * FROM ${dbTbl.StatuTable} WHERE statusname="Accepted"`
      ).then((data) => {
        return data[0].statusid;
      }),
      lastupdatedby: (await this.Username()).username,
    };
  };

  //Request body for quotation create functionality
  quotationCreate = async () => {
    //dueDate
    const variable = new Date();
    variable.setDate(variable.getDate() + 2);
    const dueDate = variable.toISOString().slice(0, 10);
    //excelReader
    const data = (await excelReader("RequestData.xlsx", "Enquiry")) as Array<
      Record<string, unknown>
    >;
    //excelColumns
    const {
      FinancialYear,
      tenantid,
      BranchCode,
      CustomerCode,
      Assignee_EmpoyeeCode,
      billingaddress,
      shipingaddress,
      POS,
    } = data[0];
    //database reading for BranchID
    const branchid = BranchCode
      ? await readdb(
          `SELECT * FROM ${dbTbl.BranchTable} WHERE branchcode="${BranchCode}" AND tenantid=${tenantid}`
        ).then((data) => {
          return data[0].branchid;
        })
      : "HO";
    //database reading for customer id
    const contactid = CustomerCode
      ? await readdb(
          `SELECT * FROM ${dbTbl.ContactTable} WHERE contactcode="${CustomerCode}" AND tenantid=${tenantid}`
        ).then((data) => {
          return data[0].contactid;
        })
      : "";
    //database reading for employee id
    const assignedto = Assignee_EmpoyeeCode
      ? await readdb(
          `SELECT * FROM ${dbTbl.EmpoyeeTable} WHERE employeecode="${Assignee_EmpoyeeCode}" AND tenantid=${tenantid}`
        ).then((data) => {
          return data[0].employeeid;
        })
      : 1;
    //database reading for gst no
    const gstno = CustomerCode
      ? await readdb(
          `SELECT * FROM ${dbTbl.ContactTable} WHERE contactcode="${CustomerCode}" AND tenantid=${tenantid}`
        ).then((data) => {
          return data[0].taxno;
        })
      : "";
    //database reading for billing address
    const billing = await readdb(
      `SELECT * FROM ${dbTbl.ContactAddressTable} WHERE contactid=${contactid} AND addresstype="Billing"`
    ).then((data) => {
      return data[0]?.address;
    });
    //database reading for shipping address
    const shiping = await readdb(
      `SELECT * FROM ${dbTbl.ContactAddressTable} WHERE contactid=${contactid} AND addresstype="Shipping"`
    ).then((data) => {
      return data[0]?.address;
    });
    //empty array for getting value
    const prodDetails = [];
    const TaxDetails = [];
    const total = [];
    const taxValue = [];
    const enquiryResponse = (await readJsonFile(
      "tests-results\\outPut\\enquiryCreate.json"
    )) as any;
    for (const response of data) {
      const { ProductCode, prodPrice, quantity, Discount, SalesTax } = response;
      //product value
      const prodValue = Discount
        ? +quantity * +prodPrice - +prodPrice * +quantity * +Discount
        : +quantity * +prodPrice;
      //tax value
      const tax = Discount
        ? prodValue * +SalesTax
        : +quantity * +prodPrice * +SalesTax;
      //push the values in empty array
      total.push(prodValue + tax);
      taxValue.push(prodValue * +SalesTax);
      //database reading for prodId
      const prodid = await readdb(
        `SELECT * FROM ${dbTbl.ProductTable} WHERE prodcode="${ProductCode}" AND tenantid=${tenantid}`
      ).then((data) => {
        return data[0].prodid;
      });
      //database reading for enquiry detail id
      const enquirydtlid =
        enquiryResponse != null
          ? await readdb(
              `SELECT * FROM ${dbTbl.EnquirydtlTable} WHERE enquiryid=${enquiryResponse.data.enquiryid} AND prodid=${prodid}`
            ).then((data) => {
              if (data[0] == undefined) {
                return null;
              } else {
                return data[0].enquirydtlid;
              }
            })
          : null;
      //database reading for prod UOM id
      const produomid = await readdb(
        `SELECT * FROM ${dbTbl.ProductUOMTable} WHERE prodid=${prodid} AND tenantid=${tenantid}`
      ).then((id) => {
        return id[0].produomid;
      });
      //database reading for tax group id
      const taxgrpid = SalesTax
        ? await readdb(
            `SELECT * FROM ${dbTbl.TaxTable}  WHERE taxprnct = ${
              +SalesTax * 100
            } AND tenantid = ${tenantid}`
          ).then((data) => {
            return data[0].taxgrpid;
          })
        : "";
      //database reading for tax id
      const taxid = SalesTax
        ? await readdb(
            `SELECT * FROM ${dbTbl.TaxTable}  WHERE taxprnct = ${
              +SalesTax * 100
            } AND tenantid = ${tenantid}`
          ).then((data) => {
            return data[0].taxid;
          })
        : "";
      //database reading for tax code
      const taxcode = SalesTax
        ? await readdb(
            `SELECT * FROM ${dbTbl.TaxTable}  WHERE taxprnct = ${
              +SalesTax * 100
            } AND tenantid = ${tenantid}`
          ).then((data) => {
            return data[0].taxcode;
          })
        : "";
      //salesdetails
      prodDetails.push({
        enquiryid:
          enquiryResponse != null ? enquiryResponse.data.enquiryid : null,
        enquirydtlid: enquirydtlid,
        finyear: FinancialYear ? FinancialYear : "01-Apr-2023 - 31-Mar-2024",
        branchid: branchid,
        tenantid: tenantid,
        price: +prodPrice,
        quantity: +quantity,
        cqty: +quantity,
        prodid: prodid,
        produomid: produomid,
        prodpricetype: null,
        basicvalue: +quantity * +prodPrice,
        taxgrpid: taxgrpid,
        taxid: taxid,
        taxvalue: tax.toFixed(2),
        taxpercent: +SalesTax * 100,
        taxcode: taxcode,
        discntprcnt: Discount ? +Discount * 100 : 0,
        discntvalue: Discount ? +quantity * +prodPrice * +Discount : 0,
        basicamount: prodValue + tax,
        particulars: "",
        packingvalue: null,
        packinguom: null,
        noofbags: null,
        lastupdatedby: (await this.Username()).username,
        additionalcharges: [],
        roundoff: (Math.round(prodValue + tax) - (prodValue + tax)).toFixed(2),
        type: "TAXES",
        cgst: POS == "Tamil Nadu" ? (tax / 2).toFixed(2) : null,
        sgst: POS == "Tamil Nadu" ? (tax / 2).toFixed(2) : null,
        igst: POS != "Tamil Nadu" ? tax.toFixed(2) : null,
        duedate: dueDate,
      });
      //sotaxes
      TaxDetails.push({
        tenantid: tenantid,
        branchid: branchid,
        finyear: FinancialYear ? FinancialYear : "01-Apr-2023 - 31-Mar-2024",
        type: "TAXES",
        taxgrpid: taxgrpid,
        taxid: taxid,
        taxpercent: +SalesTax * 100,
        taxvalue: tax.toFixed(2),
        cgst: POS == "Tamil Nadu" ? (tax / 2).toFixed(2) : null,
        sgst: POS == "Tamil Nadu" ? (tax / 2).toFixed(2) : null,
        igst: POS != "Tamil Nadu" ? tax.toFixed(2) : null,
        isactive: "Y",
        taxcode: taxcode,
      });
    }
    //Tax total
    const taxTotal = taxValue.reduce(
      (previous, current) => previous + current,
      0
    );
    //Product total without tax
    const prodtotal = total.reduce(
      (previous, current) => previous + current,
      0
    );
    return {
      finyear: FinancialYear ? FinancialYear : "01-Apr-2023 - 31-Mar-2024",
      branchid: branchid,
      assignedto: assignedto,
      tenantid: tenantid,
      estimatedt: new Date().toISOString().slice(0, 10),
      estimatetype: "goods",
      sequenceref: "QUOT_NO",
      estimatestatus: 39,
      reference: "GOOGLE",
      paymenttermid: 2285,
      pymtmethod: "Cash",
      pos: "33-Tamil Nadu",
      billingaddress: billingaddress
        ? billingaddress
        : billing
        ? billing
        : "COIMBATORE",
      shipingaddress: shipingaddress
        ? shipingaddress
        : shiping
        ? shiping
        : "COIMBATORE",
      duedate: dueDate,
      ccyid: 82,
      referencedt: new Date().toISOString().slice(0, 10),
      subtotal: prodtotal - taxTotal,
      discntprcnt: 0,
      discntvalue: 0,
      shipingprcnt: 0,
      shipingvalue: 0,
      taxtotal: taxTotal,
      estimatetotal: prodtotal,
      status: "Active",
      lastupdatedby: (await this.Username()).username,
      contactid: contactid,
      gstno: gstno,
      enquiryid:
        enquiryResponse != null ? enquiryResponse.data.enquiryid : null,
      salesdetails: prodDetails,
      roundoff: 0,
      tnc: "",
      otherdetails: [],
      sotaxes: TaxDetails,
      isrevised: false,
      createduserid: (await this.Username()).userid,
      createdby: (await this.Username()).username,
      history: [
        {
          reftype: "sl_sq",
          createduserid: (await this.Username()).userid,
          tenantid: tenantid,
          branchid: branchid,
          finyear: FinancialYear ? FinancialYear : "01-Apr-2023 - 31-Mar-2024",
          description: "Sales Quotation Created",
          actiontype: "CREATED",
          status: "Active",
          createdby: (await this.Username()).username,
          createddt: new Date().toISOString(),
          groupby: 1680945181383,
        },
      ],
    };
  };

  //Request body for quotation approve functionality
  quotationApprove = async () => {
    interface quotationData {
      data: {
        estimateid: number;
      };
    }
    const quoteResponse = (await readJsonFile(
      "tests-results\\outPut\\quotationCreate.json"
    )) as quotationData;
    return {
      refid: quoteResponse.data.estimateid,
      reftype: "Sales Quotation",
      approvalstatus: "Approved",
      approverid: (await this.Username()).userid,
    };
  };

  //Request body for order create functionality
  orderCreate = async () => {
    interface quotationData {
      data: {
        estimateid: number;
        estimateno: string;
        estimatedt: string;
      };
    }
    //Quotation Response
    const quotResponse = (await readJsonFile(
      "tests-results\\outPut\\quotationCreate.json"
    )) as quotationData;
    //Due Date
    const due = new Date();
    due.setDate(due.getDate() + 2);
    const dueDate = due.toISOString().slice(0, 10);
    //Reading excel data
    const excelData = (await excelReader(
      "RequestData.xlsx",
      "Enquiry"
    )) as Array<Record<string, unknown>>;
    const {
      FinancialYear,
      tenantid,
      BranchCode,
      CustomerCode,
      Assignee_EmpoyeeCode,
      POS,
      billingaddress,
      shipingaddress,
    } = excelData[0];
    //tenantid
    const tenantId = tenantid;
    //Database reading for Financial Year
    const finyear: string = FinancialYear
      ? FinancialYear
      : await readdb(
          `SELECT * FROM atbooks_qa.tbl_bs_setting_values WHERE datareftype='CURRFINYEAR' AND tenantid=${tenantId}`
        ).then((data) => {
          return data[0].settingvalue;
        });
    //Database reading for Branch Code
    const branchid: Number = BranchCode
      ? await readdb(
          `SELECT * FROM ${dbTbl.BranchTable} WHERE branchcode="${BranchCode}" AND tenantid=${tenantId}`
        ).then((data) => {
          return data[0].branchid;
        })
      : "";
    //Database reading for Customer code
    const contactid: number = CustomerCode
      ? await readdb(
          `SELECT * FROM ${dbTbl.ContactTable} WHERE contactcode="${CustomerCode}" AND tenantid=${tenantId}`
        ).then((data) => {
          return data[0].contactid;
        })
      : "";
    //Database reading for gst NO
    const gstno: string = contactid
      ? await readdb(
          `SELECT * FROM ${dbTbl.ContactTable} WHERE contactid=${contactid}`
        ).then((data) => {
          return data[0].taxno;
        })
      : "";
    //Database reading for Billing address
    const billing = await readdb(
      `SELECT * FROM ${dbTbl.ContactAddressTable} WHERE contactid=${contactid} AND addresstype="Billing"`
    ).then((data) => {
      return data[0].address;
    });
    //Database reading for Shipping address
    const shipping = await readdb(
      `SELECT * FROM ${dbTbl.ContactAddressTable} WHERE contactid=${contactid} AND addresstype="Shipping"`
    ).then((data) => {
      return data[0]?.address;
    });
    //Database reading for Pos
    const pos = POS
      ? await readdb(
          `SELECT * FROM atbooks_qa.tbl_bs_state WHERE statename LIKE "%${POS}%"`
        ).then((data) => {
          return data[0].gststatecode;
        })
      : "33-Tamil Nadu";
    //Database reading for Assignee ID
    const assignedto: number = Assignee_EmpoyeeCode
      ? await readdb(
          `SELECT * FROM ${dbTbl.EmpoyeeTable} WHERE employeecode="${Assignee_EmpoyeeCode}" AND tenantid=${tenantid}`
        ).then((data) => {
          return data[0].employeeid;
        })
      : 1;
    //Empty arrays
    const soDetails = [];
    const soTaxes = [];
    const taxTotal = [];
    const prodTotal = [];
    //Itering the product details
    for (const data of excelData) {
      const { ProductCode, prodPrice, quantity, SalesTax, Discount } = data;
      // Discount Value
      const DiscountValue = +prodPrice * +quantity * +Discount;
      //Product Value
      const prodValue = Discount
        ? +prodPrice * +quantity - DiscountValue
        : +prodPrice * +quantity;
      //Tax value
      const tax = prodValue * +SalesTax;
      //product total of single product
      prodTotal.push(+prodValue);
      //tax total of single product
      taxTotal.push(+tax);
      //Database reading for prod id
      const prodid = await readdb(
        `SELECT * FROM ${dbTbl.ProductTable} WHERE prodcode = "${ProductCode}" AND tenantid = ${tenantId}`
      ).then((data) => {
        return data[0].prodid;
      });
      //Database reading for UOM id
      const uomid = await readdb(
        `SELECT * FROM ${dbTbl.ProductUOMTable} WHERE prodid = ${prodid} AND tenantid = ${tenantId}`
      ).then((data) => {
        return data[0].produomid;
      });
      //Database reading for tax group id
      const taxgrpid = await readdb(
        `SELECT * FROM ${dbTbl.TaxTable} WHERE taxprnct=${
          +SalesTax * 100
        } AND tenantid = ${tenantId}`
      ).then((data) => {
        return data[0].taxgrpid;
      });
      //Database reading for tax id
      const taxid = await readdb(
        `SELECT * FROM ${dbTbl.TaxTable} WHERE taxprnct=${
          +SalesTax * 100
        } AND tenantid = ${tenantId}`
      ).then((data) => {
        return data[0].taxid;
      });

      //Database reading for tax code
      const taxcode = await readdb(
        `SELECT * FROM ${dbTbl.TaxTable} WHERE taxprnct=${
          +SalesTax * 100
        } AND tenantid = ${tenantId}`
      ).then((data) => {
        return data[0].taxcode;
      });
      //Database reading for place of orgin
      const origin = await readdb(
        `SELECT * FROM atbooks_qa.tbl_bs_setting_values WHERE datareftype="PLACEOFORIGIN" AND tenantid = ${tenantId}`
      ).then((data) => {
        return data[0].settingvalue;
      });
      //Sales order details
      soDetails.push({
        finyear: finyear,
        branchid: branchid,
        tenantid: tenantId,
        price: +prodPrice,
        quantity: +quantity,
        cqty: +quantity,
        prodid: prodid,
        materialgrade: null,
        materialweight: null,
        batchno: null,
        uomid: uomid,
        prodpricetype: null,
        basicvalue: +quantity * +prodPrice,
        taxgrpid: taxgrpid,
        taxid: taxid,
        taxvalue: tax.toFixed(2),
        taxpercent: +SalesTax * 100,
        taxcode: taxcode,
        discntprcnt: +Discount * 100,
        discntvalue: DiscountValue,
        basicamount: +prodValue + +tax,
        balamount: +prodValue + +tax,
        particulars: "",
        lastupdatedby: (await this.Username()).username,
        estimateid: quotResponse != null ? quotResponse.data.estimateid : null,
        estimateitmid:
          quotResponse != null
            ? await readdb(
                `SELECT * FROM ${dbTbl.QuotationdtlTable} WHERE estimateid=${quotResponse.data.estimateid} AND prodid=${prodid}`
              ).then((data) => {
                if (data[0] == undefined) {
                  return null;
                } else {
                  return data[0].estimateitmid;
                }
              })
            : null,
        type: "TAXES",
        cgst: pos == origin ? +(tax / 2).toFixed(2) : null,
        sgst: pos == origin ? +(tax / 2).toFixed(2) : null,
        igst: pos == origin ? null : +tax.toFixed(2),
        duedate: dueDate,
      });
      //Sales Tax details
      soTaxes.push({
        tenantid: tenantId,
        branchid: branchid,
        finyear: "01-Apr-2023 - 31-Mar-2024",
        type: "TAXES",
        taxgrpid: taxgrpid,
        taxid: taxid,
        taxpercent: +SalesTax * 100,
        taxvalue: tax.toFixed(2),
        cgst: pos == origin ? +(tax / 2).toFixed(2) : null,
        sgst: pos == origin ? +(tax / 2).toFixed(2) : null,
        igst: pos == origin ? null : +tax.toFixed(2),
        isactive: "Y",
        taxcode: taxcode,
      });
    }
    //Calculating total value of product
    const productValue = prodTotal.reduce(
      (previous, current) => previous + current,
      0
    );
    //Calculating total tax value of product
    const taxValue = taxTotal.reduce(
      (previous, current) => previous + current,
      0
    );
    return {
      finyear: finyear,
      branchid: branchid,
      tenantid: tenantId,
      sodt: new Date().toISOString().slice(0, 10),
      sotype: "goods",
      soclassification: "general",
      sostatus: 22,
      reference: "PO/NO/01",
      referencedt: quotResponse != null ? quotResponse.data.estimatedt : null,
      paymenttermid: 2285,
      pos: pos,
      billingaddress: billingaddress
        ? billingaddress
        : billing
        ? billing
        : "COIMBATORE",
      shipingaddress: shipingaddress
        ? shipingaddress
        : shipping
        ? shipping
        : "COIMBATORE",
      duedate: dueDate,
      ccyid: 82,
      subtotal: +(+productValue).toFixed(2),
      discntprcnt: 0,
      roundoff: +(
        Math.round(productValue + taxValue) -
        (productValue + taxValue)
      ).toFixed(2),
      discntvalue: 0,
      shipingprcnt: 0,
      shipingvalue: 0,
      taxtotal: +(+taxValue).toFixed(2),
      sototal: +(+productValue + +taxValue).toFixed(2),
      status: "Active",
      lastupdatedby: (await this.Username()).username,
      contactid: contactid,
      gstno: gstno,
      revchargeyn: "N",
      source: "WEB",
      remarks: "",
      tnc: "",
      sochannel: "Business",
      salesdetails: soDetails,
      otherdetails: [],
      sotaxes: soTaxes,
      sequenceref: "SALES_ORD_NO",
      estimateno: quotResponse != null ? quotResponse.data.estimateno : null,
      assignedto: assignedto,
      pymtmethod: "Cash",
      createdby: (await this.Username()).username,
      history: [
        {
          reftype: "sl_so",
          createduserid: (await this.Username()).userid,
          tenantid: tenantId,
          branchid: branchid,
          finyear: finyear,
          description: "Sales - Order created",
          actiontype: "CREATED",
          status: "Active",
          createdby: (await this.Username()).username,
          createddt: new Date().toISOString(),
          groupby: 1682068162732,
        },
      ],
    };
  };
}

export const reqBody = new requestBody();
