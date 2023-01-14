const AzureStorage = require('../models/azure-storage')
const storageObject = new AzureStorage(process.env.STORAGE_NAME, process.env.STORAGE_KEY, "test-container")

module.exports = {

  /**
   * Upload blob to storage as base64 string.
   * @param {Request} req 
   * @param {Response} res 
   */
  uploadBlob: async (req, res, next) => {
    try {
      if (!req.body.name || !req.body.data) throw { status: 400, message: "Bad request" }
      await storageObject.uploadBlob(req.body.name, req.body.data)
      return res.status(201).send({ status: 201, message: "Created" })
    } catch (err) {
      if (err && err.status && !isNaN(err.status)) return res.status(err.status).send(err)
      else return res.status(500).send({ status: 500, message: "Internal server error" })
    }
  },

  /**
   * Download blob from storage as base64 string.
   * @param {Request} req 
   * @param {Response} res 
   */
  downloadBlob: async (req, res, next) => {
    try {
      if (!req.query.name) throw { status: 400, message: "Bad request" }
      const data = await storageObject.downloadBlob(req.query.name)
      return res.status(200).send({ status: 200, message: "Ok", data: data })
    } catch (err) {
      if (err && err.status && !isNaN(err.status)) return res.status(err.status).send(err)
      else return res.status(500).send({ status: 500, message: "Internal server error" })
    }
  },

  /**
   * Delete blob from storage.
   * @param {Request} req 
   * @param {Response} res 
   */
  deleteBlob: async (req, res, next) => {
    try {
      if (!req.query.name) throw { status: 400, message: "Bad request" }
      await storageObject.deleteBlob(req.query.name)
      return res.status(200).send({ status: 200, message: "Ok" })
    } catch (err) {
      if (err && err.status && !isNaN(err.status)) return res.status(err.status).send(err)
      else return res.status(500).send({ status: 500, message: "Internal server error" })
    }
  },

  /**
   * Rename blob on storage.
   * @param {Request} req 
   * @param {Response} res 
   */
  renameBlob: async (req, res, next) => {
    try {
      if (!req.query.target || !req.query.name) throw { status: 400, message: "Bad request" }
      await storageObject.renameBlob(req.query.target, req.query.name)
      return res.status(200).send({ status: 200, message: "Ok" })
    } catch (err) {
      if (err && err.status && !isNaN(err.status)) return res.status(err.status).send(err)
      else return res.status(500).send({ status: 500, message: "Internal server error" })
    }
  }

}