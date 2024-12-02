const express = require("express");
const router = express.Router();
const {
  createBusiness,
  getBusiness,
  updatebusiness,
} = require("../controller/businessController");
const authMiddleware = require("../middleware/authMiddleware");

// create business
router
  .route("/")
  .post(authMiddleware, createBusiness)
  .get(authMiddleware, getBusiness);

// get business

router.route("/:id").patch(updatebusiness);

// get all businesses
// router.route("/").get(getbusiness);

module.exports = router;
