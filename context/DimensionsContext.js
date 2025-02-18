import PropTypes from "prop-types";
import React, { createContext, useState } from "react";

// Create the context
export const DimensionsContext = createContext();

// Provider component
export const DimensionsProvider = ({ children }) => {
  const [dimensions, setDimensions] = useState([]); // For dimensions (width, height)

  return (
    <DimensionsContext.Provider value={{ dimensions, setDimensions }}>
      {children}
    </DimensionsContext.Provider>
  ); // ✅ Closing parenthesis added here
};

// ✅ Correctly define PropTypes
DimensionsProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default DimensionsProvider;
