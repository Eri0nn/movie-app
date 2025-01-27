import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getMovieVideos } from "@/services/tmdb";

interface TrailerModalProps {
  movieId: number;
  title: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TrailerModal({
  movieId,
  title,
  open,
  onOpenChange,
}: TrailerModalProps) {
  const [trailerKey, setTrailerKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrailer = async () => {
      if (!open) return;
      try {
        setLoading(true);
        const response = await getMovieVideos(movieId.toString());
        const videos = response.data.results;
        const trailer =
          videos.find(
            (video: any) => video.type === "Trailer" && video.site === "YouTube"
          ) || videos[0];
        setTrailerKey(trailer?.key || null);
      } catch (error) {
        console.error("Error fetching trailer:", error);
        setTrailerKey(null);
      } finally {
        setLoading(false);
      }
    };

    fetchTrailer();
  }, [movieId, open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="aspect-video">
          {loading ? (
            <div className="flex justify-center items-center w-full h-full bg-muted">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : trailerKey ? (
            <iframe
              width="100%"
              height="100%"
              src={`https://www.youtube.com/embed/${trailerKey}`}
              title={`${title} Trailer`}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          ) : (
            <div className="flex justify-center items-center w-full h-full bg-muted">
              <p className="text-muted-foreground">No trailer available</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
