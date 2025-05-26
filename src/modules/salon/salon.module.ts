import { Router } from "express";
import salonRoutes from "./api/salon.route";
import calendarRoutes from "./api/calendar.route";

const SalonModule: { path: string; handler: Router } = {
  path: "/salons",
  handler: salonRoutes,
};

// Ajouter le module calendrier
export const CalendarModule: { path: string; handler: Router } = {
  path: "/calendar",
  handler: calendarRoutes,
};

export default SalonModule;

