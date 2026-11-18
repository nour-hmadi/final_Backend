import Activity from "../models/activityModel.js";

// Remembers every successful change an admin makes, so the dashboard can show each admin
// their most frequent actions and everyone the recent changes. It runs after the response is sent,
// so it never slows a request down, and a failure here never breaks the request.
const VERBS = { POST: "create", PUT: "update", DELETE: "delete" };

// "/api/announcements/123" with PUT -> "announcements.update"
export const actionOf = (method, url) => {
  const [, section, second, third] = url.split("?")[0].split("/").filter(Boolean);
  if (section === "user") {
    if (second === "staff") return "user.create-teacher";
    if (third === "admin") return "user.role";
  }
  return `${section}.${VERBS[method]}`;
};

const trackActivity = (req, res, next) => {
  if (VERBS[req.method]) {
    res.on("finish", () => {
      if (res.statusCode < 400 && req.user?.isAdmin) {
        Activity.create({ admin: req.user._id, action: actionOf(req.method, req.originalUrl) }).catch(() => {});
      }
    });
  }
  next();
};

export default trackActivity;
