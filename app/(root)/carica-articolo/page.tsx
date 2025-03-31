import { Pen } from "lucide-react";
import React from "react";

import ArticleUploadForm from "@/components/forms/ArticleUploadForm";
import OptionsUploadForm from "@/components/forms/OptionsUploadForm";

const page = () => {
  return (
    <div className="px-4 md:px-8 lg:px-12">
      <OptionsUploadForm />
    </div>
  );
};

export default page;
