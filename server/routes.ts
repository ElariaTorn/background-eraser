import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { registerObjectStorageRoutes } from "./replit_integrations/object_storage";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Register Object Storage routes
  registerObjectStorageRoutes(app);

  app.get(api.images.list.path, async (req, res) => {
    const images = await storage.getImages();
    res.json(images);
  });

  app.get(api.images.get.path, async (req, res) => {
    const image = await storage.getImage(Number(req.params.id));
    if (!image) {
      return res.status(404).json({ message: 'Image not found' });
    }
    res.json(image);
  });

  app.post(api.images.create.path, async (req, res) => {
    try {
      const input = api.images.create.input.parse(req.body);
      const image = await storage.createImage(input);
      res.status(201).json(image);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.patch(api.images.update.path, async (req, res) => {
    try {
      const input = api.images.update.input.parse(req.body);
      const image = await storage.updateImage(Number(req.params.id), input);
      res.json(image);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      // Check for not found error from storage if necessary, or just catch generic
      return res.status(404).json({ message: 'Image not found' });
    }
  });

  app.delete(api.images.delete.path, async (req, res) => {
    await storage.deleteImage(Number(req.params.id));
    res.status(204).end();
  });

  return httpServer;
}
