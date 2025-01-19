const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

//connect database
const MONGO_URL = "mongodb://127.0.0.1:27017/FinalDemo";

main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(MONGO_URL);
}

//reinitialize database
const initDB = async () => {
  await Listing.deleteMany({});
  let ownerId = '66b1809fadec1de40bd38fd6'; //initial owner
  initData.data = initData.data.map((obj)=>({...obj, owner: ownerId }));
  await Listing.insertMany(initData.data); 
  //initData is object returned by data.js, 
  //out data is value of data key in that object

  console.log(" Data was Initialized")
};

initDB();
