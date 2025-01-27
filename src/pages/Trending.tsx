import { useEffect, useState } from "react";
import { MovieCard } from "@/components/movies/MovieCard";
import { getTrending } from "@/services/tmdb";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarDays, Clock } from "lucide-react";

type TimeWindow = "day" | "week";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export function Trending() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeWindow, setTimeWindow] = useState<TimeWindow>("week");

  useEffect(() => {
    const fetchMovies = async () => {
      setLoading(true);
      try {
        const response = await getTrending(timeWindow);
        setMovies(response.data.results);
      } catch (error) {
        console.error("Error fetching trending movies:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, [timeWindow]);

  return (
    <div className="container py-8 space-y-6">
      <div className="flex items-center justify-between">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold"
        >
          Trending Movies
        </motion.h1>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Tabs
            value={timeWindow}
            onValueChange={(value: TimeWindow) => setTimeWindow(value)}
          >
            <TabsList>
              <TabsTrigger value="day" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Today
              </TabsTrigger>
              <TabsTrigger value="week" className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4" />
                This Week
              </TabsTrigger>
            </TabsList>
          </Tabs>
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
