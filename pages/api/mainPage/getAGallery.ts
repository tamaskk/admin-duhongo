import { connectToDatabase } from "@/db/mongoDB";
import { NextApiRequest, NextApiResponse } from "next";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {

    const client = await connectToDatabase();

    if (!client) {
        return res.status(500).json({ message: "Internal server error" });
    }

    const db = client.db();

    const galleryCollection = db.collection("gallery");

    if (req.method === "GET") {
        try {
            const gallery = await galleryCollection.find().toArray();
            return res.status(200).json({ gallery });
        } catch (error) {
            return res.status(500).json({ message: "Failed to fetch gallery" });
        } finally {
            await client.close();
        }
    } else {
        return res.status(405).json({ message: "Method not allowed" });
    }
    };

export default handler;