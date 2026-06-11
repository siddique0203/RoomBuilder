export const requireAuth = (req, res, next) => {
  if (!req.session?.userId) {
    return res.status(401).json({ message: "Please login first" });
  }

  req.user = {
    id: req.session.userId,
    username: req.session.username,
    fullname: req.session.fullname,
    email: req.session.email,
  };

  next();
};