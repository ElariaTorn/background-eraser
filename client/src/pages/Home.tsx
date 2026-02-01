import { useImages } from "@/hooks/use-images";
import { ImageCard } from "@/components/ImageCard";
import { Navbar } from "@/components/Navbar";
import { Link } from "wouter";
import { ImagePlus, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Home() {
  const { data: images, isLoading, error } = useImages();

  // Sort images by creation date (newest first)
  const sortedImages = images?.sort((a, b) => {
    return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground sm:text-4xl">Gallery</h1>
            <p className="mt-1 text-muted-foreground">Manage your background removal projects</p>
          </div>
          
          <Link href="/create">
            <button className="btn-primary space-x-2 px-5 py-2.5">
              <ImagePlus className="h-5 w-5" />
              <span>New Project</span>
            </button>
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="aspect-[4/3] animate-pulse rounded-2xl bg-muted/40" />
            ))}
          </div>
        ) : error ? (
          <div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card p-8 text-center">
            <p className="text-lg font-medium text-destructive">Failed to load images</p>
            <p className="text-muted-foreground">Please try refreshing the page</p>
          </div>
        ) : sortedImages?.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex min-h-[500px] flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-gradient-to-b from-card to-background p-8 text-center"
          >
            <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 shadow-inner">
              <Sparkles className="h-12 w-12 text-primary" />
            </div>
            <h3 className="mb-2 text-2xl font-bold tracking-tight text-foreground">No images yet</h3>
            <p className="mb-8 max-w-sm text-muted-foreground">
              Upload an image to magically remove its background instantly.
            </p>
            <Link href="/create">
              <button className="btn-primary space-x-2 px-8 py-3 text-lg">
                <span>Start Creating</span>
              </button>
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <AnimatePresence>
              {sortedImages?.map((image) => (
                <ImageCard key={image.id} image={image} />
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>
    </div>
  );
}
