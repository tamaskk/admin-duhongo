import CreateGallery from "@/components/createGallery";
import Gallery from "@/components/gallery";
import Nav from "@/components/nav";
import React from "react";

const galleryPage = () => {
  return (
    <div className="flex flex-row items-center justify-center w-screen h-screen overflow-hidden bg-white">
      <Nav />
      <CreateGallery />
    </div>
  );
};

export default galleryPage;
