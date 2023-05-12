// Mongoose models
const Build = require("../models/Build");
const UserPart = require("../models/UserPart");

const {
  GraphQLObjectType,
  GraphQLID,
  GraphQLString,
  GraphQLSchema,
  GraphQLList,
  GraphQLNonNull,
  GraphQLFloat,
  GraphQLScalarType,
} = require("graphql");

const { Decimal128 } = require("mongodb");
const { Kind } = require("graphql/language");

// Scalar for allowing GraphQL to use Mongoose Decimal128

const Decimal128Type = new GraphQLScalarType({
  name: "Decimal128",
  description: "Decimal128 scalar type",
  serialize(value) {
    return new Decimal128(value.toString());
  },
  parseValue(value) {
    return new Decimal128(value.toString());
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.STRING || ast.kind === Kind.INT) {
      return new Decimal128(ast.value.toString());
    }
    return null;
  },
});

const DateType = new GraphQLScalarType({
  name: "Date",
  description: "Date custom scalar type",
  serialize(value) {
    // Convert Date to a string for JSON serialization
    return value.toISOString();
  },
  parseValue(value) {
    // Convert incoming string to Date object
    return new Date(value);
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.STRING) {
      // Convert string literal to Date object
      return new Date(ast.value);
    }
    // In case of invalid literal, throw an error
    throw new Error("Invalid Date format.");
  },
});

const UserPartType = new GraphQLObjectType({
  name: "UserPart",
  fields: () => ({
    id: { type: GraphQLID },
    partId: { type: GraphQLString },
    buildIds: { type: new GraphQLList(GraphQLID) },
    name: { type: GraphQLString },
    datePurchased: { type: DateType },
    purchasedPrice: { type: Decimal128Type },
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
      async resolve(parent, args) {
        try {
          const build = await Build.findById(parent.id).populate("partList");
          return build.partList;
        } catch (err) {
          console.error(err);
        }
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
        return UserPart.find();
      },
    },
    userPart: {
      type: UserPartType,
      args: { id: { type: GraphQLID } },
      resolve(parent, args) {
        return UserPart.findById(args.id);
      },
    },
    builds: {
      type: new GraphQLList(BuildType),
      resolve(parent, args) {
        return Build.find();
      },
    },
    build: {
      type: BuildType,
      args: { id: { type: GraphQLID } },
      resolve(parent, args) {
        return Build.findById(args.id);
      },
    },
  },
});

// Mutations
const mutation = new GraphQLObjectType({
  name: "Mutation",
  fields: {
    addUserPart: {
      type: UserPartType,
      args: {
        name: { type: GraphQLNonNull(GraphQLString) },
        partId: { type: GraphQLString },
        buildIds: { type: new GraphQLList(GraphQLID) },
        datePurchased: { type: GraphQLString },
        purchasedPrice: { type: GraphQLFloat },
        purchasedFrom: { type: GraphQLString },
      },
      resolve(parent, args) {
        const userPart = new UserPart({
          name: args.name,
          partId: args.partId,
          buildIds: args.buildIds,
          datePurchased: args.datePurchased,
          purchasedPrice: args.purchasedPrice,
          purchasedFrom: args.purchasedFrom,
        });

        return userPart.save();
      },
    },

    addBuild: {
      type: BuildType,
      args: {
        name: { type: GraphQLNonNull(GraphQLString) },
        description: { type: GraphQLString },
        originalBuilder: { type: GraphQLString },
        partList: { type: new GraphQLList(GraphQLID) },
      },
      resolve(parent, args) {
        const build = new Build({
          name: args.name,
          description: args.description,
          originalBuilder: args.originalBuilder,
          partList: args.partList,
        });

        return build.save();
      },
    },
  },
});

module.exports = new GraphQLSchema({
  query: RootQuery,
  mutation: mutation,
});
