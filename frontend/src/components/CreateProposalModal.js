import { TextField, InputAdornment, Icon, IconButton } from "@mui/material";
import { useContractRead, useContractWrite, useAccount } from "wagmi";
import { formatEther, parseEther } from "viem";
import styles from "./CreateProposalModal.module.css";
import { useState } from "react";
import config from "../constants/config";
import masterAbi from "../constants/master.abi";

const CreateProposalModal = ({ onClose }) => {
  const { address } = useAccount();
  const [receiver, setReceiver] = useState("0x");
  const [amount, setAmount] = useState();
  const [title, setTitle] = useState();
  const [description, setDescription] = useState();

  const {
    data: writeData,
    isLoading: writeIsLoading,
    isSuccess,
    write,
  } = useContractWrite({
    address: config[11155111].ccfv,
    abi: masterAbi,
    functionName: "createProposal",
  });

  console.log("writeData", writeData, writeIsLoading, isSuccess);

  const submitCreate = () => {
    console.log(
      receiver,
      parseEther(amount),
      title,
      description,
      data.toString()
    );

    write({
      args: [receiver, parseEther(amount), title, description],
      from: address,
      value: data.toString(),
    });
  };

  const { data, isError, isLoading } = useContractRead({
    address: config[11155111].ccfv,
    abi: masterAbi,
    functionName: "getProposalCost",
  });

  if (!data) return <>Loading...</>;

  return (
    <div className={styles.createproposalmodal}>
      <b className={styles.createproposal}>CREATE PROPOSAL</b>
      <TextField
        className={styles.inputtarget}
        color="success"
        name="target"
        label="Receiver"
        helperText="Enter Receiver Address"
        fullWidth={true}
        variant="outlined"
        type="text"
        value={receiver}
        onChange={(e) => setReceiver(e.target.value)}
      />
      <TextField
        className={styles.inputtarget}
        color="success"
        name="amount"
        label="Amount"
        helperText="Enter Proposal Amount"
        fullWidth={true}
        variant="outlined"
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
      <TextField
        className={styles.inputtarget}
        color="success"
        name="title"
        label="Proposal Title"
        helperText="Enter Proposal Title"
        fullWidth={true}
        variant="outlined"
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <TextField
        className={styles.inputdescription}
        color="primary"
        name="description"
        rows={5}
        label="Proposal Description"
        placeholder="Enter Proposal Description"
        helperText="Enter Proposal Description"
        variant="outlined"
        multiline
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      Cost: {parseFloat(formatEther(data)).toFixed(7)} ETH (0.01 LINK)
      <button
        className={styles.buttoncreate}
        onClick={submitCreate}
        disabled={isSuccess || writeIsLoading}
      >
        <b className={styles.create}>
          {isSuccess ? "Proposal Created" : "Create"}
        </b>
      </button>
    </div>
  );
};

export default CreateProposalModal;
