import express from "express";
// import UserController from "../controllers/UserController.js";
var router = express.Router();

/* GET users listing. */
router.get("/", function (req, res, next) {
  res.send("respond with a resource");
});

// router.post("/:id/applyPromo", UserController.useCodePromo);

export default router;
