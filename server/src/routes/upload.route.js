const express = require("express");
const authenticate = require("../middlewares/auth.middleware");
const uploadController = require("../controllers/upload.controller");

const router = express.Router();
router.use(express.json({ limit: "7mb" }));

router.post("/profile", authenticate, uploadController.uploadProfileImage);
router.post("/products/:restaurantId", authenticate, uploadController.uploadProductImage);
router.delete("/", authenticate, uploadController.deleteImage);

module.exports = router;
