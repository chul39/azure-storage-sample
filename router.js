const express = require("express")
const SampleController = require("./controllers/sample-controller")

const router = express.Router()
router.get("/", SampleController.sampleMethod)

module.exports = router