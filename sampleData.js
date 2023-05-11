const builds = [
  {
    id: "645cf018e09e6ca5eb071e64",
    name: "test keeb build",
    description: "a keyboard that is a keyboard test",
    originalBuilder: "Bob, the builder",
    partList: ["645cfe45e09e6ca5eb071e67", "645cfe45e09ea5a071e68"],
  },
  {
    id: "645cf6e8e09e6ca5eb071e66",
    name: "a keeb",
    description: "its a keeb",
    originalBuilder: "Steve",
    partList: ["645cfe45e09e6ca5eb071e67", "645cfe45e09ea5a071e68"],
  },
];

const userParts = [
  {
    id: "645cfe45e09e6ca5eb071e67" ,
    name: "some part on a keyboard",
    partId: "",
    buildIds: ["645cf018e09e6ca5eb071e64", "645cf6e8e09e6ca5eb071e66"],
    datePurchased: "2020-05-18T14:10:30Z",
    purchasedPrice: "12.00",
    pruchasedFrom: "Drop",
  },
  {
    id: "645cfe45e09ea5a071e68" ,
    partId: "",
    buildIds: ["645cf018e09e6ca5eb071e64"],
    name: "some part on a keyboard",
    datePurchased: "2020-05-18T14:10:30Z",
    purchasedPrice: "12.00",
    pruchasedFrom: "Drop",
  },
];


module.exports= { builds, userParts}