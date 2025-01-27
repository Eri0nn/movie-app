import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MovieCard } from "@/components/movies/MovieCard";
import { getTrending, getPopular } from "@/services/tmdb";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ChevronRight, PlayCircle, Bookmark, ChevronLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { TrailerModal } from "@/components/movies/TrailerModal";
import { useWatchlist } from "@/contexts/WatchlistContext";
import { cn } from "@/lib/utils";

interface Movie {
  id: number;
  title: string;
  poster_path: string;
  backdrop_path: string;
  overview: string;
  release_date: string;
  vote_average: number;
  runtime: number;
  genres: { id: number; name: string }[];
  tagline: string;
}

export function Home() {
  const [trendingMovies, setTrendingMovies] = useState<Movie[]>([]);
  const [popularMovies, setPopularMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [trailerOpen, setTrailerOpen] = useState(false);
  const { addToWatchlist, removeFromWatchlist, isInWatchlist } = useWatchlist();

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const [trendingResponse, popularResponse] = await Promise.all([
          getTrending(),
          getPopular(),
        ]);
        setTrendingMovies(trendingResponse.data.results.slice(0, 6));
        setPopularMovies(popularResponse.data.results.slice(0, 8));
      } catch (err) {
        console.error("Error fetching movies:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

  // Auto-advance carousel
  useEffect(() => {
    if (!loading && trendingMovies.length > 0) {
      const timer = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % trendingMovies.length);
      }, 8000); // Change slide every 8 seconds

      return () => clearInterval(timer);
    }
  }, [loading, trendingMovies.length]);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % trendingMovies.length);
  };

  const prevSlide = () => {
    setCurrentIndex(
      (prev) => (prev - 1 + trendingMovies.length) % trendingMovies.length
    );
  };

  const currentMovie = trendingMovies[currentIndex];
  const isBookmarked = currentMovie ? isInWatchlist(currentMovie.id) : false;

  const handleBookmarkClick = () => {
    if (!currentMovie) return;

    if (isBookmarked) {
      removeFromWatchlist(currentMovie.id);
    } else {
      addToWatchlist(currentMovie);
    }
  };

  return (
    <div className="pb-8 space-y-8 min-h-screen">
      {/* Hero Section */}
      {!loading && trendingMovies.length > 0 && (
        <section className="relative h-[80vh] overflow-hidden">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0"
            >
              <img
                src={`https://image.tmdb.org/t/p/original${trendingMovies[currentIndex].backdrop_path}`}
                alt={trendingMovies[currentIndex].title}
                className="object-cover w-full h-full"
              />
              <div className="from-background via-background/80 absolute inset-0 bg-gradient-to-t to-transparent pointer-events-none" />
            </motion.div>
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex absolute inset-x-0 top-1/2 z-10 justify-between items-center px-4 -translate-y-1/2">
            <Button
              variant="ghost"
              size="icon"
              className="bg-background/20 hover:bg-background/40 w-12 h-12 rounded-full backdrop-blur-sm"
              onClick={prevSlide}
            >
              <ChevronLeft className="w-6 h-6" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="bg-background/20 hover:bg-background/40 w-12 h-12 rounded-full backdrop-blur-sm"
              onClick={nextSlide}
            >
              <ChevronRight className="w-6 h-6" />
            </Button>
          </div>

          <div className="container flex relative items-end pb-16 h-full">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-6 max-w-2xl"
            >
              <div className="space-y-2">
                <h1 className="md:text-6xl text-4xl font-bold tracking-tight text-white">
                  {currentMovie.title}
                </h1>
                <p className="text-white/80 text-lg font-medium">
                  {currentMovie.tagline}
                </p>
              </div>
              <p className="text-muted-foreground line-clamp-2 text-lg">
                {currentMovie.overview}
              </p>
              <div className="flex gap-4 items-center">
                <Button
                  size="lg"
                  className="gap-2"
                  onClick={() => setTrailerOpen(true)}
                >
                  <PlayCircle className="w-5 h-5" />
                  Watch Trailer
                </Button>
                <Button
                  size="lg"
                  variant={isBookmarked ? "secondary" : "secondary"}
                  className={cn(
                    "gap-2",
                    isBookmarked &&
                      "bg-primary/10 hover:bg-primary/20 text-primary"
                  )}
                  onClick={handleBookmarkClick}
                >
                  <Bookmark
                    className={cn("w-5 h-5", isBookmarked && "fill-primary")}
                  />
                  {isBookmarked ? "Bookmarked" : "Add Bookmark"}
                </Button>
              </div>
            </motion.div>
          </div>

          {/* Carousel Indicators */}
          <div className="flex absolute bottom-4 left-1/2 gap-2 -translate-x-1/2">
            {trendingMovies.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentIndex
                    ? "bg-white w-6"
                    : "bg-white/50 hover:bg-white/75"
                }`}
              />
            ))}
          </div>
        </section>
      )}

      {/* Trailer Modal */}
      {currentMovie && (
        <TrailerModal
          movieId={currentMovie.id}
          title={currentMovie.title}
          open={trailerOpen}
          onOpenChange={setTrailerOpen}
        />
      )}

      <div className="container space-y-8">
        {/* Trending Section */}
        <section>
          <div className="flex justify-between items-center mb-6">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold">Trending This Week</h2>
              <p className="text-muted-foreground">
                Stay updated with the most popular content
              </p>
            </div>
            <Link to="/trending">
              <Button variant="ghost" className="group">
                View All
                <ChevronRight className="group-hover:translate-x-1 w-4 h-4 transition-transform" />
              </Button>
            </Link>
          </div>
          <ScrollArea>
            <div className="flex pb-4 space-x-4">
              {loading
                ? Array(6)
                    .fill(null)
                    .map((_, index) => (
                      <div
                        key={index}
                        className="w-[250px] flex-none space-y-3"
                      >
                        <Skeleton className="aspect-[2/3] rounded-lg" />
                        <div className="space-y-2">
                          <Skeleton className="w-full h-4" />
                          <Skeleton className="w-2/3 h-4" />
                        </div>
                      </div>
                    ))
                : trendingMovies.map((movie) => (
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

        {/* Popular Section */}
        <section>
          <div className="flex justify-between items-center mb-6">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold">Popular Movies</h2>
              <p className="text-muted-foreground">
                Discover the most watched movies
              </p>
            </div>
            <Link to="/popular">
              <Button variant="ghost" className="group">
                View All
                <ChevronRight className="group-hover:translate-x-1 w-4 h-4 transition-transform" />
              </Button>
            </Link>
          </div>
          <div className="md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 grid grid-cols-1 gap-6">
            {loading
              ? Array(8)
                  .fill(null)
                  .map((_, index) => (
                    <div key={index} className="space-y-3">
                      <Skeleton className="aspect-[2/3] rounded-lg" />
                      <div className="space-y-2">
                        <Skeleton className="w-full h-4" />
                        <Skeleton className="w-2/3 h-4" />
                      </div>
                    </div>
                  ))
              : popularMovies.map((movie) => (
                  <motion.div
                    key={movie.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    <MovieCard movie={movie} />
                  </motion.div>
                ))}
          </div>
        </section>
      </div>
    </div>
  );
}
