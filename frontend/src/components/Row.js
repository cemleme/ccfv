import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Row.module.css";
import { formatEther } from "viem";
import {
  useAccount,
  useContractRead,
  useNetwork,
  useContractWrite,
} from "wagmi";
import masterAbi from "../constants/master.abi";
import nodeAbi from "../constants/node.abi";
import config from "../constants/config";

const Row = ({ proposal, cursorRight, title, unsynced, requiredVotePower }) => {
  const navigate = useNavigate();
  const { chain } = useNetwork();
  const { address, isConnecting, isDisconnected } = useAccount();
  const [needsActivating, setNeedsActivating] = useState(false);
  const [canVote, setCanVote] = useState(false);

  const { data: userVoted } = useContractRead({
    address: config[chain.id].ccfv,
    abi: chain.name == "Sepolia" ? masterAbi : nodeAbi,
    functionName: "userVoted",
    chainId: chain.id,
    args: [address, proposal.id],
    watch: true,
  });

  let progress = Math.floor(
    (100 * parseFloat(formatEther(proposal.votesApproved))) / requiredVotePower
  );
  if (progress > 100) progress = 100;

  useEffect(() => {
    setNeedsActivating(
      chain.name !== "Sepolia" && cursorRight <= formatEther(proposal.id)
    );
    setCanVote(
      (chain.name === "Sepolia" || cursorRight > formatEther(proposal.id)) &&
        !userVoted
    );
  }, [userVoted, cursorRight, chain]);

  const onButtonInspectClick = useCallback(() => {
    navigate("/vote/" + proposal.id);
  }, [navigate]);

  const {
    isLoading: isActivateLoading,
    isSuccess,
    write: writeActivate,
  } = useContractWrite({
    address: config[chain.id].ccfv,
    abi: nodeAbi,
    functionName: "updateProposalCursors",
  });

  const handleActivate = () => {
    writeActivate();
  };

  const { isLoading: isVoteLoading, write: writeVote } = useContractWrite({
    address: config[chain.id].ccfv,
    abi: chain.name == "Sepolia" ? masterAbi : nodeAbi,
    functionName: "voteForProposal",
    args: [proposal.id],
  });

  const handleVote = () => {
    writeVote();
  };

  return (
    <div className={styles.row}>
      <div className={styles.rowleft}>
        <div className={styles.rowtop}>
          <div className={styles.rowtop}>
            <b className={styles.label}>#:</b>
            <b className={styles.proposalTitle}>{parseInt(proposal.id)}</b>
          </div>
          <div className={styles.rowtop}>
            <b className={styles.label}>Title:</b>
            <b className={styles.proposalTitle}>{title}</b>
          </div>
        </div>
        <div className={styles.rowtop}>
          <div className={styles.rowtop}>
            <b className={styles.label}>Receiver:</b>
            <b className={styles.proposalTitle}>{proposal.target}</b>
          </div>
        </div>
        <div className={styles.rowtop}>
          <div className={styles.rowtop}>
            <b className={styles.label}>Amount:</b>
            <b className={styles.proposalTitle}>
              {formatEther(proposal.amount)}
            </b>
          </div>
        </div>
      </div>

      <div className={styles.rowstatus}>
        {Date.now() - proposal.closeTimestamp > 0 && (
          <div className={styles.statusongoing}>
            <b className={styles.active}>Ongoing</b>
          </div>
        )}
        {unsynced && (
          <div className={styles.statuswaitingvotes}>
            <b className={styles.active}>CCIP</b>
          </div>
        )}
        {proposal.success && (
          <div className={styles.statussuccess}>
            <b className={styles.active}>Success</b>
          </div>
        )}
        {proposal.onQueue && (
          <div className={styles.statusqueued}>
            <b className={styles.active}>Queued</b>
          </div>
        )}
        {(!proposal.success || !proposal.onQueue) &&
          Date.now() < proposal.closeTimestamp && (
            <div className={styles.successfailed}>
              <b className={styles.active}>Failed</b>
            </div>
          )}
        <div className={styles.progress}>
          <b className={styles.label}>{progress}%</b>
          <div
            className={styles.progressChild}
            style={{ width: progress + "%" }}
          />
          <div className={styles.progressItem} />
        </div>
      </div>
      <div className={styles.rowright}>
        {userVoted && (
          <div className={styles.statusvoted}>
            <b className={styles.active}>Voted</b>
          </div>
        )}
        {canVote && (
          <button className={styles.buttonvote} onClick={handleVote}>
            <b className={styles.vote}>Vote For</b>
          </button>
        )}
        {needsActivating && (
          <button className={styles.buttonactivate} onClick={handleActivate}>
            <b className={styles.vote}>
              {!isActivateLoading ? "Activate" : "Activating..."}
            </b>
          </button>
        )}
        <button className={styles.buttonvote} onClick={onButtonInspectClick}>
          <b className={styles.vote}>Inspect</b>
        </button>
      </div>
    </div>
  );
};

export default Row;
