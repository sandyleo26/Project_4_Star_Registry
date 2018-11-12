const Blockchain = sails.config.globals.simpleChain.Blockchain;

module.exports = async function getBlock(req, res) {
  const myBlockchain = new Blockchain();

  if (await myBlockchain.ready()) {

      const id = parseInt(req.param('id'))
      const curHeight = await myBlockchain.getBlockHeight()

      if (isNaN(id) || id > curHeight) {
        return res.badRequest('block id is not valid')
      }

      const result = await myBlockchain.getBlock(parseInt(id))
      result.body = JSON.parse(result.body)
      result.body.star.storyDecoded = result.body.star.story
      result.body.star.story = Buffer.from(result.body.star.story).toString('hex')
      return res.json(result)
  }
}
