import { connectToDatabase } from "@/db/mongoDB";
import { NextApiRequest, NextApiResponse } from "next";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { method } = req;

  const client = await connectToDatabase();

  if (!client) {
    res.status(500).json({ message: "Unable to connect to database" });
    return; // Ensure the function exits after sending the response
  }

  const db = client.db();

  try {
    if (method === "GET") {
      const actions = await db.collection("actions").find().toArray();
      res.status(200).json({ actions }); // Send response
    } else if (method === "POST") {
      const { actions } = req.body;

      if (!Array.isArray(actions)) {
        res.status(400).json({ message: "Invalid data format. 'actions' should be an array." });
        return;
      }

      if (actions.length === 0) {
        await db.collection("actions").deleteMany({});
        res.status(200).json({ message: "Actions saved successfully" }); // Send response
        return;
      }

      await db.collection("actions").deleteMany({});
      await db.collection("actions").insertMany(actions);
      res.status(200).json({ message: "Actions saved successfully" }); // Send response
    } else {
      res.setHeader("Allow", ["GET", "POST"]);
      res.status(405).json({ message: `Method ${method} Not Allowed` }); // Send response for unsupported methods
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Internal Server Error" }); // Handle errors
  } finally {
    await client.close(); // Ensure the database connection is closed
  }
};

export default handler;
