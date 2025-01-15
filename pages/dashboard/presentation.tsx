import Nav from "@/components/nav";
import PresenationPage from "@/components/presentation";
import React from "react";

const Presentation = () => {
  return (
    <div className="flex flex-row items-center justify-center w-screen h-screen overflow-hidden bg-white">
      <Nav />
      <PresenationPage />
    </div>
  );
};

export default Presentation;
