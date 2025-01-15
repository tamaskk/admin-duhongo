import Nav from "@/components/nav";
import DeleteIcon from "@mui/icons-material/Delete";
import HourglassBottomIcon from "@mui/icons-material/HourglassBottom";
import { useEffect, useRef, useState } from "react";
import { Toaster, toast } from 'sonner'

const FAQ = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  const [faq, setFaq] = useState<any>([]);
  const firstRender = useRef(true);

  useEffect(() => {
    if (firstRender.current) {
      fetchFaq();
      firstRender.current = false;
    }
  }, []);

  const fetchFaq = async () => {
    try {
      const res = await fetch("/api/mainPage/faq");
      if (!res.ok) {
        throw new Error("Failed to fetch FAQs");
      }
      const data = await res.json();
      console.log(data);
      
      setFaq(data.faq);
    } catch (err) {
      console.error(err);
    }
  };


  const saveFaq = async () => {
    if (!faq) {
        toast.error('Nincs hozzáadva GYIK');
    }
    toast.loading('Mentés folyamatban...');
    try {
      const res = await fetch("/api/mainPage/faq", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ faq }),
      });
      if (!res.ok) {
        toast.error('Nem sikerült menteni a GYIK-et');
        throw new Error("Failed to save FAQs");
      }
      await res.json();
      toast.success('GYIK mentve');
    } catch (err) {
      console.error(err);
      toast.error('Nem sikerült menteni a GYIK-et');
    } finally {
      toast.dismiss();
    }
  };

  const handleInputChange = (id: string, field: string, value: string) => {
    setFaq((prev: any) =>
      prev.map((item: any) =>
        item._id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const handleDelete = (id: string) => {
    setFaq((prev: any) => prev.filter((item: any) => item._id !== id));
  };

  const handleAddFaq = () => {
    setFaq((prev: any) => [
      ...prev,
      { question: "Új kérdés", answer: "Új válasz", _id: Date.now() },
    ]);
  };

  return (
    <div className="flex flex-row w-screen h-screen overflow-auto bg-gray-100 text-black">
      <Nav />
      <Toaster />
      {faq === null ? (
        <div className="w-full h-screen flex items-center justify-center text-black">
          <HourglassBottomIcon className="w-10 h-10 animate-spin" />
        </div>
      ) : (
        <div className="flex flex-col w-full p-6">
          <div className="flex flex-row justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">GYIK Kezelése</h1>
            <button
              onClick={() => saveFaq()}
              className="bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors duration-300"
            >
              Mentés
            </button>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6">
            {faq.length > 0 ? (
              faq.map((item: any, index: any) => (
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
                        handleInputChange(item._id, "question", e.target.value)
                      }
                      value={item.question}
                      placeholder="Kérdés"
                      type="text"
                      className={`w-[500px] max-sm:w-full h-10 px-3 text-sm placeholder-gray-400 border rounded-lg focus:outline-none`}
                    />
                  </div>
                  <div className="w-full lg:w-1/2 pl-4">
                    <input
                      onChange={(e) =>
                        handleInputChange(item._id, "answer", e.target.value)
                      }
                      value={item.answer}
                      placeholder="Válasz"
                      type="text"
                      className={`w-[500px] max-sm:w-full h-10 px-3 text-sm placeholder-gray-400 border rounded-lg focus:outline-none`}
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
              <p className="text-gray-500">Nincs hozzáadva GYIK.</p>
            )}
          </div>
          <button
            onClick={handleAddFaq}
            className="mt-6 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors duration-300"
          >
            GYIK Hozzáadása
          </button>
        </div>
      )}
    </div>
  );
};

export default FAQ;
