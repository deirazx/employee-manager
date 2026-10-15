import mongoose from "mongoose";
import "dotenv/config";

export const ConnectDb = async (params) => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Db Connected Successfully!!")
    } catch (error) {
        console.log("Db Connection failed!!");
    }
}