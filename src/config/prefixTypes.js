const PREFIX_TYPES = {
  types: [
    "Bill",
    "Voucher",
    "Employee",
    "Customer",
    "Supplier",
    "User",
    "JobType",
    "EmployeeSalary",
    "Mobilization",
    "PaymentCertification",
    "JobCard",
    "DynamicDocument",
    "MobDeliverySeries",
    "ManpowerEmployee",
    "Product",
    "ProjectTemplate",
    "Designation",
    "Activity",
    "IncidentInvestigation",
    "Costing",
    "PriceList",
  ],

  typeFields: {
    Bill: {
      fields: [
        {
          name: "bill_type",
          label: "Bill Type",
          type: "dropdown",
          options: [
            "BarCode",
            "Delivery Note",
            "Opening Stock",
            "Proforma Invoice",
            "Purchase Invoice",
            "Purchase Order",
            "Purchase Return",
            "PurchaseGoodsReceipt",
            "RequestForm",
            "RFQ",
            "Sales Estimation",
            "Sales Invoice",
            "Sales Order",
            "Sales Quotation",
            "Sales Return",
            "Stock Entry",
            "Stock Transfer",
            "Wastage Management",
          ],
        },
        {
          name: "select_mode",
          label: "Select Mode",
          type: "dropdown",
          options: ["Air", "Ocean", "Rail", "Road"],
        },
        {
          name: "select_service",
          label: "Select Service",
          type: "dropdown",
          options: ["Import", "Export", "Domestic"],
        },
      ],
    },

    Voucher: {
      fields: [
        {
          name: "voucher_type",
          label: "Voucher Type",
          type: "dropdown",
          options: [
            "Contra",
            "Debit Note",
            "Credit Note",
            "Journal",
            "Manpower Salary",
            "Payment",
            "Receipt",
          ],
        },
      ],
    },
  },
};

export default PREFIX_TYPES;
