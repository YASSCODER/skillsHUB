import { Router } from "express";
import sessionRoutes from "./api/session.route";

const SessionModule: { path: string; handler: Router } = {
  path: "/sessions",
  handler: sessionRoutes,
};

export default SessionModule;
