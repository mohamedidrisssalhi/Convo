import passport from "../lib/passport.js";

const passportAuth = passport.authenticate("jwt", { session: false });

export default passportAuth;
