const concat = require('concat-stream')
const { Base64Encode } = require('base64-stream')
const { StorageSharedKeyCredential, BlobServiceClient } = require("@azure/storage-blob")

/**
 * @module AzureStorage
 */
module.exports = class AzureStorage {

  /**
   * Constructor for AzureStorage
   * @param {string} accountName 
   * @param {string} accessKey 
   * @param {string} containerName
   */
  constructor(accountName, accessKey, containerName) {
    if (!accountName) throw "Accout name must be defined"
    if (!accessKey) throw "Access key must be defined"
    if (!containerName) throw "Container name must be defined"
    this.#init(accountName, accessKey, containerName)
  }

  /**
   * Initialize object.
   * @param {string} accountName 
   * @param {string} accessKey 
   * @param {string} containerName 
   */
  #init(accountName, accessKey, containerName) {
    this.accountName = accountName
    this.containerName = containerName
    this.credential = new StorageSharedKeyCredential(this.accountName, accessKey)
    this.blobServiceClient = new BlobServiceClient(`https://${this.accountName}.blob.core.windows.net`, this.credentials)
    this.containerServiceClient = this.blobServiceClient.getContainerClient(containerName)
  }
  
  /**
   * Convert readable stream into base64 string.
   * @param {ReadableStream} stream
   * @return {string}
   */
  async #streamToBase64(stream) {
    return new Promise((resolve, reject) => {
      const base64Encode = new Base64Encode()
      stream.pipe(base64Encode).pipe(concat(base64 => {
        resolve(base64)
      })).on('error', err => {
        reject(err)
      })
    })
  }

  /**
   * Upload file to storage as base64 string.
   * @param {string} blobName 
   * @param {string} data
   */
  async uploadBlob(blobName, data) {
    try {
      await this.containerServiceClient.createIfNotExists()
      const blockBlobClient = this.containerServiceClient.getBlockBlobClient(blobName)
      const buffer = Buffer.from(data, 'base64')
      const response = await blockBlobClient.upload(buffer, buffer.byteLength)
      if (response._response.status !== 201) throw { status: response._response.status, message: response.errorCode }
    } catch (err) {
      if (err && err.status) throw err
      throw { status: 500, message: "Internal Server Error" }
    }
  }

  /**
   * Download file from the storage then convert it to base64 string.
   * @param {string} blobName 
   * @return {string}
   */
  async downloadBlob(blobName) {
    try {
      await this.containerServiceClient.createIfNotExists()
      const blockBlobClient = this.containerServiceClient.getBlockBlobClient(blobName)
      const response = await blockBlobClient.download(0)
      if (response._response.status !== 200) throw { status: response._response.status, message: response.errorCode }
      const base64 = await this.#streamToBase64(response.readableStreamBody)
      return base64
    } catch (err) {
      if (err && err.status) throw err
      throw { status: 500, message: "Internal Server Error" }
    }
  }

  /**
   * Delete blob from storage.
   * @param {string} blobName 
   */
  async deleteBlob(blobName) {
    try {
      await this.containerServiceClient.createIfNotExists()
      const blockBlobClient = this.containerServiceClient.getBlockBlobClient(blobName)
      const response = await blockBlobClient.delete()
      if (response._response.status !== 200) throw { status: response._response.status, message: response.errorCode }
    } catch (err) {
      if (err && err.status) throw err
      throw { status: 500, message: "Internal Server Error" }
    }
  }

  /**
   * Duplicate existing blob with a new name, then delete the original blob.
   * @param {string} oldName 
   * @param {string} newName 
   */
  async renameBlob(oldName, newName) {
    try {
      await this.containerServiceClient.createIfNotExists()
      const oldBlockBlobClient = this.containerServiceClient.getBlockBlobClient(oldName)
      const newBlockBlobCLient = this.containerServiceClient.getBlockBlobClient(newName)
      const poller = await newBlockBlobCLient.beginCopyFromURL(oldBlockBlobClient.url)
      const pollerResponse = await poller.pollUntilDone()
      if (pollerResponse._response.status !== 200) throw { status: pollerResponse._response.status, message: pollerResponse.errorCode }
      const deleteResponse = await oldBlockBlobClient.delete()
      if (deleteResponse._response.status !== 200) throw { status: deleteResponse._response.status, message: deleteResponse.errorCode }
    } catch (err) {
      if (err && err.status) throw err
      throw { status: 500, message: "Internal Server Error" }
    }
  }

}