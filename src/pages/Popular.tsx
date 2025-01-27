import { useEffect, useState, useRef, useCallback } from "react";
import { getPopular } from "@/services/tmdb";
import { MovieCard } from "@/components/movies/MovieCard";
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";
import { motion } from "framer-motion";
import { LoadingBar } from "@/components/ui/loading-bar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const categories = ["All", "Action", "Comedy", "Drama", "Horror", "Romance"];

interface Movie {
  id: number;
  title: string;
  poster_path: string;
  overview: string;
  release_date: string;
  vote_average: number;
  genre_ids: number[];
}

const genreIds: Record<string, number> = {
  Action: 28,
  Comedy: 35,
  Drama: 18,
  Horror: 27,
  Romance: 10749,
};

export function Popular() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const observerTarget = useRef<HTMLDivElement>(null);
  const isInitialMount = useRef(true);

  const fetchMovies = useCallback(async () => {
    if (!hasMore || loading) return;

    try {
      setLoading(true);
      const response = await getPopular(page);
      const newMovies = response.data.results;

      // Filter movies if category is selected
      const filteredMovies =
        selectedCategory === "All"
          ? newMovies
          : newMovies.filter((movie: Movie) =>
              movie.genre_ids.includes(genreIds[selectedCategory])
            );

      setMovies((prev) =>
        page === 1 ? filteredMovies : [...prev, ...filteredMovies]
      );

      // Check if we have more pages
      setHasMore(
        filteredMovies.length > 0 &&
          response.data.page < response.data.total_pages
      );
    } catch (err) {
      console.error("Error fetching popular movies:", err);
    } finally {
      setLoading(false);
    }
  }, [page, selectedCategory, hasMore, loading]);

  // Handle category changes
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    setMovies([]);
    setPage(1);
    setHasMore(true);
  }, [selectedCategory]);

  // Handle fetching
  useEffect(() => {
    fetchMovies();
  }, [fetchMovies]);

  // Intersection Observer setup
  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [target] = entries;
      if (target.isIntersecting && hasMore && !loading) {
        setPage((prev) => prev + 1);
      }
    },
    [hasMore, loading]
  );

  useEffect(() => {
    const element = observerTarget.current;
    if (!element) return;

    const options = {
      root: null,
      rootMargin: "100px",
      threshold: 0.1,
    };

    const observer = new IntersectionObserver(handleObserver, options);
    observer.observe(element);

    return () => observer.disconnect();
  }, [handleObserver]);

  const handleCategoryChange = (category: string) => {
    if (category === selectedCategory) return;
    setSelectedCategory(category);
  };

  return (
    <div className="container py-8 min-h-screen">
      <LoadingBar isLoading={loading} />

      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold">Popular Movies</h1>
          <p className="text-muted-foreground">
            Discover the most watched movies worldwide
          </p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              {selectedCategory}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {categories.map((category) => (
              <DropdownMenuItem
                key={category}
                onClick={() => handleCategoryChange(category)}
              >
                {category}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Movies Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {movies.map((movie, index) => (
          <motion.div
            key={`${movie.id}-${index}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: (index % 10) * 0.05 }}
          >
            <MovieCard movie={movie} />
          </motion.div>
        ))}
      </div>

      {/* Loading Indicator */}
      {loading && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mt-6">
          {Array(5)
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
      )}

      {/* Intersection Observer Target */}
      <div
        ref={observerTarget}
        className="h-20 w-full flex items-center justify-center mt-8"
      >
        {loading && hasMore && (
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        )}
      </div>

      {/* No Results Message */}
      {!loading && movies.length === 0 && (
        <div className="text-center py-12">
          <p className="text-lg text-muted-foreground">
            No movies found for this category.
          </p>
        </div>
      )}
    </div>
  );
}
