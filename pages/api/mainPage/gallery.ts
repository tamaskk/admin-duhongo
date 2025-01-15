import { connectToDatabase } from "@/db/mongoDB";
import { ObjectId } from "mongodb";
import { NextApiRequest, NextApiResponse } from "next";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {

    const client = await connectToDatabase();

    if (!client) {
        return res.status(500).json({ message: "Internal server error" });
    }

    const db = client.db();

    const galleryCollection = db.collection("gallery");

    if (req.method === "GET") {
        const { id } = req.query;
        if (id) {

            try {
                console.log('Bejött ide')
                const objectId = new ObjectId(id as string);
                
                const gallery = await galleryCollection.findOne({ _id: objectId });

                if (!gallery) {
                    return res.status(404).json({ message: "Gallery not found" });
                }

                return res.status(200).json({ gallery });
            } catch (error) {
                return res.status(500).json({ message: "Failed to fetch gallery" });
            } finally {
                await client.close();
            }
        } else {

            try {
                const gallery = await galleryCollection.find().toArray();
                return res.status(200).json({ gallery });
            } catch (error) {
                return res.status(500).json({ message: "Failed to fetch gallery" });
            } finally {
                await client.close();
            }
        }
    } else if (req.method === "POST") {
        const { images, name, date, password } = req.body;

        if (!images || !name || !date) {
            return res.status(400).json({ message: "Gallery is required" });
        }

        try {

            const findExistingGallery = await galleryCollection.findOne({
                name,
                date,
            })

            if (findExistingGallery) {
                return res.status(400).json({ message: "Gallery already exists" });
            }

            const insertedOne = await galleryCollection.insertOne({
                images,
                name,
                date,
                isPublished: false,
                password,
            });
            return res.status(200).json({ message: "Gallery saved successfully", id: insertedOne.insertedId  });
        } catch (error) {
            return res.status(500).json({ message: "Failed to save gallery" });
        } finally {
            await client.close();
        }
    } else if (req.method === "PATCH") {
        const { id, images, type, name, date, password } = req.body;
    
        if (!id || !type) {
            return res.status(400).json({ message: "ID and type are required" });
        }
    
        const objectId = new ObjectId(id);
    
        try {
            if (type === "publish") {
                await galleryCollection.updateOne(
                    { _id: objectId },
                    { $set: { isPublished: true } }
                );
                return res.status(200).json({ message: "Gallery published successfully" });
            } else if (type === "unpublish") {
                await galleryCollection.updateOne(
                    { _id: objectId },
                    { $set: { isPublished: false } }
                );
                return res.status(200).json({ message: "Gallery unpublished successfully" });
            } else if (type === "update") {
                if (!images || !name || !date) {
                    return res.status(400).json({ message: "Images, name, and date are required for update" });
                }
                await galleryCollection.updateOne(
                    { _id: objectId },
                    { $set: { images, name, date, password } }
                );
                return res.status(200).json({ message: "Gallery updated successfully" });
            } else if (type === "deleteOne") {
                if (!images) {
                    return res.status(400).json({ message: "Image to delete is required" });
                }
    
                const galleryOne = await galleryCollection.findOne({ _id: objectId });
                if (!galleryOne) {
                    return res.status(404).json({ message: "Gallery not found" });
                }
    
                // Remove the matching image from the gallery's images array
                const updatedImages = galleryOne.images.filter((image: string) => image !== images);
    
                // Update the gallery in the database
                await galleryCollection.updateOne(
                    { _id: objectId },
                    { $set: { images: updatedImages } }
                );
    
                return res.status(200).json({ message: "Image deleted successfully" });
            } else {
                return res.status(400).json({ message: "Invalid type" });
            }
        } catch (error: any) {
            console.error(error);
            return res.status(500).json({ message: "An error occurred", error: error.message });
        } finally {
            await client.close();
        }
    }
     else if (req.method === "DELETE") {
        const { id } = req.body;

        if (!id) {
            return res.status(400).json({ message: "ID is required" });
        }

        try {
            const objectId = new ObjectId(id);
            await galleryCollection.deleteOne({ _id: objectId });
            return res.status(200).json({ message: "Gallery deleted successfully" });
        } catch (error) {
            return res.status(500).json({ message: "Failed to delete gallery" });
        } finally {
            await client.close();
        }
    } else {
        res.status(405).json({ message: "Method not allowed" });
    }
};

export default handler;