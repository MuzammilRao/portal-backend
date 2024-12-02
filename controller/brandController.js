const Brand = require('../model/brandModel');
const User = require('../model/userModel');
const APIFeatures = require('../utils/APIFeatures');
const CatchAsync = require('../utils/CatchAsync');

exports.getAllBrands = CatchAsync(async (req, res, next) => {
  let user = await User.findById(req.user._id).populate('brands');

  const brands = user.brands;

  return res.status(200).json({
    status: 'success',
    results: brands.length,
    data: brands,
  });
});
