import React, { createContext, useContext, useState } from "react";

interface CharacterContextType {
  currentParagraph: number;
  startNextParagraph: () => void;
}

const CharacterContext = createContext<CharacterContextType | null>(null);

export const CharacterProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [currentParagraph, setCurrentParagraph] = useState(0);

  const startNextParagraph = () => {
    setCurrentParagraph((prev) => prev + 1);
  };

  return (
    <CharacterContext.Provider value={{ currentParagraph, startNextParagraph }}>
      {children}
    </CharacterContext.Provider>
  );
};

export const useCharacterContext = () => {
  const context = useContext(CharacterContext);
  if (!context) {
    throw new Error(
      "useCharacterContext must be used within a CharacterProvider",
    );
  }
  return context;
};
