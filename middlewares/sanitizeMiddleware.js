// Removes every key that starts with "$" from the request body.
// Without it, someone could send {"email": {"$regex": "^a"}} instead of an email,
// and MongoDB would read it as a search command instead of plain text (NoSQL injection).
const stripOperators = (value) => {
  if (Array.isArray(value)) return value.map(stripOperators);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([key]) => !key.startsWith("$"))
        .map(([key, inner]) => [key, stripOperators(inner)])
    );
  }
  return value;
};

const sanitize = (req, res, next) => {
  if (req.body) req.body = stripOperators(req.body);
  next();
};

export { stripOperators };
export default sanitize;
