import React, { useEffect, useRef, useState } from "react";
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
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";

const EditGallery = () => {
  const router = useRouter();
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [isPublished, setIsPublished] = useState(false);
  const [picturesToShow, setPicturesToShow] = useState<File[]>([]);
  const [urls, setUrls] = useState<string[]>([]);
  const [overlayIndex, setOverlayIndex] = useState<number | null>(null);
  const [overlayForPrevImages, setOverlayForPrevImages] = useState<
    number | null
  >(null);
  const [selectedImages, setSelectedImages] = useState<
    { prev: boolean; index: number }[]
  >([]);
  const [password, setPassword] = useState("");
  const isChanged = useRef(false);
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
      setPicturesToShow((prev) => [...prev, ...compressedFiles]);
      toast.dismiss();
      toast.success("Képek sikeresen feltöltve");
      isChanged.current = true;
    }
  };

  const uploadFile = async (image: File) => {
    const imageRef = storageRef(
      storage,
      `${name.replace(/ /g, "-").toLowerCase()}/${Math.random()}-${image.name}`
    );

    try {
      const snapshot = await uploadBytes(imageRef, image);
      const url = await getDownloadURL(snapshot.ref);
      setPicturesToShow((prev) =>
        prev.filter((pic) => pic.name !== image.name)
      );
      setUrls((prev) => [...prev, url]);
    } catch (error) {
      toast.error("Kép feltöltése sikertelen.");
    }
  };

  useEffect(() => {
    if (router.query.id) {
      getAGallery();
    }
    console.log(router.query.id);
  }, [router.query.id]);

  const getAGallery = async () => {
    try {
      const response = await fetch(
        `/api/mainPage/gallery?id=${router.query.id}`
      );
      const data = await response.json();
      if (response.ok) {
        console.log(data);
        setUrls(data.gallery.images);
        setName(data.gallery.name);
        setDate(data.gallery.date);
        setIsPublished(data.gallery.isPublished);
        setPassword(data.gallery.password);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Ismeretlen hiba történt");
    }
  };

  const handleDelete = (index: number, isPrevImages: boolean) => {
    const confirmDelete = window.confirm("Biztosan törölni szeretnéd a képet?");
    if (!confirmDelete) return;

    if (isPrevImages) {
      deleteFile(urls[index]);
      setUrls((prev) => prev.filter((_, i) => i !== index));
      toast.success("Kép törölve");
      if (overlayForPrevImages === index) {
        setOverlayForPrevImages(null);
        toast.success("Kép törölve");
      }
    } else {
      setPicturesToShow((prev) => prev.filter((_, i) => i !== index));
      toast.success("Kép törölve");
      if (overlayIndex === index) {
        setOverlayIndex(null);
        toast.success("Kép törölve");
      }
    }
    isChanged.current = true;
  };

  const handleOverlayClose = () => {
    setOverlayIndex(null);
    setOverlayForPrevImages(null);
  };

  const selectedPicturesDelete = () => {
    const confirmDelete = window.confirm(
      "Biztosan törölni szeretnéd a kijelölt képeket?"
    );
    if (!confirmDelete) return;

    const prevImages = selectedImages
      .filter((img) => img.prev)
      .map((img) => img.index);

    const newImages = selectedImages
      .filter((img) => !img.prev)
      .map((img) => img.index);

    // Loop through the selected images and delete them

    prevImages.forEach((index) => {
      deleteFile(urls[index]);
    });

    const newUrls = urls.filter((_, i) => !prevImages.includes(i));

    setUrls(newUrls);

    const newPictures = picturesToShow.filter((_, i) => !newImages.includes(i));

    setPicturesToShow(newPictures);

    // Clear selected images
    setSelectedImages([]);
    toast.success("Kijelölt képek törölve");

    // Close overlay if the currently viewed image is in the selectedImages
    if (
      overlayIndex !== null &&
      selectedImages.map((img) => img.index).includes(overlayIndex)
    ) {
      setOverlayIndex(null);
    }
    isChanged.current = true;
  };

  useEffect(() => {
    console.log(picturesToShow.length);
    if (picturesToShow.length === 0 && isChanged.current === true) {
      handleSaveToDB();
    }
  }, [picturesToShow]);

  const handleSave = async () => {
    toast.loading("Galéria mentése folyamatban...");
    if (isChanged.current && picturesToShow.length > 0) {
    await Promise.all(picturesToShow.map((pic) => uploadFile(pic)));
    } else {
      handleSaveToDB();
    }
      // Save gallery to database
    // Save gallery name, date, and urls to database
  };

  const handleSaveToDB = async () => {
    try {
      const response = await fetch("/api/mainPage/gallery", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "update",
          id: router.query.id as string,
          name,
          date,
          images: urls,
          password,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        toast.success(data.message);
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

  const publishGallery = async () => {
    if (isPublished) {
      toast.loading("Galéria publikálásának visszavonása folyamatban...");
    } else {
      toast.loading("Galéria publikálása folyamatban...");
    }
    try {
      if (!isPublished) {
        const response = await fetch("/api/mainPage/gallery", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "publish",
            id: router.query.id as string,
            isPublished: !isPublished,
          }),
        });
        const data = await response.json();
        if (response.ok) {
          toast.success(data.message);
          setIsPublished(!isPublished);
        } else {
          toast.error(data.message);
        }
      } else {
        const response = await fetch("/api/mainPage/gallery", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "unpublish",
            id: router.query.id as string,
            isPublished: !isPublished,
          }),
        });
        const data = await response.json();
        if (response.ok) {
          toast.success(data.message);
          setIsPublished(!isPublished);
        } else {
          toast.error(data.message);
        }
      }
    } catch (error) {
      toast.error("Ismeretlen hiba történt");
    } finally {
      toast.dismiss();
      if (isPublished) {
        toast.success("Galéria publikálása visszavonva");
      } else {
        toast.success("Galéria publikálva");
      }
    }
  };

  const deleteFile = (imageUrl: string) => {
    if (!imageUrl) {
      toast.error("Nem található a fájl.");
      return;
    }
  
    // Extract the file path from the URL
    const basePath = imageUrl.split("?")[0].split("/o/")[1]; // Gets the path after '/o/'
    const decodedPath = decodeURIComponent(basePath); // Decode URL-encoded path
    const fileRef = storageRef(storage, decodedPath);
  
    toast.loading("Fájl törlése folyamatban...");
  
    deleteObject(fileRef)
      .then(() => {
        toast.success("Fájl sikeresen törölve!");
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
          onClick={publishGallery}
          className="bg-green-500 absolute top-0 right-5 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-all"
        >
          {!isPublished ? "Publikálás" : "Publikálás visszavonása"}
        </button>
        <h1 className="text-black mb-10 font-black text-2xl">
          Galéria Szerkeztése
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
              onChange={(e) => {
                setName(e.target.value);
                isChanged.current = true;
              }}
              className="w-full text-black border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring focus:ring-green-300"
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
              onChange={(e) => {
                setDate(e.target.value);
                isChanged.current = true;
              }}
              className="w-full border text-black border-gray-300 rounded-lg p-2 focus:outline-none focus:ring focus:ring-green-300"
            />
          </div>
        </div>
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1">
            <label
              htmlFor="date"
              className="block text-gray-700 font-medium mb-2"
            >
              Jelszó:
            </label>
            <input
              id="date"
              type="text"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                isChanged.current = true;
              }}
              className="w-full border text-black border-gray-300 rounded-lg p-2 focus:outline-none focus:ring focus:ring-green-300"
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
                picturesToShow.length > 0 ? "block" : "hidden"
              }`}
            >
              {picturesToShow.length} db kép kiválasztva
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
          {urls &&
            urls?.map((pic, index) => (
              <div key={index} className="relative group">
                <div className="hidden rounded-lg group-hover:bg-black group-hover:bg-opacity-50 absolute top-0 left-0 w-full h-full group-hover:flex group-hover:justify-center group-hover:items-center">
                  <OpenWithIcon
                    onClick={() => setOverlayForPrevImages(index)}
                    className="cursor-pointer"
                  />
                </div>
                <img
                  src={pic}
                  alt={`uploaded-${index}`}
                  loading="lazy"
                  className={`w-full h-40 ${
                    selectedImages.map((img) => img.index).includes(index) &&
                    "border-2 border-red-600"
                  } object-cover rounded-lg shadow-md cursor-pointer`}
                />
                <button
                  onClick={() => handleDelete(index, true)}
                  className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  X
                </button>
                <div
                  className={`absolute top-1 left-1 text-white rounded-full w-6 h-6 flex items-center justify-center ${
                    selectedImages.map((img) => img.index).includes(index)
                      ? "opacity-100"
                      : "opacity-0"
                  } group-hover:opacity-100 transition-opacity`}
                >
                  <div
                    className="w-4 h-4 bg-white rounded-md cursor-pointer flex flex-col items-center justify-center"
                    onClick={() => {
                      if (
                        selectedImages.map((img) => img.index).includes(index)
                      ) {
                        setSelectedImages((prev) =>
                          prev.filter((i) => i.index !== index)
                        );
                      } else {
                        setSelectedImages((prev) => [
                          ...prev,
                          {
                            prev: true,
                            index: index,
                          },
                        ]);
                      }
                    }}
                  >
                    <div
                      className={`w-2 h-2 bg-black rounded-md ${
                        selectedImages.map((img) => img.index).includes(index)
                          ? "opacity-100"
                          : "opacity-0"
                      } transition-all duration-300`}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          {picturesToShow &&
            picturesToShow?.map((pic, index) => (
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
                    selectedImages.map((img) => img.index).includes(index) &&
                    "border-2 border-red-600"
                  } object-cover rounded-lg shadow-md cursor-pointer`}
                />
                <button
                  onClick={() => handleDelete(index, false)}
                  className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  X
                </button>
                <div
                  className={`absolute top-1 left-1 text-white rounded-full w-6 h-6 flex items-center justify-center ${
                    selectedImages.map((img) => img.index).includes(index)
                      ? "opacity-100"
                      : "opacity-0"
                  } group-hover:opacity-100 transition-opacity`}
                >
                  <div
                    className="w-4 h-4 bg-white rounded-md cursor-pointer flex flex-col items-center justify-center"
                    onClick={() => {
                      if (
                        selectedImages.map((img) => img.index).includes(index)
                      ) {
                        setSelectedImages((prev) =>
                          prev.filter((i) => i.index !== index)
                        );
                      } else {
                        setSelectedImages((prev) => [
                          ...prev,
                          {
                            prev: false,
                            index: index,
                          },
                        ]);
                      }
                    }}
                  >
                    <div
                      className={`w-2 h-2 bg-black rounded-md ${
                        selectedImages.map((img) => img.index).includes(index)
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
              onClick={() => handleDelete(overlayIndex, false)}
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
      {overlayForPrevImages !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="relative">
            <img
              src={urls[overlayForPrevImages]}
              alt={`overlay-${overlayIndex}`}
              className="max-w-full max-h-[90vh] rounded-lg shadow-lg"
            />
            <button
              onClick={() => handleDelete(overlayForPrevImages, true)}
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

export default EditGallery;
