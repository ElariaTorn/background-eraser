import { ReactCompareSlider, ReactCompareSliderImage } from "react-compare-slider";
import { Download, Trash2, Clock, CheckCircle, AlertTriangle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { Image } from "@shared/schema";
import { useState } from "react";
import { useDeleteImage } from "@/hooks/use-images";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

interface ImageCardProps {
  image: Image;
}

export function ImageCard({ image }: ImageCardProps) {
  const { mutate: deleteImage, isPending: isDeleting } = useDeleteImage();
  const { toast } = useToast();
  const [isHovered, setIsHovered] = useState(false);

  const handleDelete = () => {
    deleteImage(image.id, {
      onSuccess: () => {
        toast({ title: "Deleted", description: "Image removed successfully" });
      },
      onError: () => {
        toast({ variant: "destructive", title: "Error", description: "Failed to delete image" });
      },
    });
  };

  const handleDownload = async () => {
    if (!image.processedUrl) return;
    try {
      const response = await fetch(image.processedUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `removed-bg-${image.id}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (e) {
      toast({ variant: "destructive", title: "Error", description: "Failed to download image" });
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="group relative overflow-hidden rounded-2xl border border-border bg-card shadow-sm hover:shadow-lg transition-all duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="aspect-[4/3] w-full overflow-hidden bg-[url('https://img.ly/static/checkers.png')] bg-repeat">
        {image.status === "completed" && image.processedUrl ? (
          <ReactCompareSlider
            itemOne={
              <ReactCompareSliderImage
                src={image.originalUrl}
                alt="Original"
                className="object-contain h-full w-full"
              />
            }
            itemTwo={
              <ReactCompareSliderImage
                src={image.processedUrl}
                alt="Processed"
                className="object-contain h-full w-full"
              />
            }
            className="h-full w-full"
            position={50}
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center bg-muted/30 p-6 text-center backdrop-blur-sm">
            {image.status === "processing" || image.status === "pending" ? (
              <>
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                <p className="mt-4 text-sm font-medium text-muted-foreground animate-pulse">Processing background...</p>
              </>
            ) : (
              <>
                <AlertTriangle className="h-10 w-10 text-destructive mb-2" />
                <p className="text-sm font-medium text-destructive">Processing failed</p>
              </>
            )}
            <img 
              src={image.originalUrl} 
              alt="Original preview" 
              className="absolute inset-0 -z-10 h-full w-full object-cover opacity-20 blur-sm" 
            />
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            <span>{image.createdAt ? formatDistanceToNow(new Date(image.createdAt), { addSuffix: true }) : 'Just now'}</span>
          </div>
          
          <div className="flex items-center space-x-2">
            {image.status === "completed" && (
              <button
                onClick={handleDownload}
                className="rounded-full p-2 text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                title="Download processed image"
              >
                <Download className="h-4 w-4" />
              </button>
            )}
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="rounded-full p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors disabled:opacity-50"
              title="Delete image"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Status Badge */}
      <div className="absolute top-3 left-3">
        {image.status === "completed" ? (
          <span className="inline-flex items-center rounded-full bg-green-500/10 px-2.5 py-1 text-xs font-medium text-green-600 ring-1 ring-inset ring-green-600/20 backdrop-blur-md bg-white/50">
            <CheckCircle className="mr-1 h-3 w-3" /> Ready
          </span>
        ) : image.status === "failed" ? (
          <span className="inline-flex items-center rounded-full bg-red-500/10 px-2.5 py-1 text-xs font-medium text-red-600 ring-1 ring-inset ring-red-600/20 backdrop-blur-md bg-white/50">
            Failed
          </span>
        ) : null}
      </div>
    </motion.div>
  );
}
