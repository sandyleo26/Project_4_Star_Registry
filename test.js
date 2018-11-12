const bitcoin = require('bitcoinjs-lib');
const bitcoinMessage = require('bitcoinjs-message')
const axios = require('axios')

const hash = bitcoin.crypto.sha256(Buffer.from('correct horse battery staple'))
const keyPair = bitcoin.ECPair.fromPrivateKey(hash)
const { address } = bitcoin.payments.p2pkh({ pubkey: keyPair.publicKey })
const privateKey = keyPair.privateKey

axios.post('http://localhost:8000/requestValidation', {
  address,
})
.then(res => {
  console.log('\n#################################')
  console.log('requestValidation res', res.data)
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const { message } = res.data
      const signature = bitcoinMessage.sign(message, privateKey, keyPair.compressed).toString('base64')
      return axios.post('http://localhost:8000/message-signature/validate', {
        address,
        signature,
      })
      .then(resolve)
      .catch(reject)
    }, 2000)
  })
})
.then(res => {
  console.log('\n#################################')
  console.log('validate res', res.data)
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      return axios.post('http://localhost:8000/block', {
        address,
        star: {
          "dec": "-26° 29' 24.9",
          "ra": "16h 29m 1.0s",
          "story": "Found star using https://www.google.com/sky/",
        },
      })
      .then(resolve)
      .catch(reject)
    }, 2000)
  })
})
.then(res => {
  console.log('\n#################################')
  console.log('post block', res.data)
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      return axios.get(`http://localhost:8000/block/${res.data.height}`)
      .then(resolve)
      .then(reject)
    }, 2000)
  })
})
.then(res => {
  console.log('\n#################################')
  console.log('search by star block height', res.data)

})
.catch(e => console.log('caught error', e))

// console.log('signature(base64)', signature)
// const verifyResult = bitcoinMessage.verify(message, address, signature)
// console.log('verifyResult', verifyResult)