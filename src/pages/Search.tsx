import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { searchMovies } from "@/services/tmdb";
import { MovieCard } from "@/components/movies/MovieCard";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

interface Movie {
  id: number;
  title: string;
  poster_path: string;
  overview: string;
  release_date: string;
  vote_average: number;
}

export function Search() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      if (!query) return;
      setLoading(true);
      try {
        const response = await searchMovies(query);
        setMovies(response.data.results);
      } catch (err) {
        console.error("Error searching movies:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query]);

  return (
    <div className="container py-8">
      <div className="space-y-4 mb-8">
        <h1 className="text-3xl font-bold">Search Results</h1>
        <p className="text-muted-foreground">
          {movies.length} results for "{query}"
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {Array(10)
            .fill(null)
            .map((_, index) => (
              <div key={index} className="space-y-3">
                <Skeleton className="aspect-[2/3] rounded-lg" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </div>
            ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
        >
          {movies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
          {movies.length === 0 && (
            <div className="col-span-full text-center py-12">
              <p className="text-muted-foreground">No movies found</p>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
