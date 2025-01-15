import { useSession } from "next-auth/react";
import {
  FC,
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

type MainContextType = any;

const MainContext = createContext<MainContextType | undefined>(undefined);

export const useMainContext = (): MainContextType => {
  const context = useContext(MainContext);
  if (context === undefined) {
    throw new Error("useMainContext must be used within a ContextProvider");
  }
  return context;
};

export const MainContextProvider: FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [faq, setFaq] = useState<any>(null);
  const [errorData, setErrorData] = useState<any>(null);

  const isDataFetched = useRef(false); // Tracks if data is already fetched

  const { data: session } = useSession();

  const value = {
    errorData,
    setErrorData,
    faq,
    setFaq,
  };

  return <MainContext.Provider value={value}>{children}</MainContext.Provider>;
};

export default MainContextProvider;
