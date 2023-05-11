import express from "express";
import cors from "cors";
import "./loadEnvironment.mjs";
import { graphqlHTTP } from "express-graphql"
import schema from "./schema/schema.js"
const PORT = process.env.PORT || 5050;
const app = express();

app.use(cors());
app.use(express.json());
app.use(
  "/graphql",
  graphqlHTTP({
    schema,
    graphiql: true,
  })
);

app.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);
});

