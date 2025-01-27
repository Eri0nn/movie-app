import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  getMovie,
  getMovieCredits,
  getSimilarMovies,
  getImageUrl,
  getMovieVideos,
} from "@/services/tmdb";
import { Skeleton } from "@/components/ui/skeleton";
import { MovieCard } from "@/components/movies/MovieCard";
import {
  CalendarDays,
  Clock,
  Star,
  Bookmark,
  Share2,
  Play,
  Info,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useWatchlist } from "@/contexts/WatchlistContext";
import { Button } from "@/components/ui/button";
import { ScrollToTop } from "@/components/ui/scroll-to-top";
import { LoadingBar } from "@/components/ui/loading-bar";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  release_date: string;
  vote_average: number;
  runtime: number;
  genres: { id: number; name: string }[];
  tagline: string;
}

interface Credit {
  id: number;
  name: string;
  character: string;
  profile_path: string;
  job?: string;
}

interface Video {
  key: string;
  site: string;
  type: string;
  name: string;
}

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 },
};

const stagger = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export function MovieDetails() {
  const { id } = useParams();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [credits, setCredits] = useState<Credit[]>([]);
  const [crew, setCrew] = useState<Credit[]>([]);
  const [similarMovies, setSimilarMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [videos, setVideos] = useState<Video[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const { addToWatchlist, removeFromWatchlist, isInWatchlist } = useWatchlist();

  useEffect(() => {
    const fetchMovieDetails = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const [
          movieResponse,
          creditsResponse,
          similarResponse,
          videosResponse,
        ] = await Promise.all([
          getMovie(id),
          getMovieCredits(id),
          getSimilarMovies(id),
          getMovieVideos(id),
        ]);
        setMovie(movieResponse.data);
        setCredits(creditsResponse.data.cast.slice(0, 8));
        setCrew(
          creditsResponse.data.crew
            .filter(
              (person: Credit) =>
                person.job === "Director" ||
                person.job === "Writer" ||
                person.job === "Producer"
            )
            .slice(0, 6)
        );
        setSimilarMovies(similarResponse.data.results.slice(0, 6));

        // Filter and sort videos
        const filteredVideos = videosResponse.data.results
          .filter(
            (video: Video) =>
              video.site === "YouTube" &&
              (video.type === "Trailer" || video.type === "Teaser")
          )
          .slice(0, 5);
        setVideos(filteredVideos);
        setSelectedVideo(filteredVideos[0] || null);
      } catch (err) {
        console.error("Error fetching movie details:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMovieDetails();
    window.scrollTo(0, 0);
  }, [id]);

  const handleWatchlistClick = () => {
    if (!movie) return;
    if (isInWatchlist(movie.id)) {
      removeFromWatchlist(movie.id);
      toast.success("Removed from watchlist");
    } else {
      addToWatchlist(movie);
      toast.success("Added to watchlist");
    }
  };

  const handleShare = async () => {
    if (!movie) return;
    try {
      await navigator.share({
        title: movie.title,
        text: movie.overview,
        url: window.location.href,
      });
    } catch {
      // Fallback to copying to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    }
  };

  if (loading) {
    return (
      <>
        <LoadingBar isLoading={loading} />
        <div className="container py-8 space-y-8">
          <Skeleton className="h-[400px] w-full rounded-lg" />
          <div className="space-y-4">
            <Skeleton className="w-2/3 h-8" />
            <Skeleton className="w-full h-4" />
            <Skeleton className="w-full h-4" />
          </div>
        </div>
      </>
    );
  }

  if (!movie) return null;

  const inWatchlist = isInWatchlist(movie.id);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={id}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="pb-8 min-h-screen"
      >
        {/* Hero Section with Backdrop */}
        <motion.div
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="h-[70vh] bg-cover bg-center relative"
          style={{
            backgroundImage: `url(${getImageUrl(movie.backdrop_path)})`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
          <div className="container relative h-full">
            <motion.div
              variants={stagger}
              initial="initial"
              animate="animate"
              className="flex absolute bottom-8 gap-8 items-end"
            >
              {/* Poster */}
              <motion.div
                variants={fadeIn}
                className="hidden md:block w-64 rounded-lg shadow-2xl overflow-hidden"
              >
                <img
                  src={getImageUrl(movie.poster_path, "w500")}
                  alt={movie.title}
                  className="w-full h-auto"
                />
              </motion.div>
              {/* Movie Info */}
              <div className="flex-1 space-y-4">
                <motion.div variants={fadeIn} className="space-y-2">
                  <div className="flex gap-4 justify-between items-start">
                    <div className="space-y-2">
                      <h1 className="text-4xl md:text-5xl font-bold text-white">
                        {movie.title}
                      </h1>
                      {movie.tagline && (
                        <p className="text-xl italic text-primary">
                          {movie.tagline}
                        </p>
                      )}
                    </div>
                    <div className="hidden md:flex gap-2">
                      {videos.length > 0 && (
                        <Dialog>
                          <Button
                            size="lg"
                            className="bg-primary text-primary-foreground hover:bg-primary/90"
                          >
                            <Play className="mr-2 h-5 w-5" />
                            Watch Trailer
                          </Button>
                          <DialogContent className="max-w-4xl">
                            <DialogHeader>
                              <DialogTitle>Trailers & Videos</DialogTitle>
                            </DialogHeader>
                            <div className="aspect-video">
                              <iframe
                                src={`https://www.youtube.com/embed/${selectedVideo?.key}`}
                                title="YouTube video player"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                className="w-full h-full rounded-lg"
                              />
                            </div>
                            {videos.length > 1 && (
                              <ScrollArea className="h-24">
                                <div className="flex gap-4">
                                  {videos.map((video) => (
                                    <button
                                      key={video.key}
                                      onClick={() => setSelectedVideo(video)}
                                      className={`flex-none w-40 p-2 rounded-lg transition-colors ${
                                        selectedVideo?.key === video.key
                                          ? "bg-primary"
                                          : "hover:bg-muted"
                                      }`}
                                    >
                                      <p className="text-sm font-medium line-clamp-2">
                                        {video.name}
                                      </p>
                                    </button>
                                  ))}
                                </div>
                              </ScrollArea>
                            )}
                          </DialogContent>
                        </Dialog>
                      )}
                      <Button
                        size="lg"
                        variant={inWatchlist ? "default" : "secondary"}
                        onClick={handleWatchlistClick}
                      >
                        <Bookmark
                          className={`mr-2 h-5 w-5 ${
                            inWatchlist ? "fill-current" : ""
                          }`}
                        />
                        {inWatchlist ? "In Watchlist" : "Add to Watchlist"}
                      </Button>
                      <Button
                        size="icon"
                        variant="secondary"
                        className="w-10 h-10"
                        onClick={handleShare}
                      >
                        <Share2 className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
                <motion.div
                  variants={fadeIn}
                  className="flex flex-wrap gap-6 items-center text-sm text-white/80"
                >
                  <div className="flex gap-2 items-center">
                    <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                    <span>{movie.vote_average.toFixed(1)}</span>
                  </div>
                  <div className="flex gap-2 items-center">
                    <Clock className="h-4 w-4" />
                    <span>{movie.runtime} min</span>
                  </div>
                  <div className="flex gap-2 items-center">
                    <CalendarDays className="h-4 w-4" />
                    <span>
                      {new Date(movie.release_date).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                        }
                      )}
                    </span>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {movie.genres.map((genre) => (
                      <Badge
                        key={genre.id}
                        variant="secondary"
                        className="bg-primary/20 hover:bg-primary/30 text-primary-foreground font-medium"
                      >
                        {genre.name}
                      </Badge>
                    ))}
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Mobile Actions */}
        <motion.div
          variants={fadeIn}
          initial="initial"
          animate="animate"
          className="md:hidden flex gap-2 p-4 border-b sticky top-16 bg-background/80 backdrop-blur z-10"
        >
          {videos.length > 0 && (
            <Dialog>
              <Button size="sm" className="flex-1">
                <Play className="mr-2 h-4 w-4" />
                Watch Trailer
              </Button>
              <DialogContent className="max-w-4xl">
                <DialogHeader>
                  <DialogTitle>Trailers & Videos</DialogTitle>
                </DialogHeader>
                <div className="aspect-video">
                  <iframe
                    src={`https://www.youtube.com/embed/${selectedVideo?.key}`}
                    title="YouTube video player"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full rounded-lg"
                  />
                </div>
              </DialogContent>
            </Dialog>
          )}
          <Button
            size="sm"
            variant={inWatchlist ? "default" : "secondary"}
            className="flex-1"
            onClick={handleWatchlistClick}
          >
            <Bookmark className={inWatchlist ? "fill-current" : ""} />
            <span className="ml-2">
              {inWatchlist ? "In Watchlist" : "Add to Watchlist"}
            </span>
          </Button>
          <Button
            size="icon"
            variant="secondary"
            className="w-9 h-9"
            onClick={handleShare}
          >
            <Share2 className="h-4 w-4" />
          </Button>
        </motion.div>

        {/* Content */}
        <div className="container mt-8">
          <Tabs defaultValue="overview" className="space-y-8">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="cast">Cast & Crew</TabsTrigger>
              <TabsTrigger value="similar">Similar Movies</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-8">
              <motion.div
                variants={fadeIn}
                initial="initial"
                animate="animate"
                className="prose prose-lg dark:prose-invert max-w-none"
              >
                <p>{movie.overview}</p>
              </motion.div>

              {crew.length > 0 && (
                <motion.div
                  variants={fadeIn}
                  initial="initial"
                  animate="animate"
                  className="grid grid-cols-1 md:grid-cols-3 gap-8"
                >
                  {crew.map((person) => (
                    <div key={person.id} className="space-y-1">
                      <p className="text-sm text-muted-foreground">
                        {person.job}
                      </p>
                      <p className="font-medium">{person.name}</p>
                    </div>
                  ))}
                </motion.div>
              )}
            </TabsContent>

            <TabsContent value="cast">
              <motion.div
                variants={stagger}
                initial="initial"
                animate="animate"
                className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4"
              >
                {credits.map((credit) => (
                  <motion.div
                    key={credit.id}
                    variants={fadeIn}
                    className="space-y-2"
                  >
                    <div className="aspect-[2/3] rounded-lg overflow-hidden bg-muted">
                      {credit.profile_path ? (
                        <img
                          src={getImageUrl(credit.profile_path, "w500")}
                          alt={credit.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Info className="w-8 h-8 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="space-y-1">
                      <p className="font-medium line-clamp-1">{credit.name}</p>
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {credit.character}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </TabsContent>

            <TabsContent value="similar">
              <motion.div
                variants={stagger}
                initial="initial"
                animate="animate"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6"
              >
                {similarMovies.map((movie) => (
                  <motion.div key={movie.id} variants={fadeIn}>
                    <MovieCard movie={movie} />
                  </motion.div>
                ))}
              </motion.div>
            </TabsContent>
          </Tabs>
        </div>

        <ScrollToTop />
      </motion.div>
    </AnimatePresence>
  );
}
