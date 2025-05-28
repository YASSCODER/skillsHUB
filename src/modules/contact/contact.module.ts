import { Router } from "express";
import contactRoutes from "./api/contact.routes";

const ContactModule = {
  path: "/contact",
  handler: contactRoutes,
};

export default ContactModule;
