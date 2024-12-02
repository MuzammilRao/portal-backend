const Business = require("../model/bussinessModel");
const CatchAsync = require("../utils/CatchAsync");
const AppError = require("../utils/appError");

const createBusiness = CatchAsync(async (req, res, next) => {
  const createdBusiness = await Business.create({
    ...req.body,
    user: req.user._id,
  });
  if (createdBusiness) {
    return res.status(200).json({
      message: "Business Created Successfully",
      data: createdBusiness,
    });
  }
});

const getBusiness = CatchAsync(async (req, res, next) => {
  const business = await Business.findOne({ user: req.user._id });
  if (!business) {
    return next(
      new AppError(`Invalid Id! No data coressponding to this id  ${id}`, 400)
    );
  }
  return res.status(200).json({
    message: "success",
    data: business,
  });
});

const updatebusiness = CatchAsync(async (req, res, next) => {
  const { id } = req.params;

  const updatedBusiness = await Business.findByIdAndUpdate(
    { _id: id },
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!updatedBusiness) {
    return next(
      new AppError(`Invalid Id! No data coressponding to this id  ${id}`, 400)
    );
  }

  return res.status(200).json({
    message: "Business updated successfully",
    data: updatedBusiness,
  });
});
module.exports = { createBusiness, getBusiness, updatebusiness };
