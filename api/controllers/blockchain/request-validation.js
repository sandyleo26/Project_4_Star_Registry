
module.exports = async function requestValidation(req, res) {
  if (!req.body || !req.body.address) {
    return res.badRequest('address is empty')
  }

  return res.json({
    address: req.body.address,
    requestTimeStamp: (new Date()).getTime().toString(),
    message: '',
    validationWindow: '',
  })
}