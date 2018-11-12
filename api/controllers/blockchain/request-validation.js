// miliseconds
const WAITING_TIME = 5 * 60 * 1000

const newResponse = (address, timestamp, validationWindow) => {
  const res = {
    address,
    requestTimeStamp: timestamp.toString(),
    message: `${address}:${timestamp}:starRegistry`,
    validationWindow,
  }
  return res
}

module.exports = async function requestValidation(req, res) {
  if (!req.body || !req.body.address) {
    return res.badRequest('address is empty')
  }

  const { requestStore } = sails.config.globals
  const { address } = req.body
  const curTimeStamp = new Date().getTime()

  if (requestStore[address]) {
    const validationWindow = requestStore[address].requestTimeStamp + WAITING_TIME - curTimeStamp

    // still valid
    if (validationWindow > 0) {
      return res.json(newResponse(address, requestStore[address].requestTimeStamp, Math.floor(validationWindow / 1000)))
    }
  }

  requestStore[address] = {
    requestTimeStamp: curTimeStamp,
    validated: false,
  }
  return res.json(newResponse(address, curTimeStamp, Math.floor(WAITING_TIME / 1000)))
}