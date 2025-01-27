import { motion } from "framer-motion";
import { useWatchlist } from "@/contexts/WatchlistContext";
import { MovieCard } from "@/components/movies/MovieCard";
import { WatchlistRecommendations } from "@/components/movies/WatchlistRecommendations";
import { Bookmark } from "lucide-react";

export function Watchlist() {
  const { watchlist } = useWatchlist();

  return (
    <div className="space-y-12">
      <div>
        <div className="flex gap-2 items-center mb-4">
          <h1 className="text-3xl font-bold">My Watchlist</h1>
          <span className="text-muted-foreground">({watchlist.length})</span>
        </div>

        {watchlist.length === 0 ? (
          <div className="py-12 space-y-4 text-center">
            <Bookmark className="text-muted-foreground mx-auto w-12 h-12" />
            <div className="space-y-2">
              <p className="text-xl font-semibold">Your watchlist is empty</p>
              <p className="text-muted-foreground">
                Start adding movies to your watchlist to keep track of what you
                want to watch
              </p>
            </div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 grid grid-cols-2 gap-6"
          >
            {watchlist.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </motion.div>
        )}
      </div>

      {watchlist.length > 0 && (
        <WatchlistRecommendations watchlistMovies={watchlist} />
      )}
    </div>
  );
}
