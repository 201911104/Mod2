// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

contract Assessment {
    // Owner of the contract
    address payable public owner;

    // Current balance of the contract
    uint256 public balance;

    // Event emitted when a deposit occurs
    event Deposit(uint256 amount);

    // Event emitted when a withdrawal occurs
    event Withdraw(uint256 amount);

    // Struct to represent a transaction
    struct Transaction {
        string transactionType; // "Deposit" or "Withdraw"
        uint256 amount;         // Amount involved in the transaction
        uint256 timestamp;      // Timestamp of the transaction
    }

    // Array to store transaction history
    Transaction[] public transactionHistory;

    // Constructor to initialize the contract with an initial balance
    constructor(uint initBalance) payable {
        // Set the owner to the address that deployed the contract
        owner = payable(msg.sender);

        // Set the initial balance
        balance = initBalance;
    }

    // Function to get the current balance
    function getBalance() public view returns (uint256) {
        return balance;
    }

    // Function to deposit funds into the contract
    function deposit(uint256 _amount) public payable {
        // Ensure that the caller is the owner
        require(msg.sender == owner, "You are not the owner of this account");

        // Perform the transaction
        balance += _amount;

        // Record the transaction in history
        transactionHistory.push(
            Transaction({
                transactionType: "Deposit",
                amount: _amount,
                timestamp: block.timestamp
            })
        );

        // Emit the Deposit event
        emit Deposit(_amount);
    }

    // Custom error for insufficient balance during withdrawal
    error InsufficientBalance(uint256 balance, uint256 withdrawAmount);

    // Function to withdraw funds from the contract
    function withdraw(uint256 _withdrawAmount) public {
        // Ensure that the caller is the owner
        require(msg.sender == owner, "You are not the owner of this account");

        // Check if the balance is sufficient for withdrawal
        if (balance < _withdrawAmount) {
            revert InsufficientBalance({
                balance: balance,
                withdrawAmount: _withdrawAmount
            });
        }

        // Perform the transaction
        balance -= _withdrawAmount;

        // Record the transaction in history
        transactionHistory.push(
            Transaction({
                transactionType: "Withdraw",
                amount: _withdrawAmount,
                timestamp: block.timestamp
            })
        );

        // Emit the Withdraw event
        emit Withdraw(_withdrawAmount);
    }

    // Function to get the count of transactions in the history
    function getTransactionHistoryCount() public view returns (uint256) {
        return transactionHistory.length;
    }

    // Function to get details of a specific transaction in the history
    function getTransaction(uint256 index) public view returns (string memory transactionType, uint256 amount, uint256 timestamp ) {
        // Ensure the index is within the bounds of the transaction history
        require(index < transactionHistory.length, "Invalid transaction index");

        // Retrieve the transaction at the specified index
        Transaction storage transaction = transactionHistory[index];

        // Return the details of the transaction
        return (
            transaction.transactionType,
            transaction.amount,
            transaction.timestamp
        );
    }
}

