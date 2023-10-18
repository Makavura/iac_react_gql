import http from "http";
import cors from "cors";
import express from "express";
import bodyParser from "body-parser";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";

import resolvers from "./resolvers";
import typeDefs from "./models/schema";

const server = new ApolloServer({
  typeDefs,
  resolvers
});
const app = express();
const httpServer = http.createServer(app);

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "OPTIONS, GET, POST, PUT, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

await server.start();
app.use("/graphql", bodyParser.json(), expressMiddleware(server));
httpServer.listen({ port: 4000 });

console.log("🚀 GraphQL API server at http://localhost:4000/graphql");
