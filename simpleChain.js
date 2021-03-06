/* ===== SHA256 with Crypto-js ===============================
|  Learn more: Crypto-js: https://github.com/brix/crypto-js  |
|  =========================================================*/

const SHA256 = require('crypto-js/sha256');
const DB = require('./levelSandbox');

/* ===== Block Class ==============================
|  Class with a constructor for block 			   |
|  ===============================================*/

class Block {
  constructor(data) {
    this.hash = "",
      this.height = 0,
      this.body = data,
      this.time = 0,
      this.previousBlockHash = ""
  }
}

/* ===== Blockchain Class ==========================
|  Class with a constructor for new blockchain 		|
|  ================================================*/

class Blockchain {
  constructor() {
    this.getBlockHeight()
      .then(height => {
        if (height === -1) this.addGenesisBlock();
      });
  }

  async ready() {
    const curHeight = await this.getBlockHeight();
    if (curHeight === -1) {
      return await new Promise((resolve, reject) => {
        setTimeout(async () => resolve((await this.getBlockHeight) !== -1), 2000);
      })
    }
    return true;
  }

  async addGenesisBlock() {
    const genesisBlock = new Block("First block in the chain - Genesis block");
    genesisBlock.time = new Date().getTime().toString().slice(0, -3);
    genesisBlock.hash = SHA256(JSON.stringify(genesisBlock)).toString();
    await DB.addDataToLevelDB(JSON.stringify(genesisBlock));
  }

  // Add new block
  async addBlock(newBlock) {
    // Block height
    newBlock.height = await this.getBlockHeight();
    if (newBlock.height === -1) {
      await this.addGenesisBlock();
    }
    newBlock.height = (await this.getBlockHeight()) + 1;
    // UTC timestamp
    newBlock.time = new Date().getTime().toString().slice(0, -3);
    // previous block hash
    if (newBlock.height > 0) {
      const previousBlock = await this.getBlock(newBlock.height-1);
      newBlock.previousBlockHash = previousBlock.hash;
    }
    // Block hash with SHA256 using newBlock and converting to a string
    newBlock.hash = SHA256(JSON.stringify(newBlock)).toString();

    // Adding block object to chain
    // this.chain.push(newBlock);
    await DB.addDataToLevelDB(JSON.stringify(newBlock));
  }

  // Get block height
  async getBlockHeight() {
    return await DB.getBlockCount();
  }

  // get block
  async getBlock(blockHeight) {
    // return object as a single string
    // return JSON.parse(JSON.stringify(this.chain[blockHeight]));
    return JSON.parse(await DB.getLevelDBData(blockHeight));
  }

  // find address in body
  async findBlockByAddress(address) {
    const blocks = await DB.findBlocksBy(value => {
      try {
        const parsedValue = JSON.parse(value)
        const parsedBody = JSON.parse(parsedValue.body)
        return parsedBody.address === address
      } catch (e) {
        return false
      }
    })
    return blocks.map(block => JSON.parse(block))
  }

  // find by block hash
  async findBlockByHash(hash) {
    const blocks = await DB.findBlocksBy(value => {
      try {
        const parsedValue = JSON.parse(value)
        return parsedValue.hash === hash
      } catch (e) {
        return false
      }
    })
    return blocks.map(block => JSON.parse(block))
  }

  // validate block
  async validateBlock(blockHeight) {
    // get block object
    let block = await this.getBlock(blockHeight);
    // get block hash
    let blockHash = block.hash;
    // remove block hash to test block integrity
    block.hash = '';
    // generate block hash
    let validBlockHash = SHA256(JSON.stringify(block)).toString();
    // Compare
    if (blockHash === validBlockHash) {
      return true;
    } else {
      console.log('Block #' + blockHeight + ' invalid hash:\n' + blockHash + '<>' + validBlockHash);
      return false;
    }
  }

  // Validate blockchain
  async validateChain() {
    let errorLog = [];
    const chainLength = await this.getBlockHeight()
    for (var i = 0; i <= chainLength - 1; i++) {
      // validate block
      if (!this.validateBlock(i)) errorLog.push(i);
      // compare blocks hash link

      let blockHash = (await this.getBlock(i)).hash;
      let previousHash = (await this.getBlock(i+1)).previousBlockHash;
      if (blockHash !== previousHash) {
        errorLog.push(i);
      }
    }
    if (errorLog.length > 0) {
      console.log('Block errors = ' + errorLog.length);
      console.log('Blocks: ' + errorLog);
    } else {
      console.log('No errors detected');
    }
  }
}

module.exports = {
  Block,
  Blockchain,
}
// (function test(i) {
//   const myBlockChain = new Blockchain();
//   const theLoop = (i) => {
//     setTimeout(function () {
//         let blockTest = new Block("Test Block - " + (i + 1));
//         myBlockChain.addBlock(blockTest).then((result) => {
//             i++;
//             if (i < 10) theLoop(i);
//         });
//     }, 1000);
//   }
  
//   theLoop(i)
//   setTimeout(() => {
//     myBlockChain.validateChain();
//   }, 12000);
// })(0);
