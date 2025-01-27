import { useEffect, useState } from "react";
import { getRecommendations } from "@/services/tmdb";
import { MovieCard } from "./MovieCard";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { motion } from "framer-motion";

interface Movie {
  id: number;
  title: string;
  poster_path: string;
  overview: string;
  release_date: string;
  vote_average: number;
}

interface WatchlistRecommendationsProps {
  watchlistMovies: Movie[];
}

export function WatchlistRecommendations({
  watchlistMovies,
}: WatchlistRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendations = async () => {
      if (watchlistMovies.length === 0) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        // Get recommendations for up to 3 random movies from the watchlist
        const sampleMovies = watchlistMovies
          .sort(() => 0.5 - Math.random())
          .slice(0, 3);

        const recommendationsPromises = sampleMovies.map((movie) =>
          getRecommendations(movie.id.toString())
        );

        const responses = await Promise.all(recommendationsPromises);

        // Combine and deduplicate recommendations
        const allRecommendations = responses.flatMap(
          (response) => response.data.results
        );
        const uniqueRecommendations = Array.from(
          new Map(allRecommendations.map((movie) => [movie.id, movie])).values()
        );

        // Filter out movies that are already in the watchlist
        const filteredRecommendations = uniqueRecommendations.filter(
          (movie) =>
            !watchlistMovies.some(
              (watchlistMovie) => watchlistMovie.id === movie.id
            )
        );

        // Get top 10 recommendations
        setRecommendations(filteredRecommendations.slice(0, 10));
      } catch (err) {
        console.error("Error fetching recommendations:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [watchlistMovies]);

  if (watchlistMovies.length === 0) {
    return null;
  }

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Recommended for You</h2>
        <p className="text-muted-foreground">Based on your watchlist</p>
      </div>

      <ScrollArea>
        <div className="flex space-x-4 pb-4">
          {loading
            ? Array(5)
                .fill(null)
                .map((_, index) => (
                  <div key={index} className="w-[250px] flex-none space-y-3">
                    <Skeleton className="aspect-[2/3] rounded-lg" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-2/3" />
                    </div>
                  </div>
                ))
            : recommendations.map((movie) => (
                <motion.div
                  key={movie.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="w-[250px] flex-none"
                >
                  <MovieCard movie={movie} />
                </motion.div>
              ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </section>
  );
}
