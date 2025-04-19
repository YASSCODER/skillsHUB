import { Router } from "express";
import salonRoutes from "./api/salon.route";

const SalonModule: { path: string; handler: Router } = {
  path: "/salons",
  handler: salonRoutes,
};

export default SalonModule;

