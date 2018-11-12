var bitcoin = require('bitcoinjs-lib')
var bitcoinMessage = require('bitcoinjs-message')

const WAITING_TIME = 5 * 60 * 1000

module.exports = async function validate(req, res) {
  if (!req.body || !req.body.address || !req.body.signature) {
    return res.badRequest('address or signature is empty')
  }

  const { requestStore } = sails.config.globals;
  const { address, signature } = req.body

  if (!requestStore[address]) {
    return res.badRequest('address is not valid')
  }

  const curTimeStamp = new Date().getTime()
  const validationWindow = requestStore[address] + WAITING_TIME - curTimeStamp
  if (validationWindow < 0) {
    return res.badRequest('validation request expired')
  }

  const message = `${address}:${requestStore[address]}:starRegistry`

  let verifyResult = false
  try {
    verifyResult = bitcoinMessage.verify(message, address, signature)
  } catch (e) {
    console.log('caught error', e)
    verifyResult = false
  }

  return res.json({
    registerStar: true,
    status: {
      address,
      requestTimeStamp: requestStore[address].toString(),
      message,
      validationWindow,
      messageSignature: verifyResult ? 'valid' : 'invalid',
    }
  })
}