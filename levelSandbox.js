/* ===== Persist data with LevelDB ===================================
|  Learn more: level: https://github.com/Level/level     |
|  =============================================================*/

const level = require('level');
const chainDB = './chaindata';
const db = level(chainDB);

// Add data to levelDB with key/value pair
function addLevelDBData(key, value) {
  return new Promise((resolve, reject) => {
    db.put(key, value, function (err) {
      if (err) {
        console.log('Block ' + key + ' submission failed', err);
        reject(err);
      } else {
        resolve();
      }
    })
  })
};

// Get data from levelDB with key
function getLevelDBData(key) {
  return new Promise((resolve, reject) => {
    db.get(key, function (err, value) {
      if (err) {
        console.log('Not found!', err);
        reject(err);
      } else {
        console.log(`Block #${key} Value = ${value}`);
        resolve(value);
      }
    })
  })
};

// Add data to levelDB with value
function addDataToLevelDB(value) {
  return new Promise((resolve, reject) => {
    let i = -1;
    db.createReadStream().on('data', function (data) {
      i++;
    }).on('error', function (err) {
      console.log('Unable to read data stream!', err)
      reject(err);
    }).on('close', function () {
      const key = i + 1;
      console.log('Added Block #' + key);
      addLevelDBData(key, value)
        .then(resolve)
        .catch(reject);
    });
  })
};

function getBlockCount() {
  return new Promise((resolve, reject) => {
    let i = -1;
    db.createReadStream().on('data', function (data) {
      i++;
    }).on('error', function (err) {
      console.log('Unable to read data stream!', err)
      reject(err);
    }).on('close', function () {
      resolve(i);
    });
  })
}

function findBlocksBy(f) {
  return new Promise((resolve, reject) => {
    const result = [];
    db.createReadStream()
    .on('data', function (data) {
      if (f(data.value)) result.push(data.value);
    })
    .on('error', function (err) {
      reject(err);
    })
    .on('close', function () {
      resolve(result);
    });
  })
}

module.exports = {
  addLevelDBData,
  getLevelDBData,
  addDataToLevelDB,
  getBlockCount,
  findBlocksBy,
}

/* ===== Testing ==============================================================|
|  - Self-invoking function to add blocks to chain                             |
|  - Learn more:                                                               |
|   https://scottiestech.info/2014/07/01/javascript-fun-looping-with-a-delay/  |
|                                                                              |
|  * 100 Milliseconds loop = 36,000 blocks per hour                            |
|     (13.89 hours for 500,000 blocks)                                         |
|    Bitcoin blockchain adds 8640 blocks per day                               |
|     ( new block every 10 minutes )                                           |
|  ===========================================================================*/


// (function theLoop(i) {
//   setTimeout(function () {
//     addDataToLevelDB('Testing data');
//     if (--i) theLoop(i);
//   }, 100);
// })(10);

;(function test() {
  db.createReadStream()
  .on('data', function (data) {
    // console.log('data', data.value)
    const parsed = JSON.parse(data.value)
    console.log('parsed', parsed)
  })
  .on('error', function (err) {
    console.log('err', err)
  })
  .on('close', function () {
    console.log('close')
  })
})();