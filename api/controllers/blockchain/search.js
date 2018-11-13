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
      const blocks = await myBlockchain.findBlockByAddress(address)
      if (blocks.length === 0) {
        return res.badRequest('no star found for the address')
      }

      const result = blocks.map(block => {
        block.body = JSON.parse(block.body)
        block.body.star.storyDecoded = block.body.star.story
        block.body.star.story = Buffer.from(block.body.star.story).toString('hex')
        return block
      })
      return res.json(result)
    }

    // search by hash
    const hash = method.split(':')[1]
    const blocks = await myBlockchain.findBlockByHash(hash)
    if (blocks.length === 0) {
      return res.badRequest('no star found for the hash')
    }

    const result = blocks.map(block => {
      block.body = JSON.parse(block.body)
      block.body.star.storyDecoded = block.body.star.story
      block.body.star.story = Buffer.from(block.body.star.story).toString('hex')
      return block
    })
    return res.json(result[0])
  }

  return res.serverError()
}
