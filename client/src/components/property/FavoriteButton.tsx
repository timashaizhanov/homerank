import { useFavoritesStore } from "../../store/favoritesStore";

interface FavoriteButtonProps {
  propertyId: string;
}

export function FavoriteButton({ propertyId }: FavoriteButtonProps) {
  const isFavorite = useFavoritesStore((state) => state.isFavorite(propertyId));
  const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite);

  return (
    <button
      className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
        isFavorite
          ? "bg-amber text-ink"
          : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
      }`}
      onClick={() => toggleFavorite(propertyId)}
      type="button"
    >
      {isFavorite ? "В избранном" : "В избранное"}
    </button>
  );
}
