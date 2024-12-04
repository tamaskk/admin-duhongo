import { MongoClient } from "mongodb";

export const connectToDatabase = async () => {
    const client = await MongoClient.connect(
      `mongodb+srv://kalmantamaskrisztian:7l0dis4kpvZA00YO@test.sdvm5.mongodb.net/?retryWrites=true&w=majority&appName=test`,
    );
    return client;
  };