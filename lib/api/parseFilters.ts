export const parseFilters = (url: string) => {
  const { searchParams } = new URL(url);
  const filters = searchParams.get("filters");

  if (!filters) return {}; // Nessun filtro attivo

  return filters.split("&").reduce(
    (acc, filter) => {
      const [key, values] = filter.split(":");
      acc[key] = values.split(",");
      return acc;
    },
    {} as Record<string, string[]>,
  );
};
