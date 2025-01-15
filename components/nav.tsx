import {
    Help as HelpIcon,
    Home as HomeIcon
} from "@mui/icons-material";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/router";
import CrisisAlertIcon from '@mui/icons-material/CrisisAlert';
import CollectionsIcon from '@mui/icons-material/Collections';
import DomainIcon from '@mui/icons-material/Domain';
import QuestionMarkIcon from '@mui/icons-material/QuestionMark';
import InsertPhotoIcon from '@mui/icons-material/InsertPhoto';

  const Nav = () => {
    const router = useRouter();
  
    const firstLetterCapital = (word: string | null | undefined) => {
      return word && word.charAt(0).toUpperCase() + word.slice(1);
    };
  
     const menus: any = [
      { name: "Főoldal", icon: <HomeIcon />, link: "/dashboard" },
      { name: "Galéria", icon: <CollectionsIcon />, link: "/dashboard/gallery" },
      { name: "Fő oldal képek", icon: <DomainIcon />, link: "/dashboard/homepage" },
      { name: "Bemutató Galéria", icon: <InsertPhotoIcon />, link: "/dashboard/presentation" },
      { name: "Akciók", icon: <CrisisAlertIcon />, link: "/dashboard/actions" },
      { name: "GYIK", icon: <QuestionMarkIcon />, link: "/dashboard/faq" },
     ];
  
  
    const isActive = (menuLink: string) => {
      if (menuLink === "/dashboard") {
        return router.pathname === menuLink;
      }
      return router.pathname.includes(menuLink);
    };
  
    return (
      <div className="w-64 bg-gray-800 text-white flex flex-col h-screen">
        <div className="p-4">
          <h1 className="text-2xl font-bold mb-2">A Dühöngő</h1>
          <h2 className="text-lg mb-2">Admin felület</h2>
          <p className="text-sm">
            {/* {firstLetterCapital(session?.user?.name)} */}
          </p>
        </div>
  
        <nav className="flex-1 overflow-y-auto">
          <ul className="space-y-2 p-4">
            {menus && menus?.map((menu: any, index: any) => (
              <li key={index}>
                <Link href={menu.link}>
                  <p
                    className={`flex items-center p-3 rounded-md text-sm font-medium transition-colors duration-300 ${
                      isActive(menu.link)
                        ? "bg-gray-700 text-yellow-400"
                        : "text-gray-300 hover:bg-gray-700"
                    }`}
                  >
                    <span className="mr-3">{menu.icon}</span>
                    {menu.name}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
  
        <div className="p-4">
          <button
            onClick={() => signOut()}
            className="w-full text-red-400 hover:bg-gray-700 py-2 rounded-md text-center"
          >
            Kijelentkezés
          </button>
        </div>
      </div>
    );
  };
  
  export default Nav;
  