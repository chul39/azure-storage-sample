const AzureStorage = require('../models/azure-storage')
const storageObject = new AzureStorage(process.env.STORAGE_NAME, process.env.STORAGE_KEY, "test-container")

module.exports = {

  /**
   * Upload blob to storage as base64 string.
   * @param {Request} req 
   * @param {Response} res 
   * @param {Function} next
   */
  uploadBlob: async (req, res, next) => {
    try {
      if (!req.body.name || !req.body.data) throw { status: 400, message: "Bad request" }
      await storageObject.uploadBlob(req.body.name, req.body.data)
      res.status(201).send({ status: 201, message: "Created" })
      next()
      return
    } catch (err) {
      if (err && err.status && !isNaN(err.status)) res.status(err.status).send(err)
      else res.status(500).send({ status: 500, message: "Internal Server Error" })
      next()
      return
    }
  },

  /**
   * Download blob from storage as base64 string.
   * @param {Request} req 
   * @param {Response} res 
   * @param {Function} next
   */
  downloadBlob: async (req, res, next) => {
    try {
      if (!req.query.name) throw { status: 400, message: "Bad Request" }
      const data = await storageObject.downloadBlob(req.query.name)
      res.status(200).send({ status: 200, message: "Ok", data: data })
      next()
      return
    } catch (err) {
      if (err && err.status && !isNaN(err.status)) res.status(err.status).send(err)
      else res.status(500).send({ status: 500, message: "Internal Server Error" })
      next()
      return
    }
  },

  /**
   * Delete blob from storage.
   * @param {Request} req 
   * @param {Response} res 
   * @param {Function} next
   */
  deleteBlob: async (req, res, next) => {
    try {
      if (!req.query.name) throw { status: 400, message: "Bad Request" }
      await storageObject.deleteBlob(req.query.name)
      res.status(200).send({ status: 200, message: "Ok" })
      next()
      return
    } catch (err) {
      if (err && err.status && !isNaN(err.status)) res.status(err.status).send(err)
      else res.status(500).send({ status: 500, message: "Internal Server Error" })
      next()
      return
    }
  },

  /**
   * Rename blob on storage.
   * @param {Request} req 
   * @param {Response} res 
   * @param {Function} next
   */
  renameBlob: async (req, res, next) => {
    try {
      if (!req.query.target || !req.query.name) throw { status: 400, message: "Bad Request" }
      await storageObject.renameBlob(req.query.target, req.query.name)
      res.status(200).send({ status: 200, message: "Ok" })
      next()
      return
    } catch (err) {
      if (err && err.status && !isNaN(err.status)) res.status(err.status).send(err)
      else res.status(500).send({ status: 500, message: "Internal Server Error" })
      next()
      return
    }
  }

}