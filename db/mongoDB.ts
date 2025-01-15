import { MongoClient } from "mongodb";

export const connectToDatabase = async () => {
    const client = await MongoClient.connect(
      `mongodb+srv://aduhongotata:7w87KiXI1Tjmakcl@main.uowfi.mongodb.net/?retryWrites=true&w=majority&appName=main`
    );
    return client;
  };