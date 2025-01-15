import { connectToDatabase } from "@/db/mongoDB";
import { NextApiRequest, NextApiResponse } from "next";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    const { method } = req;

    const client = await connectToDatabase();

    if (!client) {
        return res.status(500).json({ message: "Internal server error" });
    }

    const db = client.db();

    const sectionsCollection = db.collection("sections");

    if (method === "GET") {

        try {
            const sections = await sectionsCollection.find().toArray();
            return res.status(200).json({ sections });
        } catch (error) {
            return res.status(500).json({ message: "Failed to fetch sections" });
        } finally {
            await client.close();
        }

    } else if (method === "POST") {
        try {
            const { sections } = req.body;

            await sectionsCollection.deleteMany({});
            await sectionsCollection.insertMany(sections);
            return res.status(200).json({ message: "Sections saved successfully" });
        } catch (error) {
            return res.status(500).json({ message: "Failed to save sections" });
        } finally {
            await client.close();
        }
    }
};

export default handler;