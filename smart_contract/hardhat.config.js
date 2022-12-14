//https://eth-goerli.g.alchemy.com/v2/fXB8eS2shLjk1WPvEtlC5aUbiKDYEsQD

require('@nomiclabs/hardhat-waffle');

module.exports = {
  solidity: '0.8.0',
  networks: {
    goerli: {
      url: 'https://eth-goerli.g.alchemy.com/v2/fXB8eS2shLjk1WPvEtlC5aUbiKDYEsQD',
      accounts: ['183d5fb90872968429048961baf895561626e71843c6aabd51bc5a81eb541c4a']
    }
  }
}
