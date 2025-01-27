import { useEffect, useState } from "react";
import { MovieCard } from "@/components/movies/MovieCard";
import { getPopular, getTopRated } from "@/services/tmdb";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type MovieFilter = "popular" | "top_rated";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export function Movies() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<MovieFilter>("popular");

  useEffect(() => {
    const fetchMovies = async () => {
      setLoading(true);
      try {
        const response = await (filter === "popular"
          ? getPopular()
          : getTopRated());
        setMovies(response.data.results);
      } catch (error) {
        console.error("Error fetching movies:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, [filter]);

  return (
    <div className="container py-8 space-y-6">
      <div className="flex items-center justify-between">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold"
        >
          Movies
        </motion.h1>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Select
            value={filter}
            onValueChange={(value: MovieFilter) => setFilter(value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="popular">Popular</SelectItem>
              <SelectItem value="top_rated">Top Rated</SelectItem>
            </SelectContent>
          </Select>
        </motion.div>
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6"
      >
        {loading
          ? Array(12)
              .fill(null)
              .map((_, index) => (
                <div key={index} className="space-y-3">
                  <Skeleton className="aspect-[2/3] rounded-lg" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                </div>
              ))
          : movies.map((movie) => <MovieCard key={movie.id} movie={movie} />)}
      </motion.div>
    </div>
  );
}
