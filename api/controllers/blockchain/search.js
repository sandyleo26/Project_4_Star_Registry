const Blockchain = sails.config.globals.simpleChain.Blockchain;

const validateReq = req => {
  const method = req.param('method')
  if ((method.startsWith('address:') || method.startsWith('hash:')) && method.split(':').length === 2) return ''
  return 'search method or value not valid'
}

module.exports = async function search(req, res) {
  const validateReqResult = validateReq(req)
  if (validateReqResult) {
    return res.badRequest(validateReqResult)
  }

  const myBlockchain = new Blockchain()
  if (await myBlockchain.ready()) {
    const method = req.param('method')
    
    // search by address
    if (method.startsWith('address:')) {
      const address = method.split(':')[1]
      const result = await myBlockchain.findBlockByAddress(address)
      if (!result) {
        return res.badRequest('no star found for the address')
      }

      result.body.star.storyDecoded = result.body.star.story
      result.body.star.story = Buffer.from(result.body.star.story).toString('hex')
      return res.json(result)
    }

    // search by hash
    const hash = method.split(':')[1]
    const result = await myBlockchain.findBlockByHash(hash)
    if (!result) {
      return res.badRequest('no star found for the hash')
    }

    result.body.star.storyDecoded = result.body.star.story
    result.body.star.story = Buffer.from(result.body.star.story).toString('hex')
    return res.json(result)
  }

  return res.serverError()
}
