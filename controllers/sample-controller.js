const SampleModel = require('../models/sample-model')

module.exports = {

  sampleMethod: async (req, res, next) => {
    const model = new SampleModel()
    const text = model.sampleMethod()
    res.status(200).send(text)
    next()
  }

}