import React from "react";

const GlowingBadge = () => {
  // Using black color scheme as requested
  const tagBackgroundGradient = "from-black to-gray-800 bg-black";
  const displayLabel = "Le Serie";

  return (
    <div className="relative inline-flex group">
      {/* Badge content - with whitespace-nowrap to prevent text wrapping */}
      <div
        className={`relative bg-gradient-to-r ${tagBackgroundGradient} text-white px-2 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap`}
      >
        {displayLabel}
      </div>
    </div>
  );
};

export default GlowingBadge;
