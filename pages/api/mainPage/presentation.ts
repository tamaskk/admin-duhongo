import { connectToDatabase } from "@/db/mongoDB";
import { NextApiRequest, NextApiResponse } from "next";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { method } = req;

  const client = await connectToDatabase();

  if (!client) {
    return res.status(500).json({ message: "Unable to connect to database" });
  }

  const db = client.db();

  if (method === "GET") {
    try {
      const presentation = await db.collection("presentation").find().toArray();
      return res.status(200).json({ presentation });
    } catch (error) {
      return res.status(500).json({ message: "Failed to fetch presentations" });
    } finally {
      await client.close();
    }
  } else if (method === "POST") {
    try {
      const { presentation } = req.body;

      if (!presentation) {
        await db.collection("presentation").deleteMany({});
        return res.status(200).json({ message: "presentations saved successfully" });
      }

      await db.collection("presentation").deleteMany({});
      await db.collection("presentation").insertMany(presentation);
      return res.status(200).json({ message: "presentations saved successfully" });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    } finally {
      await client.close();
    }
  }
};

export default handler;
