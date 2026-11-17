// Lets the request through only if the signed-in user is an admin.
// Use it after `protect`, which loads req.user from the token.
const admin = (req, res, next) => {
  if (req.user && req.user.isAdmin) return next();
  res.status(403);
  throw new Error("Admins only");
};

export default admin;
