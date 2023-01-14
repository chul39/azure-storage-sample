const express = require("express")
const AzureStorageController = require("./controllers/azure-storage-controller")

const router = express.Router()
router.post("/upload", AzureStorageController.uploadBlob)
router.get("/download", AzureStorageController.downloadBlob)
router.delete("/delete", AzureStorageController.deleteBlob)
router.put("/rename", AzureStorageController.renameBlob)

module.exports = router