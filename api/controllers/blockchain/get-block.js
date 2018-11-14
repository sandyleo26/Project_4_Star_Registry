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
      try {
        result.body = JSON.parse(result.body)
        result.body.star.storyDecoded = result.body.star.story
        result.body.star.story = Buffer.from(result.body.star.story).toString('hex')
      } catch (err) {
        console.log('caught err', err)
      }
      return res.json(result)
  }

  return res.serverError()
}
