import Nav from "@/components/nav";
import DeleteIcon from "@mui/icons-material/Delete";
import HourglassBottomIcon from "@mui/icons-material/HourglassBottom";
import { useEffect, useRef, useState } from "react";
import saveFaq from "../../context/mainContext"
import { Toaster, toast } from "sonner";

const FAQ = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  const [actions, setActions] = useState<any>([]);
  const firstRender = useRef(true);

  useEffect(() => {
    if (firstRender.current) {
      getActions();
      firstRender.current = false;
    }
  }, []);

  const handleInputChange = (id: string, field: string, value: string) => {
    setActions((prev: any) =>
      prev.map((item: any) =>
        item._id === id ? { ...item, [field]: value } : item
      )
    );
    console.log(actions);
  };

  const handleDelete = (id: string) => {
    setActions((prev: any) => prev.filter((item: any) => item._id !== id));
  };

  const handleAddFaq = () => {
    setActions((prev: any) => [
      ...prev,
      { action: "Akció", _id: Date.now(), color: "#000000" },
    ]);
  };

  const saveActions = async () => {
    if (!actions) {
      toast.error('Nincs hozzáadva GYIK');
  }
  toast.loading('Mentés folyamatban...');
  console.log(actions);
    try {
      const res = await fetch("/api/mainPage/actions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ actions }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Akciók mentve');
      } else {
        toast.error('Nem sikerült menteni az Akciókat');
        throw new Error("Failed to save Actions");
      }
    } catch (error) {
      console.error(error);
      toast.error('Nem sikerült menteni az Akciókat');
    }
  }

  const getActions = async () => {
    try {
      const res = await fetch("/api/mainPage/actions");
      if (!res.ok) {
        throw new Error("Failed to fetch Actions");
      }
      const data = await res.json();
      setActions(data.actions);
    } catch (err) {
      console.error(err);
    }
  }


  return (
    <div className="flex flex-row w-screen h-screen overflow-auto bg-gray-100 text-black">
      <Nav />
      <Toaster />
      {actions === null ? (
        <div className="w-full h-screen flex items-center justify-center text-black">
          <HourglassBottomIcon className="w-10 h-10 animate-spin" />
        </div>
      ) : (
        <div className="flex flex-col w-full p-6">
          <div className="flex flex-row justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Akciók Kezelése</h1>
            <button
              onClick={saveActions}
              className="bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors duration-300"
            >
              Mentés
            </button>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6">
            {actions.length > 0 ? (
              actions.map((item: any, index: any) => (
                <div
                  key={item._id}
                  className="flex flex-col lg:flex-row items-start lg:items-center mb-4 border-b pb-4 last:border-b-0 last:pb-0"
                >
                  <div className="w-full lg:w-8">
                    <p className="font-bold">{index + 1}.</p>
                  </div>
                  <div className="w-full lg:w-1/2 pr-4">
                    <input
                      onChange={(e) =>
                        handleInputChange(item._id, "action", e.target.value)
                      }
                      value={item.action}
                      placeholder="Kérdés"
                      type="text"
                      className={`w-[500px] max-sm:w-full h-10 px-3 text-sm placeholder-gray-400 border rounded-lg focus:outline-none`}
                    />
                  </div>
                  <div className="w-full lg:w-1/2 pl-4">
                    <input
                      onChange={(e) =>
                        handleInputChange(item._id, "color", e.target.value)
                      }
                      value={item.color}
                      placeholder="Válasz"
                      type="color"
                      className={`w-[500px] max-sm:w-full h-10 px-3 text-sm bg-white border-none outline-none rounded-xl border focus:outline-none`}
                    />
                  </div>
                  <button
                    onClick={() => handleDelete(item._id)}
                    className="ml-auto mt-4 lg:mt-0 text-red-500 hover:text-red-700 transition-colors duration-300"
                  >
                    <DeleteIcon />
                  </button>
                </div>
              ))
            ) : (
              <p className="text-gray-500">Nincs hozzáadva Akció.</p>
            )}
          </div>
          <button
            onClick={handleAddFaq}
            className="mt-6 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors duration-300"
          >
            Akció Hozzáadása
          </button>
        </div>
      )}
    </div>
  );
};

export default FAQ;
