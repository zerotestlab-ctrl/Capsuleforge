import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.get(api.capsules.list.path, async (req, res) => {
    const caps = await storage.getCapsules();
    res.json(caps);
  });

  app.get(api.capsules.get.path, async (req, res) => {
    const cap = await storage.getCapsule(req.params.id);
    if (!cap) {
      return res.status(404).json({ message: 'Capsule not found' });
    }
    res.json(cap);
  });

  app.post(api.capsules.create.path, async (req, res) => {
    try {
      const input = api.capsules.create.input.parse(req.body);
      const cap = await storage.createCapsule(input);
      res.status(201).json(cap);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      return res.status(500).json({ message: "Internal Server Error" });
    }
  });

  return httpServer;
}
