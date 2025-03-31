import React, { useEffect, useState } from "react";

interface Serie {
  id: string;
  title: string;
}

interface SerieSelectorProps {
  onSerieSelect: (serieId: string) => void;
  user: any;
}

export default function SerieSelector({
  onSerieSelect,
  user,
}: SerieSelectorProps) {
  const [series, setSeries] = useState<Serie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserSeries = async () => {
      try {
        const response = await fetch(`/api/serie?authorId=${user.id}`);
        if (!response.ok) throw new Error("Errore nel caricamento delle serie");
        const data = await response.json();
        setSeries(data);
      } catch (error) {
        console.error("Errore:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserSeries();
  }, [user]);

  return (
    <div>
      <label className="block text-base font-semibold mb-2">
        Seleziona la serie
      </label>

      {loading ? (
        <p className="text-sm">Caricamento serie...</p>
      ) : series.length > 0 ? (
        <select
          className="w-full p-3 border rounded-md transition border-gray-300 focus:border-green-500"
          onChange={(e) => onSerieSelect(e.target.value)}
        >
          <option value="">Seleziona una serie</option>
          {series.map((serie) => (
            <option key={serie.id} value={serie.id}>
              {serie.title}
            </option>
          ))}
        </select>
      ) : (
        <p className="text-sm text-amber-600">
          Non hai ancora creato nessuna serie. Crea prima una serie per poter
          aggiungere capitoli.
        </p>
      )}
    </div>
  );
}
