module.exports = (fn) => {
  return (req, res, next, ...args) => {
    fn(req, res, next, ...args).catch(next);
  };
};
