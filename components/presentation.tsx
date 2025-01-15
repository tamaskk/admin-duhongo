import React, { useEffect, useRef, useState } from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import HourglassBottomIcon from "@mui/icons-material/HourglassBottom";
import {
  deleteObject,
  getDownloadURL,
  ref as storageRef,
  uploadBytes,
} from "@firebase/storage";
import { storage } from "@/db/firebase";
import { Toaster, toast } from "sonner";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";

const PresenationPage = () => {
  const [sections, setSections] = useState<any[]>([]); // Changed to a stricter array type
  const [choosenPage, setChoosenPage] = useState<string>("");
  const firstRender = useRef(true);
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "loading") return;
    
    if (!session) {
      router.push('/login')
    }
  }, [session, status, router])
  
  useEffect(() => {
    if (firstRender.current) {
      fetchSections();
      firstRender.current = false;
    }
  }, []);

  const fetchSections = async () => {
    try {
      const res = await fetch("/api/mainPage/presentation");
      const { presentation } = await res.json();
      setSections(presentation);
    } catch (error) {
      console.error("Failed to fetch sections:", error);
      toast.error("Nem sikerült betölteni a szekciókat.");
    }
  };

  const saveSections = async () => {
    if (!sections) {
      toast.error("Nincs hozzáadva szekció.");
      return;
    }

    toast.loading("Mentés folyamatban...");

    try {
      // Save sections
      const res = await fetch("/api/mainPage/presentation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ presentation: sections.length > 0 ? sections : null }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Szekciók mentve.");
      } else {
        toast.error("Nem sikerült menteni a szekciókat.");
        console.log(data)
        throw new Error("Failed to save sections");
      }
      toast.success("Szekciók mentve.");
    } catch (error) {
      console.error(error);
      toast.error("Nem sikerült menteni a szekciókat.");
    } finally {
      toast.dismiss();
    }
  };

  useEffect(() => {
    console.log(sections);
  }, [sections]);

  const uploadFile = (image: File | null, index: any) => {
    if (!image) {
      toast.error("Nem választottál képet!");
      return;
    }

    const imageRef = storageRef(
      storage,
      `presentation/${Date.now()}-${image.name}`
    );

    toast.loading("Kép feltöltése folyamatban...");

    // Upload image to storage
    uploadBytes(imageRef, image)
      .then((snapshot) => {
        getDownloadURL(snapshot.ref)
          .then((url: string) => {
            // Update the corresponding section with the new image URL
            setSections((prev) =>
              prev.map((item, i) =>
                i === index ? { ...item, imageUrl: url } : item
              )
            );
            console.log(sections);
            console.log(url);
            toast.success("Kép sikeresen feltöltve!");
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

  const handleDelete = async (id: string, index: any, url: any) => {
    await deleteFile(url, index);
    setSections((prev) => prev.filter((item) => item._id !== id));
  };

  const handleAddSection = () => {
    setSections((prev) => [...(prev || []), { imageUrl: "", _id: Date.now() }]);
  };

  useEffect(() => {
    console.log(sections);
  }, [sections]);

  const deleteFile = (imageUrl: string, index: number) => {
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
        // Update the sections state to remove the image URL
        setSections((prev) =>
          prev.map((item, i) =>
            i === index ? { ...item, imageUrl: null } : item
          )
        );
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
    <div className="flex flex-col lg:flex-row w-screen h-screen overflow-auto bg-gray-100 text-black">
      <Toaster />
      {sections === null ? (
        <div className="w-full h-screen flex items-center justify-center text-black">
          <HourglassBottomIcon className="w-10 h-10 animate-spin" />
        </div>
      ) : (
        <div className="flex flex-col w-full p-6">
          <div className="flex flex-row justify-between items-center mb-6">
            <button
              onClick={() => setChoosenPage("szekciok")}
              className={`text-3xl ${
                choosenPage === "szekciok" && "underline"
              } font-bold`}
            >
              Bemutató galéria kezelése
            </button>
            <button
              onClick={() => saveSections()}
              className="bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors duration-300"
            >
              Mentés
            </button>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6">
            {sections?.length > 0 ? (
              sections.map((item, index) => (
                <div
                  key={item._id}
                  className="flex flex-col lg:flex-row items-start w-full lg:items-center border-b pb-4 last:border-b-0 last:pb-0 justify-between"
                >
                  <div className="w-fit  lg:w-8">
                    <p className="font-bold">{index + 1}.</p>
                  </div>

                  <div className="flex-grow pl-4 flex flex-row items-center justify-between">
                    <input
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        if (!e.target.files || e.target.files.length === 0) {
                          toast.error("Nem választottál képet!");
                          return;
                        }

                        const file = e.target.files[0];
                        uploadFile(file, index);
                      }}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      id={`fileInput-${item._id}`}
                    />
                    <div
                      onClick={() => {
                        const fileInput = document.getElementById(
                          `fileInput-${item._id}`
                        ) as HTMLInputElement;
                        if (fileInput) {
                          fileInput.click();
                        }
                      }}
                      className="w-[300px] flex flex-col items-center justify-center bg-blue-300 cursor-pointer hover:bg-blue-400 text-white transition-all duration-300 max-sm:w-full h-10 px-3 text-sm placeholder-gray-400 border rounded-lg focus:outline-none"
                    >
                      <p>Kattints a kép feltöltéséhez</p>
                    </div>
                    {item.imageUrl && (
                      <div className="relative w-[400px] h-[200px]">
                        <img
                          src={item.imageUrl}
                          alt="Kép"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>

                  <button
                    className="w-fit mt-4 lg:mt-0 text-red-500 hover:text-red-700 transition-colors duration-300"
                    onClick={() => handleDelete(item._id, index, item.imageUrl)}
                  >
                    <DeleteIcon />
                  </button>
                </div>
              ))
            ) : (
              <p className="text-gray-500">Nincs hozzáadva galéria.</p>
            )}
          </div>
          <button
            onClick={handleAddSection}
            className="mt-6 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors duration-300"
          >
            Kép hozzáadása
          </button>
        </div>
      )}
    </div>
  );
};

export default PresenationPage;
