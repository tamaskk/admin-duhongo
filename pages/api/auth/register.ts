import { connectToDatabase } from "@/db/mongoDB";
import { NextApiRequest, NextApiResponse } from "next";
import brycpt from 'bcryptjs';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {

    const client = await connectToDatabase();

    if (!client) {
        return res.status(500).json({ message: "Internal server error" });
    }

    const db = client.db();

    const userCollection = db.collection("users");

    if (req.method === "POST") {
        const { userName, password } = req.body;

        if (!userName || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        try {

            const hashedPassword = await brycpt.hash(password, 10);

            const add = await userCollection.insertOne({
                userName,
                password: hashedPassword,
            })

            if (!add) {
                return res.status(400).json({ message: "Failed to create user" });
            }

            return res.status(200).json({ message: "User created successfully" });

        } catch (error) {
            return res.status(500).json({ message: "Failed to create user" });
        } finally {
            await client.close();
        };
    }
    
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });

};

export default handler;