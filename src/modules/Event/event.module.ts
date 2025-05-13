import { Router } from "express";
import eventRoutes from "./api/event.routes";

const EventModule: { path: string; handler: Router } = {
  path: "/events",
  handler: eventRoutes,
};

export default EventModule;