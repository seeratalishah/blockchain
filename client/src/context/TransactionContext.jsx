import React from 'react';
import { ethers } from 'ethers';
import { contractABI, contractAddress } from '../utils/constants';
import { useEffect } from 'react';
import { useState } from 'react';


const initialState = {
    addressTo: '',
    amount: '',
    keyword: '',
    message: ''
}


export const TransactionContext = React.createContext();

const { ethereum } = window;

const getEthereumContract = () => {
    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner();
    const transactionContract = new ethers.Contract(contractAddress, contractABI, signer);

    return transactionContract
}

export const TransactionProvider = ({ children }) => {

    const [currentAccount, setCurrentAccount] = useState('');
    const [formData, setFormData] = useState(initialState);
    const [loading, setLoading] = useState(false);
    const [transactionCount, setTransactionCount] = useState(localStorage.getItem("transactionCount"));
    const [transactions, setTransactions] = useState([]);

    const handleChange = (e, name) => {
        setFormData((prevState)=>({...prevState, [name]: e.target.value}))
    }

    const getAllTransactions = async () => {
        try {
            if(!ethereum) return alert("please install metamask");
            const transactionContract = getEthereumContract();
            const availableTransactions = await transactionContract.getAllTransactions();
            const structuredTransactions = availableTransactions.map((transaction)=> ({
                addressTo: transaction.reciever,
                addressFrom: transaction.sender,
                timestamp: new Date(transaction.timestamp.toNumber() * 1000).toLocaleString(),
                message: transaction.message,
                keyword: transaction.keyword,
                amount: parseInt(transaction.amount._hex / (10 ** 18))
            }));
            console.log(structuredTransactions)
            setTransactions(structuredTransactions)
        } catch (error) {
            console.log(error)
        }
    }

    const checkIfWalletIsConnected = async () => {
        try {
            if(!ethereum) return alert("please install metamask");

        const accounts = await ethereum.request({ method: 'eth_accounts' });

        if(accounts.length) {
            setCurrentAccount(accounts[0]);

            getAllTransactions();
        }
        else {
            console.log("No accounts found")
        }
        console.log(accounts);
        } catch (error) {
            console.log(error);

            throw new Error("No ethereum object")
        }
    }

    const checkIfTransactionsExits = async () => {
        try {
            const transactionContract = getEthereumContract();
            const transactionCount = transactionContract.getTransactionCount();

            window.localStorage.getItem("transactionCount", transactionCount)
        } catch (error) {
            console.log(error);

            throw new Error("No ethereum object")
        }
    }

    const connectWallet = async () => {
        try {
            if(!ethereum) return alert("please install metamask");

            const accounts = await ethereum.request({ method: 'eth_requestAccounts' });

            setCurrentAccount(accounts[0]);
        } catch (error) {
            console.log(error);

            throw new Error("No ethereum object")
        }
    }

    const sendTransaction = async () => {
        try {
            if(!ethereum) return alert("please install metamask");

            const { addressTo, amount, keyword, message } = formData;
            const transactionContract = getEthereumContract();
            const parsedAmount = ethers.utils.parseEther(amount);

            await ethereum.request({
                method: 'eth_sendTransaction',
                params: [{
                    from: currentAccount,
                    to: addressTo,
                    gas: '0x5208', //21000 GWEI
                    value: parsedAmount._hex //0.00001
                }],
            });

           const transactionHash = await transactionContract.addToBloackchain(addressTo, parsedAmount, message, keyword);

           setLoading(true);
           console.log(`Loading - ${transactionHash}`)
           await transactionHash.wait();

           setLoading(false);
           console.log(`Success - ${transactionHash}`)

           const transactionCount = transactionContract.getTransactionCount();

           setTransactionCount(transactionCount.toNumber())
        } catch (error) {
            console.log(error);

            throw new Error("No ethereum object")
        }
    }

    useEffect(()=>{
        checkIfWalletIsConnected();
        checkIfTransactionsExits();
    },[])

    return (
        <TransactionContext.Provider value={{ connectWallet, currentAccount, formData, setFormData, handleChange, sendTransaction, transactions, loading }}>
            {children}
        </TransactionContext.Provider>

    )

}