import dotenv from "dotenv";
dotenv.config({ path: ".env" });

import createError from "http-errors";
import express from "express";
import cookieParser from "cookie-parser";
import logger from "morgan";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";
import cors from 'cors';

// rotas
import indexRouter from "./routes/index.js";


// configuração do banco
import connectDB from "./config/database.js";
import usersRouter from "./routes/users.js";
import projectsRouter from "./routes/projects.js";
import setupSwagger from "./swagger.js";
import logsRouter from "./routes/logs.js";
import messagesRouter from "./routes/messages.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// conexão MongoDB local
connectDB();

// middlewares
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors({
  origin: 'http://localhost:4000'
}));

// rotas
app.use('/', indexRouter);
app.use('/api/v1/users', usersRouter);
app.use('/api/v1/projects', projectsRouter);
app.use('/api/v1/logs', logsRouter);
app.use('/api/v1/messages', messagesRouter);

// Swagger
setupSwagger(app);

// rota de teste do log
app.post('/logs', async (req, res) => {
  try {
    const Log = mongoose.model('Log', new mongoose.Schema({
      message: String,
      level: { type: String, default: "info" },
      timestamp: { type: Date, default: Date.now }
    }));

    const log = new Log(req.body);
    await log.save();
    res.status(201).json(log);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// catch 404
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.json({ error: err.message }); // 🔥 devolvendo JSON em vez de view Jade
});

export default app;
