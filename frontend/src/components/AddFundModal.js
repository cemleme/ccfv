import { TextField, InputAdornment, Icon, IconButton } from "@mui/material";
import styles from "./AddFundModal.module.css";
import { useContractRead, useContractWrite, useAccount } from "wagmi";
import { useNetwork } from "wagmi";
import { useState } from "react";
import { formatEther, parseEther } from "viem";
import { erc20ABI } from "wagmi";
import config from "../constants/config";

const AddFundModal = ({ onClose }) => {
  const { chain } = useNetwork();
  const { address, isConnecting, isDisconnected } = useAccount();
  const [amount, setAmount] = useState(1);

  const {
    data: writeData,
    isLoading: writeIsLoading,
    isSuccess,
    write,
  } = useContractWrite({
    address: config[chain.id].ccfv,
    abi: [
      {
        inputs: [
          {
            internalType: "uint256",
            name: "amount",
            type: "uint256",
          },
        ],
        name: "provideFund",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
    ],
    functionName: "provideFund",
  });

  const {
    data: writeApproveData,
    isLoading: writeApproveIsLoading,
    isSuccess: writeApproveIsSuccess,
    write: writeApprove,
  } = useContractWrite({
    address: config[chain.id].token,
    abi: erc20ABI,
    functionName: "approve",
  });

  const {
    data: allowance,
    isError: allowanceError,
    isLoading,
  } = useContractRead({
    address: config[chain.id].token,
    abi: erc20ABI,
    functionName: "allowance",
    args: [address, config[chain.id].ccfv],
    watch: true,
  });

  const {
    data: balance,
    isError: balanceError,
    isLoading: balanceLoading,
  } = useContractRead({
    address: config[chain.id].token,
    abi: erc20ABI,
    functionName: "balanceOf",
    args: [address],
    watch: true,
  });

  const handleAddFund = () => {
    write({
      args: [parseEther(amount.toString())],
      from: address,
    });
  };

  const handleApprove = () => {
    writeApprove({
      args: [config[chain.id].ccfv, parseEther(amount.toString())],
      from: address,
    });
  };

  if (balance == undefined || allowance == undefined) return <>Loading...</>;

  return (
    <div className={styles.addfundmodal}>
      <b className={styles.addfund}>ADD FUND</b>
      <TextField
        className={styles.inputamount}
        color="success"
        name="amount"
        label="Amount"
        helperText="Enter your amount"
        fullWidth={true}
        variant="outlined"
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
      {parseFloat(formatEther(balance)) < parseFloat(amount) &&
        "Not enough balance"}
      {parseFloat(formatEther(allowance)) >= parseFloat(amount) && (
        <button
          className={styles.buttonaddfund}
          onClick={handleAddFund}
          disabled={isSuccess || writeIsLoading}
        >
          <b className={styles.create}>
            {isSuccess ? "Funds Added" : "AddFund"}
          </b>
        </button>
      )}
      {parseFloat(formatEther(allowance)) < parseFloat(amount) && (
        <button className={styles.buttonapprove} onClick={handleApprove}>
          <b className={styles.addFund}>Approve</b>
        </button>
      )}
    </div>
  );
};

export default AddFundModal;
