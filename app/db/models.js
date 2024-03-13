import mongoose from "mongoose";

const { Schema } = mongoose;

const eventSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: [
        "conference",
        "workshop",
        "networking",
        "social",
        "fundraiser",
        "webinar",
        "party",
        "concert",
        "sports",
        "educational",
      ],
      required: true,
    },
    location: {
      name: String,
      address: String,
      city: String,
      country: String,
    },
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
      required: true,
    },
    organizer: {
      type: String,
      required: true,
    },
    guests: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    capacity: {
      type: Number,
      // ikke krævet, da ikke alle events har en deltagerbegrænsning
    },
    price: {
      type: Number,
      // Kan være gratis, så ikke krævet
    },
    imageUrl: {
      type: String,
      // Ikke alle events har nødvendigvis et billede
    },
    registrationsCount: {
      type: Number,
      default: 0, // Starter med 0 og opdateres efter behov
    },
  },
  { timestamps: true },
);

// users
const userSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    role: {
      type: String,
      enum: ["user", "admin", "disabled", "superadmin"],
      default: "user",
    },
    personalInfo: {
      name: {
        type: String,
        default: "",
      },
      age: {
        type: Number,
        default: 0,
      },
      city: {
        type: String,
        default: "",
      },
    },
    registeredEvents: [
      {
        type: Schema.Types.ObjectId,

        ref: "Events", // Refererer til event collection
      },
    ],
    createdEvents: [
      {
        type: Schema.Types.ObjectId,
        ref: "Events", // Dette felt vil indeholde ID'er på events, en admin-bruger har oprettet
      },
    ],
  },
  { timestamps: true },
);

export const Events = mongoose.model("Events", eventSchema);
export const User = mongoose.model("Users", eventSchema);

export const models = [
  {
    name: "Events",
    schema: eventSchema,
    collection: "events",
  },
  {
    name: "User",
    schema: userSchema,
    collection: "users",
  },
];
