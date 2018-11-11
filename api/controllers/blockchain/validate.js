
module.exports = async function validate(req, res) {
  if (!req.body || !req.body.address || !req.body.signature) {
    return res.badRequest('address or signature is empty')
  }

  return res.json({
    registerStar: true,
    status: {
      address: '',
      requestTimeStamp: (new Date()).getTime().toString(),
      message: '',
      validationWindow: '',
      messageSignature: '',
    }
  })
}