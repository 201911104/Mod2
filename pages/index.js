import { useState, useEffect } from "react";
import { ethers } from "ethers";
import atm_abi from "../artifacts/contracts/Assessment.sol/Assessment.json";

export default function HomePage() {
  const [ethWallet, setEthWallet] = useState(undefined);
  const [account, setAccount] = useState(undefined);
  const [atm, setATM] = useState(undefined);
  const [balance, setBalance] = useState(undefined);
  const [transactionHistory, setTransactionHistory] = useState([]);
  const [gasPrice, setGasPrice] = useState(undefined);

  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const atmABI = atm_abi.abi;

  // Function to initialize the wallet
  const getWallet = async () => {
    if (window.ethereum) {
      setEthWallet(window.ethereum);
    }

    if (ethWallet) {
      const accounts = await ethWallet.request({ method: "eth_accounts" });
      handleAccount(accounts);
    }
  };

  // Function to handle the connected account
  const handleAccount = (accounts) => {
    const currentAccount = accounts[0];
    if (currentAccount) {
      console.log("Account connected: ", currentAccount);
      setAccount(currentAccount);
    } else {
      console.log("No account found");
    }
  };

  // Function to connect the MetaMask account
  const connectAccount = async () => {
    try {
      if (!ethWallet) {
        alert("MetaMask wallet is required to connect");
        return;
      }

      const accounts = await ethWallet.request({ method: "eth_requestAccounts" });
      handleAccount(accounts);

      // Once the wallet is set, get a reference to the deployed contract
      getATMContract();
    } catch (error) {
      console.error("Error connecting account:", error);
    }
  };

  // Function to get a reference to the deployed contract
  const getATMContract = () => {
    try {
      const provider = new ethers.providers.Web3Provider(ethWallet);
      const signer = provider.getSigner();
      const atmContract = new ethers.Contract(contractAddress, atmABI, signer);

      setATM(atmContract);
    } catch (error) {
      console.error("Error getting ATM contract:", error);
    }
  };

  // Function to get the current balance
  const getBalance = async () => {
    try {
      if (atm) {
        const balance = await atm.getBalance();
        setBalance(balance.toNumber());
      }
    } catch (error) {
      console.error("Error getting balance:", error);
    }
  };

  // Function to handle a deposit transaction
   const deposit = async (amount) => {
    try {
      if (atm) {
        // Validate the amount (you can add additional validation logic)
        if (amount <= 0) {
          console.error("Invalid deposit amount");
          return;
        }

        const gasPrice = await ethWallet.request({ method: "eth_gasPrice" });

        // Set the gas price in Gwei
        setGasPrice(ethers.utils.formatUnits(gasPrice, "gwei"));

        const tx = await atm.deposit(amount, {
          gasPrice: gasPrice,
        });

        await tx.wait();
        getBalance();
        updateTransactionHistory("Deposit", amount);
      }
    } catch (error) {
      console.error("Error depositing:", error);
    }
  };

  // Function to handle a withdrawal transaction with a variable amount
  const withdraw = async (amount) => {
    try {
      if (atm) {
        // Validate the amount (you can add additional validation logic)
        if (amount <= 0) {
          console.error("Invalid withdrawal amount");
          return;
        }

        const gasPrice = await ethWallet.request({ method: "eth_gasPrice" });

        // Set the gas price in Gwei
        setGasPrice(ethers.utils.formatUnits(gasPrice, "gwei"));

        const tx = await atm.withdraw(amount, {
          gasPrice: gasPrice,
        });

        await tx.wait();
        getBalance();
        updateTransactionHistory("Withdraw", amount);
      }
    } catch (error) {
      console.error("Error withdrawing:", error);
    }
  };

  // Function to update the transaction history
  const updateTransactionHistory = (type, amount) => {
    setTransactionHistory([
      ...transactionHistory,
      {
        type: type,
        amount: amount,
        timestamp: new Date().toLocaleString(),
      },
    ]);
  };

  // Function to initialize the user interface
  const initUser = () => {
    // Check if the user has MetaMask
    if (!ethWallet) {
      return <p>Please install MetaMask to use this ATM.</p>;
    }

    // Check if the user is connected. If not, connect to their account
    if (!account) {
      return (
        <button onClick={connectAccount}>
          Please connect your MetaMask wallet
        </button>
      );
    }

    if (balance === undefined) {
      getBalance();
    }

    return (
      <div>
        <p>Your Account: {account}</p>
        <p>Your Balance: {balance} ETH</p>
        <button onClick={() => deposit(1)}>Deposit 1 ETH</button>
        <button onClick={() => withdraw(1)}>Withdraw 1 ETH</button>
         <button onClick={() => deposit(5)}>Deposit 5 ETH</button>
        <button onClick={() => withdraw(5)}>Withdraw 5 ETH</button>
        <p>Gas Price: {gasPrice} Gwei</p>
        <p>Your Transaction History:</p>
        <ul>
          {transactionHistory.map((transaction, index) => (
            <li key={index}>
              {transaction.type} - {transaction.amount} ETH -{" "}
              {transaction.timestamp}
            </li>
          ))}
        </ul>
      </div>
    );
  };

  useEffect(() => {
    getWallet();
  }, []);

  return (
    <main className="container">
      <header>
        <h1>Welcome to the Metacrafters ATM!</h1>
      </header>
      {initUser()}
      <style jsx>{`
        .container {
          text-align: center;
        }
      `}</style>
    </main>
  );
}


