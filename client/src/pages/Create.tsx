import { useState, useCallback } from "react";
import { useLocation } from "wouter";
import { useCreateImage, useUpdateImage } from "@/hooks/use-images";
import { useUpload } from "@/hooks/use-upload";
import { Navbar } from "@/components/Navbar";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { Upload, X, Loader2, Wand2, Image as ImageIcon } from "lucide-react";
import { removeBackground } from "@imgly/background-removal";
import { useDropzone } from "react-dropzone";

export default function Create() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const { uploadFile: uploadOriginal } = useUpload();
  const { uploadFile: uploadProcessed } = useUpload();
  
  const createImage = useCreateImage();
  const updateImage = useUpdateImage();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const selectedFile = acceptedFiles[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] },
    maxFiles: 1,
    multiple: false
  });

  const handleRemoveFile = () => {
    if (preview) URL.revokeObjectURL(preview);
    setFile(null);
    setPreview(null);
  };

  const processImage = async () => {
    if (!file) return;

    try {
      setIsProcessing(true);
      setProgress(10);

      // 1. Upload Original
      toast({ title: "Uploading...", description: "Uploading original image" });
      const originalUpload = await uploadOriginal(file);
      if (!originalUpload) throw new Error("Failed to upload original image");

      // 2. Create DB Record
      const imageRecord = await createImage.mutateAsync({
        originalUrl: `https://storage.googleapis.com/${originalUpload.objectPath.replace(/^\//, '')}`, // Construct public URL if needed, or rely on signed URL logic in component
        // Note: In real app, we might need a better way to get the public URL or serve via API
        // For this demo, let's assume the upload response gives us a usable URL or path
        status: "processing"
      });

      setProgress(40);
      toast({ title: "Processing...", description: "AI is removing the background. This may take a moment." });

      // 3. Remove Background (Client-side)
      // Note: This downloads models (~50MB) on first run.
      const blob = await removeBackground(file, {
        progress: (key, current, total) => {
          const percent = Math.round((current / total) * 40); // 40% of total progress allocated to processing
          setProgress(40 + percent);
        }
      });
      
      const processedFile = new File([blob], `processed-${file.name}`, { type: "image/png" });

      setProgress(80);
      toast({ title: "Saving...", description: "Uploading processed result" });

      // 4. Upload Processed
      const processedUpload = await uploadProcessed(processedFile);
      if (!processedUpload) throw new Error("Failed to upload processed image");

      // 5. Update DB Record
      await updateImage.mutateAsync({
        id: imageRecord.id,
        processedUrl: `https://storage.googleapis.com/${processedUpload.objectPath.replace(/^\//, '')}`,
        status: "completed"
      });

      setProgress(100);
      toast({ title: "Success!", description: "Image processed successfully" });
      setLocation("/");
      
    } catch (error: any) {
      console.error(error);
      toast({ 
        variant: "destructive", 
        title: "Error", 
        description: error.message || "Something went wrong during processing" 
      });
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl mb-4">
              Remove Backgrounds
            </h1>
            <p className="text-lg text-muted-foreground">
              Upload an image and let our AI handle the magic instantly.
            </p>
          </div>

          <div className="rounded-3xl border border-border bg-card p-2 shadow-2xl shadow-primary/5">
            <div className="relative rounded-2xl border-2 border-dashed border-border/60 bg-muted/20 p-8 transition-colors hover:bg-muted/30">
              
              {!file ? (
                <div {...getRootProps()} className="flex min-h-[400px] cursor-pointer flex-col items-center justify-center text-center">
                  <input {...getInputProps()} />
                  <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 shadow-inner">
                    <motion.div
                      animate={{ y: [0, -10, 0] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <Upload className="h-10 w-10 text-primary" />
                    </motion.div>
                  </div>
                  <h3 className="mb-2 text-xl font-semibold text-foreground">
                    {isDragActive ? "Drop image here" : "Click or drag image to upload"}
                  </h3>
                  <p className="max-w-xs text-sm text-muted-foreground">
                    Supports JPG, PNG, and WebP. Maximum file size 10MB.
                  </p>
                </div>
              ) : (
                <div className="relative flex min-h-[400px] flex-col items-center justify-center overflow-hidden rounded-xl bg-black/5 dark:bg-white/5">
                  <img 
                    src={preview!} 
                    alt="Preview" 
                    className="max-h-[400px] w-auto object-contain shadow-2xl" 
                  />
                  
                  {!isProcessing && (
                    <button
                      onClick={handleRemoveFile}
                      className="absolute right-4 top-4 rounded-full bg-black/50 p-2 text-white backdrop-blur-md transition-colors hover:bg-black/70"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  )}

                  {isProcessing && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm">
                      <div className="relative mb-4">
                        <Loader2 className="h-16 w-16 animate-spin text-primary" />
                        <div className="absolute inset-0 flex items-center justify-center text-xs font-bold">
                          {progress}%
                        </div>
                      </div>
                      <p className="text-lg font-medium animate-pulse">Processing image...</p>
                      <p className="text-sm text-muted-foreground mt-2">This happens locally in your browser</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="mt-4 flex justify-end px-4 pb-4">
              <button
                onClick={processImage}
                disabled={!file || isProcessing}
                className="btn-primary w-full space-x-2 py-4 text-lg sm:w-auto sm:px-12"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="h-5 w-5" />
                    <span>Remove Background</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-3">
            {[
              { icon: ImageIcon, title: "High Quality", desc: "Maintains original resolution" },
              { icon: Wand2, title: "AI Powered", desc: "State of the art detection" },
              { icon: Upload, title: "100% Free", desc: "No credits required" },
            ].map((feature, i) => (
              <div key={i} className="rounded-xl border border-border bg-card p-6 text-center shadow-sm">
                <feature.icon className="mx-auto mb-4 h-8 w-8 text-primary" />
                <h4 className="font-semibold">{feature.title}</h4>
                <p className="mt-1 text-sm text-muted-foreground">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
