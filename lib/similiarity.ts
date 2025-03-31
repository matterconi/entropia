// File: lib/similarity.ts

/**
 * Calcola la similarità coseno tra due vettori di embedding
 *
 * @param vecA - Il primo vettore
 * @param vecB - Il secondo vettore
 * @returns Un valore tra -1 e 1, dove 1 indica massima similarità
 */
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (!vecA || !vecB || vecA.length === 0 || vecB.length === 0) {
    return 0;
  }

  if (vecA.length !== vecB.length) {
    throw new Error("Vectors must have the same length");
  }

  // Utilizzo di reduce per maggiore efficienza
  const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const normA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const normB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));

  // Evita divisione per zero
  if (normA === 0 || normB === 0) {
    return 0;
  }

  return dotProduct / (normA * normB);
}

/**
 * Versione ottimizzata che precalcola la norma dei vettori per riutilizzo
 * Utile quando confronti un vettore con molti altri
 */
export function createEfficientSimilarityCalculator(referenceVector: number[]) {
  if (!referenceVector || referenceVector.length === 0) {
    throw new Error("Reference vector cannot be empty");
  }

  // Precalcola la norma del vettore di riferimento
  const normReference = Math.sqrt(
    referenceVector.reduce((sum, val) => sum + val * val, 0),
  );

  if (normReference === 0) {
    return () => 0; // Restituisce sempre 0 per vettori con norma zero
  }

  // Restituisce una funzione chiusa sul vettore di riferimento
  return function (compareVector: number[]): number {
    if (!compareVector || compareVector.length === 0) {
      return 0;
    }

    if (compareVector.length !== referenceVector.length) {
      throw new Error("Vectors must have the same length");
    }

    const dotProduct = referenceVector.reduce(
      (sum, val, i) => sum + val * compareVector[i],
      0,
    );

    const normCompare = Math.sqrt(
      compareVector.reduce((sum, val) => sum + val * val, 0),
    );

    if (normCompare === 0) {
      return 0;
    }

    return dotProduct / (normReference * normCompare);
  };
}
