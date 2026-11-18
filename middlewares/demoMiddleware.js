import User from "../models/userModel.js";

// The demo admin's email and password are shown on the sign-in page, so every visitor can use them.
// Nobody can edit, demote or delete that one account; otherwise one visitor could change
// its password (or delete it) and lock everyone else out of the demo.
export const DEMO_EMAIL = "admin@example.com";

const keepDemoAccount = async (req, res, next) => {
  try {
    const target = await User.findById(req.params.id).select("email");
    if (target?.email === DEMO_EMAIL) {
      res.status(403);
      return next(new Error("The demo account can't be changed, so every visitor can still sign in with it."));
    }
    next();
  } catch (error) {
    next(error);
  }
};

export default keepDemoAccount;
