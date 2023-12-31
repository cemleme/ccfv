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
import { waitForTransaction } from "@wagmi/core";
import nodeAbi from "../constants/node.abi";
import config from "../constants/config";
import { sepolia } from "viem/chains";
import { useSelector } from "react-redux";

function toHoursAndMinutes(totalSeconds) {
  const totalMinutes = Math.floor(totalSeconds / 60);

  const seconds = Math.floor(totalSeconds % 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  let output = "";
  if (hours > 0) output += hours + " h ";
  if (minutes > 0) output += minutes + " m ";
  if (seconds > 0) output += seconds + " s ";

  return output;
}

const Row = ({ proposal, cursorRight, title, unsynced, requiredVotePower }) => {
  const navigate = useNavigate();
  const { chain } = useNetwork();
  const { address, isConnecting, isDisconnected } = useAccount();
  const [needsActivating, setNeedsActivating] = useState(false);
  const [canVote, setCanVote] = useState(false);
  const [failed, setFailed] = useState(false);
  const [isVoting, setIsVoting] = useState(false);
  const [isActivating, setIsActivating] = useState(false);
  const [isQueuing, setIsQueuing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [canProcess, setCanProcess] = useState(false);
  const stats = useSelector((state) => state.root.stats);

  const { data: userVoted } = useContractRead({
    address: config[chain?.id]?.ccfv,
    abi: chain?.name == "Sepolia" ? masterAbi : nodeAbi,
    functionName: "userVoted",
    chainId: chain?.id,
    args: [address, proposal.id],
    watch: true,
  });

  let progress = Math.floor(
    (100 * parseFloat(formatEther(proposal.votesApproved))) / requiredVotePower
  );
  if (progress > 100) progress = 100;

  useEffect(() => {
    setNeedsActivating(
      chain?.name !== "Sepolia" && cursorRight <= parseInt(proposal.id)
    );
    setCanVote(
      stats[chain?.id]?.userVotePower > 0 &&
        (chain?.name === "Sepolia" || cursorRight > parseInt(proposal.id)) &&
        !userVoted &&
        Date.now() / 1000 < proposal.closeTimestamp
    );
    if (proposal)
      setCanProcess(
        proposal.onQueue &&
          parseInt(Date.now() / 1000) > proposal.closeTimestamp + 86400
      );
    setFailed(
      !proposal.success &&
        !proposal.onQueue &&
        progress < 100 &&
        Date.now() / 1000 > proposal.closeTimestamp
    );
  }, [userVoted, cursorRight, chain, progress, proposal]);

  const onButtonInspectClick = useCallback(() => {
    navigate("/proposals/" + proposal.id);
  }, [navigate]);

  const {
    isLoading: isActivateLoading,
    isSuccess,
    write: writeActivate,
  } = useContractWrite({
    address: config[chain?.id]?.ccfv,
    abi: nodeAbi,
    functionName: "updateProposalCursors",
  });

  const handleActivate = () => {
    writeActivate();
    setIsActivating(true);
  };

  const { write: writeVote } = useContractWrite({
    address: config[chain?.id]?.ccfv,
    abi: chain?.name == "Sepolia" ? masterAbi : nodeAbi,
    functionName: "voteForProposal",
    args: [proposal.id],
    onSuccess(data) {
      onVoteSuccess(data);
    },
  });

  const handleVote = () => {
    writeVote();
    setIsVoting(true);
  };

  const onVoteSuccess = async (data) => {
    const receipt = await waitForTransaction({ hash: data.hash });
  };

  const { write: writeQueue } = useContractWrite({
    address: config[sepolia.id]?.ccfv,
    abi: masterAbi,
    functionName: "queueProposal",
    args: [proposal.id],
  });

  const handleQueue = () => {
    writeQueue();
    setIsQueuing(true);
  };

  const { write: writeProcess } = useContractWrite({
    address: config[sepolia.id]?.ccfv,
    abi: masterAbi,
    functionName: "processQueuedProposal",
    args: [proposal.id],
  });

  const handleProcess = () => {
    writeProcess();
    setIsProcessing(true);
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
            <b className={styles.proposalTitle}>
              {title && title.length > 0 ? title : "|Waiting to sync|"}
            </b>
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
          </div>{" "}
          <div className={styles.rowtop}>
            <b className={styles.label}>
              {Date.now() / 1000 < proposal.closeTimestamp
                ? "Ends In:"
                : "Ended:"}
            </b>
            <b className={styles.proposalTitle}>
              {toHoursAndMinutes(
                Math.abs(proposal.closeTimestamp - Date.now() / 1000)
              )}
            </b>
          </div>
        </div>
      </div>
      <div className={styles.rowstatus}>
        {!proposal.success && Date.now() / 1000 < proposal.closeTimestamp && (
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
        {failed && (
          <div className={styles.successfailed}>
            <b className={styles.active}>Failed</b>
          </div>
        )}
        <div className={styles.progress}>
          <b className={styles.label}>{proposal.success ? "100" : progress}%</b>
          <div
            className={styles.progressChild}
            style={{ width: (proposal.success ? "100" : progress) + "%" }}
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
        {chain?.name == "Sepolia" &&
          !proposal.success &&
          !proposal.onQueue &&
          progress >= 100 && (
            <button
              className={styles.buttonqueue}
              onClick={handleQueue}
              disabled={isQueuing}
            >
              {isQueuing ? "Queuing..." : "Queue"}
            </button>
          )}
        {canProcess &&
          chain?.name == "Sepolia" &&
          proposal.success &&
          proposal.onQueue && (
            <button
              className={styles.buttonprocess}
              onClick={handleProcess}
              disabled={isProcessing}
            >
              <b className={styles.vote}>
                {isProcessing ? "Processing..." : "Process"}
              </b>
            </button>
          )}
        {canVote && (
          <button
            className={styles.buttonvote}
            onClick={handleVote}
            disabled={isVoting}
          >
            <b className={styles.vote}>
              {!isVoting ? "Vote For" : "Voting..."}
            </b>
          </button>
        )}
        {needsActivating && (
          <button
            className={styles.buttonactivate}
            onClick={handleActivate}
            disabled={isActivating}
          >
            <b className={styles.vote}>
              {!isActivating ? "Activate" : "Activating..."}
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
