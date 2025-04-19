// src/utils/catchAsync.ts
import { RequestHandler } from "express";

// Ce wrapper prend une fonction async et retourne un RequestHandler Express
const catchAsync = (fn: (...args: any[]) => Promise<any>): RequestHandler => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

export default catchAsync;

