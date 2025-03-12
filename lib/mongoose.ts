import mongoose, { Mongoose } from "mongoose";

import models from "./api/loadModels";

const { Article, Category, Genre, Topic, User, Account, PostLike } = models;

Article;
Category;
Genre;
Topic;
User;
PostLike;

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
  throw new Error(
    "🚨 Please define the MONGODB_URI environment variable inside .env.local",
  );
}

// Definizione della cache globale per Next.js
interface MongooseCache {
  conn: Mongoose | null;
  promise: Promise<Mongoose> | null;
}

// Dichiarazione globale per evitare connessioni duplicate in Next.js
declare global {
  var mongoose: MongooseCache;
}

// Inizializza la cache globale
let cached = global.mongoose as MongooseCache;

if (!cached) {
  cached = { conn: null, promise: null };
  global.mongoose = cached;
}

const dbConnect = async (): Promise<Mongoose> => {
  if (cached.conn) {
    console.log("✅ Using existing MongoDB connection");
    return cached.conn;
  }

  if (!cached.promise) {
    console.log("🔄 Creating new MongoDB connection...");

    cached.promise = mongoose
      .connect(MONGODB_URI, {
        dbName: "Dev_Overflow", // Assicurati che sia il nome corretto del database
      })
      .then((mongoose) => {
        console.log("✅ Successfully connected to MongoDB");
        return mongoose;
      })
      .catch((err) => {
        console.error("❌ Error connecting to MongoDB:", err);
        throw err;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
};

export default dbConnect;
