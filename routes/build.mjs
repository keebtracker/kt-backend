import express from "express";
import db from "../db/conn.mjs";
import { ObjectId } from "mongodb";

const router = express.Router();

// This section will help you get a list of all the builds.
router.get("/", async (req, res) => {
  let collection = await db.collection("builds-co");
  let results = await collection.find({}).toArray();
  res.send(results).status(200);
});

// This section will help you get a single build by id
router.get("/:id", async (req, res) => {
  let collection = await db.collection("builds-co");
  let query = { _id: new ObjectId(req.params.id) };
  let result = await collection.findOne(query);

  if (!result) res.send("Not found").status(404);
  else res.send(result).status(200);
});

// This section will help you create a new build.
router.post("/", async (req, res) => {
  let newDocument = {
    name: req.body.name,
    descripiton: req.body.descripiton,
    originalBuilder: req.body.originalBuilder,
    partList: req.body.partList,
  };
  let collection = await db.collection("builds-co");
  let result = await collection.insertOne(newDocument);
  res.send(result).status(204);
});

// This section will help you update a build by id.
router.patch("/:id", async (req, res) => {
  const query = { _id: new ObjectId(req.params.id) };
  const updates = {
    $set: {
      name: req.body.name,
      descripiton: req.body.descripiton,
      originalBuilder: req.body.originalBuilder,
      partList: req.body.partList,
    },
  };

  let collection = await db.collection("builds-co");
  let result = await collection.updateOne(query, updates);

  res.send(result).status(200);
});

// This section will help you delete a build
router.delete("/:id", async (req, res) => {
  const query = { _id: new ObjectId(req.params.id) };

  const collection = db.collection("builds-co");
  let result = await collection.deleteOne(query);

  res.send(result).status(200);
});

export default router;
