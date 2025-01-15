import React, { useEffect, useState } from "react";
import OpenWithIcon from "@mui/icons-material/OpenWith";
import imageCompression from "browser-image-compression";
import { Toaster, toast } from "sonner";
import {
  deleteObject,
  getDownloadURL,
  ref as storageRef,
  uploadBytes,
} from "@firebase/storage";
import { storage } from "@/db/firebase";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";

const CreateGallery = () => {
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [isPublished, setIsPublished] = useState(false);
  const [picturesToShow, setPicturesToShow] = useState<File[]>([]);
  const [urls, setUrls] = useState<string[]>([]);
  const [id, setId] = useState<string | null>(null);
  const [pictures, setPictures] = useState<File[]>([]);
  const [overlayIndex, setOverlayIndex] = useState<number | null>(null);
  const [selectedImages, setSelectedImages] = useState<number[]>([]);
  const [password, setPassword] = useState("");
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "loading") return;
    
    if (!session) {
      router.push('/login')
    }
  }, [session, status, router])

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      toast.loading("Képek betöltése...");
      const filesArray = Array.from(event.target.files);

      const compressedFiles = await Promise.all(
        filesArray.map((file) =>
          imageCompression(file, { maxSizeMB: 2, maxWidthOrHeight: 1920 })
        )
      );

      setPictures((prev) => [...prev, ...filesArray]);
      setPicturesToShow((prev) => [...prev, ...compressedFiles]);
      toast.dismiss();
      toast.success("Képek sikeresen feltöltve");
    }
  };

  const handleDelete = (index: number) => {
    const confirmDelete = window.confirm("Biztosan törölni szeretnéd a képet?");
    if (!confirmDelete) return;
    setPicturesToShow((prev) => prev.filter((_, i) => i !== index));
    setPictures((prev) => prev.filter((_, i) => i !== index));
    toast.success("Kép törölve");
    if (overlayIndex === index) {
      setOverlayIndex(null);
      toast.success("Kép törölve");
    }
  };

  const handleOverlayClose = () => {
    setOverlayIndex(null);
  };

  const selectedPicturesDelete = () => {
    const confirmDelete = window.confirm(
      "Biztosan törölni szeretnéd a kijelölt képeket?"
    );
    if (!confirmDelete) return;

    setPicturesToShow((prev) =>
      prev.filter((_, index) => !selectedImages.includes(index))
    );
    setPictures((prev) =>
      prev.filter((_, index) => !selectedImages.includes(index))
    );

    // Clear selected images
    setSelectedImages([]);
    toast.success("Kijelölt képek törölve");

    // Close overlay if the currently viewed image is in the selectedImages
    if (overlayIndex !== null && selectedImages.includes(overlayIndex)) {
      setOverlayIndex(null);
    }
  };

  useEffect(() => {
    if (urls.length === pictures.length && urls.length > 0) {
      handleSaveToDB();
    }
  }, [urls]);

  const handleSave = async () => {
    toast.loading("Galéria mentése folyamatban...");
  
    try {
      // Upload all pictures and wait for the upload to complete
      const uploadedUrls = await Promise.all(
        pictures.map((pic) => uploadFile(pic))
      );

      if (uploadedUrls.some((url) => url === null)) {
        toast.error("Hiba történt a képek feltöltése során");
        return;
      }
    } catch (error) {
      toast.error("Ismeretlen hiba történt");
    } finally {
      toast.dismiss();
      toast.success("Galéria mentve");
    }
  };  

  const handleSaveToDB = async () => {
    toast.loading("Galéria mentése folyamatban...");
  
    try {
      // Call the API to save the gallery
      const response = await fetch("/api/mainPage/gallery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, date, images: urls, password }),
      });
  
      const data = await response.json();
      if (response.ok) {
        toast.success(data.message);
        setId(data.id);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Ismeretlen hiba történt");
    } finally {
      toast.dismiss();
      toast.success("Galéria mentve");
    }
  };  

  const uploadFile = (image: File | null, index?: any) => {
    if (!image) {
      toast.error("Nem választottál képet!");
      return;
    }

    const imageRef = storageRef(
      storage,
      `${name}/${Date.now()}-${image.name}`
    );

    toast.loading("Kép feltöltése folyamatban...");

    // Upload image to storage
    uploadBytes(imageRef, image)
      .then((snapshot) => {
        getDownloadURL(snapshot.ref)
          .then((url: string) => {
            // Update the corresponding section with the new image URL
            console.log("successfully uploaded image");
            setUrls((prev) => [...prev, url]);
          })
          .catch((error: unknown) => {
            if (error instanceof Error) {
              toast.error(error.message);
            } else {
              toast.error("Ismeretlen hiba történt.");
            }
          });
      })
      .catch((error: unknown) => {
        if (error instanceof Error) {
          toast.error(error.message);
        } else {
          toast.error("Ismeretlen hiba történt.");
        }
      })
      .finally(() => {
        toast.dismiss();
      });
  };

  const handlePublish = async () => {
    try {

      if (!isPublished) {

        
        const response = await fetch("/api/mainPage/gallery", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, type: "publish" }),
        });
        
        const data = await response.json();
        if (response.ok) {
          toast.success(data.message);
          setIsPublished(true);
        } else {
          toast.error(data.message);
        }
      } else {
        const response = await fetch("/api/mainPage/gallery", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, type: "unpublish" }),
        });
        
        const data = await response.json();
        if (response.ok) {
          toast.success(data.message);
          setIsPublished(false);
        } else {
          toast.error(data.message);
        }
      }
    } catch (error) {
      toast.error("Ismeretlen hiba történt");
    }
  }

  return (
    <div className="w-full h-screen overflow-y-auto pt-5 pb-10 flex flex-col items-center justify-start bg-gray-100">
      <Toaster />
      <div className="w-full relative flex flex-col items-center justify-center max-w-screen-xl pr-4">
        <button
          onClick={handleSave}
          className="bg-green-500 absolute top-0 right-60 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-all"
        >
          Mentés
        </button>
        <button 
        onClick={handlePublish}
        className="bg-green-500 absolute top-0 right-5 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-all">
          {!isPublished ? "Publikálás" : "Publikálás visszavonása"}
        </button>
        <h1 className="text-black mb-10 font-black text-2xl">
          Galéria hozzáadása
        </h1>
      </div>

      {/* Form Design */}
      <div className="w-full max-w-screen-lg flex flex-col gap-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1">
            <label
              htmlFor="name"
              className="block text-gray-700 font-medium mb-2"
            >
              Név:
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border text-black border-gray-300 rounded-lg p-2 focus:outline-none focus:ring focus:ring-green-300"
              placeholder="Galéria neve"
            />
          </div>

          <div className="flex-1">
            <label
              htmlFor="date"
              className="block text-gray-700 font-medium mb-2"
            >
              Dátum:
            </label>
            <input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full border text-black border-gray-300 rounded-lg p-2 focus:outline-none focus:ring focus:ring-green-300"
            />
          </div>
        </div>
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1">
            <label
              htmlFor="name"
              className="block text-gray-700 font-medium mb-2"
            >
              Jelszó:
            </label>
            <input
              id="name"
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border text-black border-gray-300 rounded-lg p-2 focus:outline-none focus:ring focus:ring-green-300"
              placeholder="Jelszó"
            />
          </div>
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-2">
            Képek feltöltése:
          </label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleUpload}
            className="hidden"
            id="upload-input"
          />
          <div className="flex flex-row justify-start items-center gap-3">
            <button
              onClick={() => document.getElementById("upload-input")?.click()}
              className="bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-all"
            >
              Képek feltöltése
            </button>
            <p
              className={`text-gray-600 ${
                pictures.length > 0 ? "block" : "hidden"
              }`}
            >
              {pictures.length} db kép kiválasztva
            </p>
          </div>
          {selectedImages.length > 0 && (
            <button
              onClick={selectedPicturesDelete}
              className="bg-red-500 mt-3 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition-all"
            >
              Kijelölt képek törlése
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
          {picturesToShow.map((pic, index) => (
            <div key={index} className="relative group">
              <div className="hidden rounded-lg group-hover:bg-black group-hover:bg-opacity-50 absolute top-0 left-0 w-full h-full group-hover:flex group-hover:justify-center group-hover:items-center">
                <OpenWithIcon
                  onClick={() => setOverlayIndex(index)}
                  className="cursor-pointer"
                />
              </div>
              <img
                src={URL.createObjectURL(pic)}
                alt={`uploaded-${index}`}
                loading="lazy"
                className={`w-full h-40 ${
                  selectedImages.includes(index) && "border-2 border-red-600"
                } object-cover rounded-lg shadow-md cursor-pointer`}
              />
              <button
                onClick={() => handleDelete(index)}
                className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                X
              </button>
              <div
                className={`absolute top-1 left-1 text-white rounded-full w-6 h-6 flex items-center justify-center ${
                  selectedImages.includes(index) ? "opacity-100" : "opacity-0"
                } group-hover:opacity-100 transition-opacity`}
              >
                <div
                  className="w-4 h-4 bg-white rounded-md cursor-pointer flex flex-col items-center justify-center"
                  onClick={() => {
                    if (selectedImages.includes(index)) {
                      setSelectedImages((prev) =>
                        prev.filter((i) => i !== index)
                      );
                    } else {
                      setSelectedImages((prev) => [...prev, index]);
                    }
                  }}
                >
                  <div
                    className={`w-2 h-2 bg-black rounded-md ${
                      selectedImages.includes(index)
                        ? "opacity-100"
                        : "opacity-0"
                    } transition-all duration-300`}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Overlay */}
      {overlayIndex !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="relative">
            <img
              src={URL.createObjectURL(picturesToShow[overlayIndex])}
              alt={`overlay-${overlayIndex}`}
              className="max-w-full max-h-[90vh] rounded-lg shadow-lg"
            />
            <button
              onClick={() => handleDelete(overlayIndex)}
              className="absolute bottom-2 w-fit h-fit py-2 px-4 left-1/2 transform -translate-x-1/2 bg-red-600 text-white rounded-full flex items-center justify-center"
            >
              Kép törlése
            </button>
          </div>
          <button
            onClick={handleOverlayClose}
            className="absolute top-5 right-5 text-white text-2xl font-bold"
          >
            &times;
          </button>
        </div>
      )}
    </div>
  );
};

export default CreateGallery;
