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
    buildIdList: {
      type: new GraphQLList(BuildType),
      async resolve(parent, args) {
        try {
          const userPart = await UserPart.findById(parent.id).populate("buildIdList");
          return userPart.buildIdList;
        } catch (err) {
          console.error(err);
        }
      },
    },
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
    partIdList : {
      type: new GraphQLList(UserPartType),
      async resolve(parent, args) {
        try {
          const build = await Build.findById(parent.id).populate("partIdList");
          return build.partIdList ;
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
    // Add UserPart
    addUserPart: {
      type: UserPartType,
      args: {
        name: { type: GraphQLNonNull(GraphQLString) },
        partId: { type: GraphQLString },
        buildIdList: { type: new GraphQLList(GraphQLID) },
        datePurchased: { type: GraphQLString },
        purchasedPrice: { type: GraphQLFloat },
        purchasedFrom: { type: GraphQLString },
      },
      resolve(parent, args) {
        const userPart = new UserPart({
          name: args.name,
          partId: args.partId,
          buildIdList: args.buildIdList,
          datePurchased: args.datePurchased,
          purchasedPrice: args.purchasedPrice,
          purchasedFrom: args.purchasedFrom,
        });

        return userPart.save();
      },
    },

    // Delete UserPart
    deleteUserPart: {
      type: UserPartType,
      args: {
        id: { type: GraphQLNonNull(GraphQLID) },
      },
      async resolve(parent, args) {
        // Get the UserPart that will be deleted
        const userPart = await UserPart.findById(args.id);

        // Remove the userPart from the partIdList  of all builds that have it
        await Build.updateMany(
          { partIdList : userPart._id },
          { $pull: { partIdList : userPart._id } }
        );

        // Delete the userPart
        await UserPart.findByIdAndRemove(args.id);

        return userPart;
      },
    },

    // Update UserPart
    updateUserPart: {
      type: UserPartType,
      args: {
        name: { type: GraphQLString },
        partId: { type: GraphQLString },
        buildIdList: { type: new GraphQLList(GraphQLID) },
        datePurchased: { type: GraphQLString },
        purchasedPrice: { type: GraphQLFloat },
        purchasedFrom: { type: GraphQLString },
      },
      resolve(parent, args) {
        return UserPart.findByIdAndUpdate(
          args.id,
          {
            $set: {
              name: args.name,
              partId: args.partId,
              buildIdList: args.buildIdList,
              datePurchased: args.datePurchased,
              purchasedPrice: args.purchasedPrice,
              purchasedFrom: args.purchasedFrom,
            },
          },
          { new: true }
        );
      },
    },

    // Add Build
    addBuild: {
      type: BuildType,
      args: {
        name: { type: GraphQLNonNull(GraphQLString) },
        description: { type: GraphQLString },
        originalBuilder: { type: GraphQLString },
        partIdList : { type: new GraphQLList(GraphQLID) },
      },
      resolve(parent, args) {
        const build = new Build({
          name: args.name,
          description: args.description,
          originalBuilder: args.originalBuilder,
          partIdList : args.partIdList ,
        });

        return build.save();
      },
    },

    // Delete Build
    deleteBuild: {
      type: BuildType,
      args: {
        id: { type: GraphQLNonNull(GraphQLID) },
      },
      async resolve(parent, args) {
        // Get the build that will be deleted
        const build = await Build.findById(args.id);

        // Remove the build from the buildIdList of all parts that have it
        await UserPart.updateMany(
          { buildIdList: build._id },
          { $pull: { buildIdList: build._id } }
        );

        // Delete the build
        await Build.findByIdAndRemove(args.id);

        return build;
      },
    },

    // Update Build
    updateBuild: {
      type: BuildType,
      args: {
        name: { type: GraphQLString },
        description: { type: GraphQLString },
        originalBuilder: { type: GraphQLString },
        partIdList : { type: new GraphQLList(GraphQLID) },
      },
      resolve(parent, args) {
        return Build.findByIdAndUpdate(
          args.id,
          {
            $set: {
              name: args.name,
              description: args.description,
              originalBuilder: args.originalBuilder,
              partIdList : args.partIdList ,
            },
          },
          { new: true }
        );
      },
    },

    // Add UserPart to Build
    addPartToBuild: {
      type: BuildType,
      args: {
        buildId: { type: GraphQLNonNull(GraphQLID) },
        partId: { type: GraphQLNonNull(GraphQLID) },
      },
      async resolve(parent, args) {
        try {
          // Find the build by ID and update its partList
          const build = await Build.findByIdAndUpdate(args.buildId, { $push: { partIdList: args.partId } }, { new: true });
    
          // Find the part by ID and update its buildList
          await UserPart.findByIdAndUpdate(args.partId, { $push: { buildIdList: args.buildId } });
    
          return build;
        } catch (err) {
          throw new Error(err.message);
        }
      },
    },
  },
});

module.exports = new GraphQLSchema({
  query: RootQuery,
  mutation: mutation,
});
