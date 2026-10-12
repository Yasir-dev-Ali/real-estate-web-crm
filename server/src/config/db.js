import mongoose from "mongoose";

let memoryServer;

export async function connectDb() {
  mongoose.set("strictQuery", true);
  const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/aurelia";
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 2500 });
    console.log("MongoDB connected");
    return "atlas-or-local";
  } catch (err) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("Could not connect to the configured MongoDB database", { cause: err });
    }
    console.warn("Configured MongoDB is unavailable:", err.message);
    console.warn("Starting in-memory MongoDB for local demo…");
    const { MongoMemoryServer } = await import("mongodb-memory-server");
    memoryServer = await MongoMemoryServer.create();
    await mongoose.connect(memoryServer.getUri());
    console.log("In-memory MongoDB ready");
    return "memory";
  }
}

export async function disconnectDb() {
  await mongoose.disconnect();
  if (memoryServer) {
    await memoryServer.stop();
    memoryServer = undefined;
  }
}
