const isAscii = require('is-ascii')
const Blockchain = sails.config.globals.simpleChain.Blockchain;
const Block = sails.config.globals.simpleChain.Block;

const validateReq = req => {
  if (!req.body) return 'request body is empty'
  if (!req.body.address) return 'address of body is empty'
  if (!req.body.star) return 'star of body is empty'
  if (!req.body.star.dec) return 'dec of star is empty'
  if (!req.body.star.ra) return 'ra of star is empty'
  if (!req.body.star.story) return 'story of star is empty'
  if (!isAscii(req.body.star.story)) return 'only ascii text supported for story'
  if (req.body.star.story.length > 500) return 'max length for story is 500 bytes'
  return ''
}

module.exports = async function postBlock(req, res) {
  const validateResult = validateReq(req)
  if (validateResult) {
    return res.badRequest(validateResult)
  }

  const { requestStore } = sails.config.globals
  const { address } = req.body
  if (!requestStore[address] || !requestStore[address].validated) {
    return res.badRequest('You have not validated your address yet')
  }

  const myBlockchain = new Blockchain()
  if (await myBlockchain.ready()) {
    const newBlock = new Block(JSON.stringify(req.body))
    await myBlockchain.addBlock(newBlock)
    newBlock.body = JSON.parse(newBlock.body)
    newBlock.body.star.story = Buffer.from(req.body.star.story).toString('hex')

    // ONLY ONE star is allowed to be registered per validation process
    requestStore[address] = null
    return res.json(newBlock)
  }

  return res.serverError()
}