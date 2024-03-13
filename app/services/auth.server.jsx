// app/services/auth.server.ts
import { FormStrategy } from "remix-auth-form";
import { Authenticator } from "remix-auth";
import { sessionStorage } from "./session.server";
import { AuthorizationError } from "remix-auth";
import bcrypt from "bcrypt";
import mongoose from "mongoose";
// Create an instance of the authenticator, pass a generic with what
// strategies will return and will store in the session

export let authenticator = new Authenticator(sessionStorage, {
  sessionErrorKey: "sessionErrorKey",
});
authenticator.use(
  new FormStrategy(async ({ form }) => {
    let mail = form.get("mail");
    let password = form.get("password");

    // Find brugeren baseret på e-mail
    const user = await mongoose.models.User.findOne({ email: mail }).select(
      "+password",
    );
    if (!user) {
      throw new AuthorizationError("Bad Credentials");
    }

    // Sammenlign det indtastede password med det hashe password fra databasen
    const match = await bcrypt.compare(password, user.password);

    // Fjern password-feltet fra brugerobjektet
    delete user.password;

    // Tilføj en ekstra betingelse for at kontrollere, om både e-mail og adgangskode matcher
    if (match && user.email === mail) {
      let session = await sessionStorage.commitSession({
        isAuthenticated: true,
        userId: user._id,
      });

      // Returnér brugeren hvis både e-mail og adgangskode matcher sammen med sessionen
      return { user, session };
    } else {
      throw new AuthorizationError("Bad Credentials");
    }
  }),
  "user-pass",
);

export async function hashPassword(password) {
  const saltRounds = 10; // Antallet af salt runder, højere er mere sikkert, men langsommere
  const salt = await bcrypt.genSalt(saltRounds);
  const hash = await bcrypt.hash(password, salt);
  return hash; // Returnér det hashede password
}