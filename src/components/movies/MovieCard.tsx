import { Link } from "react-router-dom";
import { Star, CalendarDays, Bookmark } from "lucide-react";
import { getImageUrl } from "@/services/tmdb";
import { motion } from "framer-motion";
import { useWatchlist } from "@/contexts/WatchlistContext";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface MovieCardProps {
  movie: {
    id: number;
    title: string;
    poster_path: string;
    overview: string;
    release_date: string;
    vote_average: number;
  };
  className?: string;
}

export function MovieCard({ movie, className }: MovieCardProps) {
  const { addToWatchlist, removeFromWatchlist, isInWatchlist } = useWatchlist();
  const inWatchlist = isInWatchlist(movie.id);

  const handleWatchlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (inWatchlist) {
      removeFromWatchlist(movie.id);
      toast.success("Removed from watchlist");
    } else {
      addToWatchlist(movie);
      toast.success("Added to watchlist");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cn("group relative", className)}
    >
      <Link to={`/movie/${movie.id}`} className="block">
        <div className="relative rounded-xl overflow-hidden bg-card transition-all duration-300 hover:brightness-110 hover:shadow-xl hover:-translate-y-1">
          {/* Poster */}
          <div className="aspect-[2/3] overflow-hidden">
            <motion.img
              src={getImageUrl(movie.poster_path, "w500")}
              alt={movie.title}
              className="w-full h-full object-cover"
              initial={{ scale: 1 }}
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            />
          </div>

          {/* Gradient Overlay - Always visible */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />

          {/* Always Visible Content */}
          <div className="absolute top-2 inset-x-2 flex justify-between items-start">
            {/* Rating */}
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-black/60 backdrop-blur-sm text-white">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="font-semibold text-sm leading-none">
                {movie.vote_average.toFixed(1)}
              </span>
            </div>

            {/* Watchlist Button */}
            <Button
              size="icon"
              variant={inWatchlist ? "default" : "secondary"}
              className={cn(
                "h-9 w-9 bg-black/60 backdrop-blur-sm",
                inWatchlist
                  ? "hover:bg-primary/90 bg-primary text-primary-foreground"
                  : "hover:bg-white/25 text-white"
              )}
              onClick={handleWatchlistClick}
            >
              <Bookmark
                className={cn("h-4 w-4", inWatchlist && "fill-current")}
              />
            </Button>
          </div>

          {/* Bottom Content - Always Visible */}
          <div className="absolute bottom-0 inset-x-0 p-4">
            <h3 className="text-lg font-semibold text-white line-clamp-2 mb-2">
              {movie.title}
            </h3>
            <div className="flex items-center gap-1 text-sm text-white/80">
              <CalendarDays className="w-4 h-4" />
              <span>
                {new Date(movie.release_date).toLocaleDateString("en-US", {
                  year: "numeric",
                })}
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
