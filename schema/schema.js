// Mongoose models
const { builds, userParts } = require("../sampleData");
const {
  GraphQLObjectType,
  GraphQLID,
  GraphQLString,
  GraphQLSchema,
  GraphQLList,
} = require("graphql");

const UserPartType = new GraphQLObjectType({
  name: "UserPart",
  fields: () => ({
    id: { type: GraphQLID },
    partId: { type: GraphQLString },
    buildIds: { type: new GraphQLList(GraphQLID) },
    name: { type: GraphQLString },
    datePurchased: { type: GraphQLString },
    purchasedPrice: { type: GraphQLString },
    purchasedFrom: { type: GraphQLString },
  }),
});

const BuildType = new GraphQLObjectType({
  name: "Build",
  fields: () => ({
    id: { type: GraphQLID },
    name: { type: GraphQLString },
    description: { type: GraphQLString },
    originalBuilder: { type: GraphQLString },
    partList: {
      type: new GraphQLList(UserPartType),
      resolve(parent, args) {
        const parts = userParts.filter((part) =>
          part.buildIds.includes(parent.id)
        );
        return parts;
      },
    },
  }),
});

const RootQuery = new GraphQLObjectType({
  name: "RootQueryType",
  fields: {
    userParts: {
      type: new GraphQLList(UserPartType),
      resolve(parent, args) {
        return userParts;
      },
    },
    userPart: {
      type: UserPartType,
      args: { id: { type: GraphQLID } },
      resolve(parent, args) {
        return userParts.find((userPart) => userPart.id === args.id);
      },
    },
    builds: {
      type: new GraphQLList(BuildType),
      resolve(parent, args) {
        return builds;
      },
    },
    build: {
      type: BuildType,
      args: { id: { type: GraphQLID } },
      resolve(parent, args) {
        return builds.find((build) => build.id === args.id);
      },
    },
  },
});

module.exports = new GraphQLSchema({
  query: RootQuery,
});
