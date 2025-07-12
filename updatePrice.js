const Web3 = require('web3');
const axios = require('axios');

const web3 = new Web3('https://bsc-dataseed.binance.org/');

const PRIVATE_KEY = 'd850b4a48dc56a050fb58a85497bb18b8fa1914191267647eb78fc46bf501a72';
const account = web3.eth.accounts.privateKeyToAccount(PRIVATE_KEY);
web3.eth.accounts.wallet.add(account);

const ORACLE_ADDRESS = '0x48C5D6870f8c7cbf232D2C2e6190dE4E10737c15';
const ORACLE_ABI = [
  {
    "inputs": [{ "internalType": "uint256", "name": "_price", "type": "uint256" }],
    "name": "setPrice",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

const oracle = new web3.eth.Contract(ORACLE_ABI, ORACLE_ADDRESS);

async function updatePriceFromServer() {
  try {
    const res = await axios.get('http://localhost:3000/price');

    if (!res.data || typeof res.data.price !== 'number') {
      console.error('❌ Invalid price format from server:', res.data);
      return;
    }

    const price = Math.round(res.data.price * 1_000_000);
    console.log(`[${new Date().toLocaleString()}] 📥 Price from server:`, price);

    const tx = oracle.methods.setPrice(price);
    const gas = await tx.estimateGas({ from: account.address });
    const txData = {
      from: account.address,
      to: ORACLE_ADDRESS,
      gas,
      data: tx.encodeABI()
    };

    const receipt = await web3.eth.sendTransaction(txData);
    console.log('✅ Oracle updated. Tx Hash:', receipt.transactionHash);
  } catch (err) {
    console.error('❌ Error:', err.message || err);
  }
}

// اجرای اولیه
updatePriceFromServer();

// اجرای خودکار هر ۵ دقیقه
setInterval(updatePriceFromServer, 5 * 60 * 1000);
