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
      const faq = await db.collection("faq").find().toArray();
      return res.status(200).json({ faq });
    } catch (error) {
      return res.status(500).json({ message: "Failed to fetch FAQs" });
    } finally {
      await client.close();
    }
  } else if (method === "POST") {
    try {
      const { faq } = req.body;

      // Here the faq is an array of objects which maybe already exists in the database
      // So you need to update the whole faq

      if (faq.length === 0) {
        await db.collection("faq").deleteMany({});
        return res.status(200).json({ message: "FAQs saved successfully" });
      }

      await db.collection("faq").deleteMany({});
      await db.collection("faq").insertMany(faq);
      return res.status(200).json({ message: "FAQs saved successfully" });
    } catch (error) {
      return res.status(500).json({ message: "Failed to save FAQs" });
    } finally {
      await client.close();
    }
  }
};

export default handler;
