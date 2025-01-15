import { Skeleton } from '@mui/material';
import { useRouter } from 'next/router';
import React, { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner';
import {
  deleteObject,
  getDownloadURL,
  ref as storageRef,
  uploadBytes,
} from "@firebase/storage";
import { storage } from "@/db/firebase";
import { useSession } from 'next-auth/react';

const Gallery = () => {
    const [galleries, setGalleries] = useState<any>(null);
    const router = useRouter();
    const firstRender = useRef(true);
    const { data: session, status } = useSession();
  
    useEffect(() => {
      if (status === "loading") return;
      
      if (!session) {
        router.push('/login')
      }
    }, [session, status, router])
    const fetchGalleries = async () => {
        try {
            const res = await fetch("/api/mainPage/gallery");
            const { gallery } = await res.json();
            setGalleries(gallery);
            // setGalleries([
            //   {
            //     _id: "1",
            //     name: "Budapest",
            //     imageUrl: "https://plus.unsplash.com/premium_photo-1734293455122-c3a9a05b51e1?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            //     gameName: "GTA V",
            //     price: 50,
            //     isPublished: true
            //   }
            // ])
        } catch (error) {
            console.log(error);
        }
    }

    useEffect(() => {
        if (firstRender.current) {
            firstRender.current = false;
            return;
        }
        fetchGalleries();
    }, []);

    const deleteGallery = async (id: string) => {
      try {
          toast.loading("Törlés folyamatban...");
  
          const findGallery = galleries.find((gallery: any) => gallery._id === id);
  
          if (!findGallery) {
              toast.error("Nem található a galéria");
              return;
          }
  
          // Delete all images in the gallery
          const deleteImagePromises = findGallery.images.map((image: string) => deleteFile(image));
          await Promise.all(deleteImagePromises); // Wait for all image deletions to complete
  
          // Proceed to delete the gallery
          const res = await fetch("/api/mainPage/gallery", {
              method: "DELETE",
              headers: {
                  "Content-Type": "application/json",
              },
              body: JSON.stringify({ id }),
          });
  
          const data = await res.json();
          if (res.ok) {
              fetchGalleries();
              toast.success("Galéria törölve");
          } else {
              toast.error("Hiba történt a galéria törlése közben");
          }
      } catch (error) {
          toast.error("Hiba történt a galéria törlése közben");
      } finally {
          toast.dismiss();
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
        console.log("Fájl sikeresen törölve!");
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

    const editGallery = async (id: string) => {
        router.push(`/dashboard/gallery/${id}`);
    }

  return (
    <div className="w-full h-screen overflow-y-auto pt-5 pb-10 flex flex-col items-center justify-start bg-gray-100">
    <div className="w-full relative flex flex-col items-center justify-center max-w-screen-xl pr-4">
      <button
        onClick={() => router.push("/dashboard/gallery/create")}
        className="bg-green-500 absolute top-0 right-5 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-all duration-300"
      >
        Galéria hozzáadása
      </button>
      <h1 className="text-black mb-10 font-black text-2xl">Galéria</h1>
    </div>

    <div className="grid grid-cols-1 mt-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full px-4 max-w-screen-xl">
      {galleries !== null &&
        galleries?.map((city: any) => (
          <div
            key={city._id}
            className="flex flex-col items-center bg-white rounded-lg shadow-md overflow-hidden"
          >
            <div className="w-full h-48">
              {city.images && city.images[0] ? (
                <img
                  src={city.images[0]}
                  alt={city.name}
                  className="object-cover w-full h-full"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-200">
                  <h1 className="text-lg font-semibold text-gray-600">
                    Hiányzó kép
                  </h1>
                </div>
              )}
            </div>
            <div className="p-4 w-full text-center">
              <h1 className="text-xl font-bold text-gray-800">{city.name}</h1>
              <p className="text-gray-600">{city.gameName}</p>
              <p className="text-gray-800 font-semibold">{city.price} Ron</p>
              <p
                className={`mt-2 text-sm font-semibold ${
                  city.isPublished ? "text-green-600" : "text-red-600"
                }`}
              >
                {city.isPublished ? "Publikálva" : "Nincs publikálva"}
              </p>
              <div className="mt-4 flex flex-col gap-2">
                <button
                  onClick={() => editGallery(city._id)}
                  className="bg-yellow-500 text-white py-2 rounded-lg hover:bg-yellow-600 transition-all duration-300"
                >
                  Szerkesztés
                </button>
                <button
                  onClick={() =>
                    deleteGallery(city._id)
                  }
                  className="bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition-all duration-300"
                >
                  Törlés
                </button>
              </div>
            </div>
          </div>
        ))}
      {galleries === null && (
        <>
          <Skeleton
            variant="rectangular"
            width="100%"
            height="300px"
            animation="wave"
            className="rounded-lg"
          />
          <Skeleton
            variant="rectangular"
            width="100%"
            height="300px"
            animation="wave"
            className="rounded-lg"
          />
          <Skeleton
            variant="rectangular"
            width="100%"
            height="300px"
            animation="wave"
            className="rounded-lg"
          />
          <Skeleton
            variant="rectangular"
            width="100%"
            height="300px"
            animation="wave"
            className="rounded-lg"
          />
        </>
      )}
      {galleries !== null && galleries?.length === 0 && (
        <div className="col-span-full flex flex-col items-center justify-center text-center text-gray-600">
          <h1 className="text-2xl font-bold">Nincs galéria a listában</h1>
          <p className="mt-4">Hozz létre egy újat a fenti gombbal.</p>
        </div>
      )}
    </div>
  </div>
  )
}

export default Gallery