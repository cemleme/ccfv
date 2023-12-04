import VotesContainer from "../components/VotesContainer";
import ContainerHeader from "../components/ContainerHeader";
import styles from "./VotePage.module.css";
import { useParams } from "react-router-dom";
import {
  sepolia,
  useContractRead,
  useContractWrite,
  useNetwork,
  useAccount,
} from "wagmi";
import config from "../constants/config";
import masterAbi from "../constants/master.abi";
import { formatEther } from "viem";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import nodeAbi from "../constants/node.abi";

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

const VotePage = () => {
  const { id } = useParams();
  const { chain } = useNetwork();
  const { address, isConnecting, isDisconnected } = useAccount();
  const { data: proposal } = useContractRead({
    address: config[sepolia.id].ccfv,
    abi: masterAbi,
    functionName: "proposals",
    chainId: sepolia.id,
    args: [id],
    watch: true,
  });

  const [needsActivating, setNeedsActivating] = useState(false);
  const [activating, setActivating] = useState(false);
  const [canVote, setCanVote] = useState(false);
  const [canProcess, setCanProcess] = useState(false);
  const [proposalData, setProposalData] = useState();
  const [required, setRequired] = useState();
  const [progress, setProgress] = useState();

  const { isLoading: isVoteLoading, write: writeVote } = useContractWrite({
    address: config[chain?.id]?.ccfv,
    abi: chain?.name == "Sepolia" ? masterAbi : nodeAbi,
    functionName: "voteForProposal",
    args: [id],
  });

  const handleVote = () => {
    writeVote();
  };

  const { write: writeProcess } = useContractWrite({
    address: config[sepolia.id]?.ccfv,
    abi: masterAbi,
    functionName: "processQueuedProposal",
    args: [id],
  });

  const handleProcess = () => {
    writeProcess();
  };

  const { data: masterStats } = useContractRead({
    address: config[sepolia.id]?.ccfv,
    abi: masterAbi,
    functionName: "getStats",
    args: [address],
    chainId: sepolia.id,
  });

  const { data: queuePeriod } = useContractRead({
    address: config[sepolia.id]?.ccfv,
    abi: masterAbi,
    functionName: "queuePeriod",
    chainId: sepolia.id,
  });

  const {
    data: currentNetworkStats,
    isError,
    isLoading,
  } = useContractRead({
    address: config[chain?.id]?.ccfv,
    abi: chain?.name == "Sepolia" ? masterAbi : nodeAbi,
    functionName: "getStats",
    args: [address || "0x0000000000000000000000000000000000000000"],
    chainId: chain?.id,
    watch: true,
  });

  const { data: userVoted } = useContractRead({
    address: config[chain?.id]?.ccfv,
    abi: chain?.name == "Sepolia" ? masterAbi : nodeAbi,
    functionName: "userVoted",
    chainId: chain?.id,
    args: [address, id],
    watch: true,
  });

  const {
    isLoading: isActivateLoading,
    isSuccess,
    write: writeActivate,
  } = useContractWrite({
    address: config[chain?.id]?.ccfv,
    abi: nodeAbi,
    functionName: "updateProposalCursors",
    onSuccess(data) {
      setActivating(false);
    },
    onError() {
      setActivating(false);
    },
  });

  const handleActivate = () => {
    setActivating(true);
    writeActivate();
  };

  const { write: writeQueue } = useContractWrite({
    address: config[sepolia.id]?.ccfv,
    abi: masterAbi,
    functionName: "queueProposal",
    args: [id],
  });

  const handleQueue = () => {
    writeQueue();
  };

  useEffect(() => {
    if (chain?.name === "Sepolia") {
      setNeedsActivating(false);
      setCanVote(!userVoted && formatEther(currentNetworkStats[1]) > 0);
      if (proposal)
        setCanProcess(
          proposal[8] && Date.now() / 1000 > proposal[6] + parseInt(queuePeriod)
        );
    } else {
      if (!currentNetworkStats) return;
      const cursorRight = currentNetworkStats[4];
      setNeedsActivating(cursorRight <= parseInt(id));
      setCanVote(
        cursorRight > parseInt(id) &&
          !userVoted &&
          formatEther(currentNetworkStats[1]) > 0
      );
    }
    let _required = (parseFloat(formatEther(masterStats[0])) * 0.7).toFixed(4);
    setRequired(_required);

    let _progress = proposal
      ? Math.floor((100 * parseFloat(formatEther(proposal[4]))) / _required)
      : 0;
    if (_progress > 100) _progress = 100;
    setProgress(_progress);
  }, [userVoted, currentNetworkStats, chain, proposal]);

  //PROPOSAL TITLE AND DESSCRIPTION DATA FROM THEGRAPH
  useEffect(() => {
    if (!id) return;
    const loadData = async () => {
      const graph =
        "https://api.thegraph.com/subgraphs/name/cemleme/ccfvsepolia";

      const query = `query ($pid: String!) {
        proposalCreateds(first:1, where:{proposalId: $pid}) {
            proposalId
            title
            description
        }
      }`;

      let results = await fetch(graph, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          query,
          variables: {
            pid: id,
          },
        }),
      });

      const result = await results.json();
      const _proposal = result.data.proposalCreateds[0];
      setProposalData(_proposal);
    };
    loadData();
  }, [id]);

  if (!proposal) return <></>;

  return (
    <div className={styles.votepage}>
      <ContainerHeader />
      <div className={styles.body}>
        <div className={styles.content}>
          <div className={styles.proposalcard}>
            <div className={styles.frametitle}>
              <b className={styles.id}>#</b>
              <b className={styles.id}>{id}</b>
              <b className={styles.id}>:</b>
              <b className={styles.id}>
                {" "}
                {proposalData?.title ||
                  "Proposal data is being synced, please wait until the sync is complete"}
              </b>
            </div>
            <div className={styles.frameinfo}>
              <div className={styles.col1}>
                <div className={styles.framecreator}>
                  <div className={styles.balanceCcipBnm}>Creator</div>
                  <b className={styles.address}>{proposal[1]}</b>
                </div>
                <div className={styles.framecreator}>
                  <div className={styles.balanceCcipBnm}>Reciever</div>
                  <b className={styles.address}>{proposal[2]}</b>
                </div>
                <div className={styles.framecreator}>
                  <div className={styles.balanceCcipBnm}>Proposed Amount</div>
                  <div className={styles.amount}>
                    <b className={styles.id}>{formatEther(proposal[3])}</b>
                    <div className={styles.ccipBnm}>CCIP-BnM</div>
                  </div>
                </div>

                <div className={styles.framecreator}>
                  <b className={styles.label}>
                    {Date.now() / 1000 < proposal[6] ? "Ends In:" : "Ended:"}
                  </b>
                  <b className={styles.proposalTitle}>
                    {toHoursAndMinutes(
                      Math.abs(proposal[6] - Date.now() / 1000)
                    )}
                  </b>
                </div>
              </div>
              <div className={styles.col1}>
                {!proposal[7] && (
                  <div className={styles.framecreator}>
                    <div className={styles.balanceCcipBnm}>Required Vote</div>
                    <b className={styles.b}>{required}</b>
                  </div>
                )}
                <div className={styles.framecreator}>
                  <div className={styles.balanceCcipBnm}>Votes Received</div>
                  <b className={styles.b}>{formatEther(proposal[4])}</b>
                </div>
                <div className={styles.framecreator}>
                  <div className={styles.progress}>
                    <b className={styles.label}>
                      {proposal[7] ? "100" : progress}%
                    </b>
                    <div
                      className={styles.progressChild}
                      style={{
                        width: (proposal[7] ? "100" : progress) + "%",
                      }}
                    />
                    <div className={styles.progressItem} />
                  </div>
                </div>
              </div>
              <div className={styles.col3}>
                {!userVoted && (
                  <div className={styles.framevotepower}>
                    <div className={styles.balanceCcipBnm}>Your Vote Power</div>
                    <b className={styles.b}>
                      {currentNetworkStats
                        ? formatEther(currentNetworkStats[1])
                        : ""}
                    </b>
                  </div>
                )}
                {userVoted && (
                  <div className={styles.voted}>
                    <b className={styles.vote}>Voted</b>
                  </div>
                )}
                {canVote && !proposal[7] && !proposal[8] && (
                  <button className={styles.buttonvote} onClick={handleVote}>
                    <b className={styles.vote}>
                      {isVoteLoading ? "Voting..." : "Vote For"}
                    </b>
                  </button>
                )}
                {needsActivating && (
                  <button
                    className={styles.buttonactivate}
                    onClick={handleActivate}
                    disabled={activating}
                  >
                    <b className={styles.vote}>
                      {activating ? "Activating" : "Activate"}
                    </b>
                  </button>
                )}
                {chain?.name == "Sepolia" &&
                  !proposal[7] &&
                  !proposal[8] &&
                  progress >= 100 && (
                    <button
                      className={styles.buttonqueue}
                      onClick={handleQueue}
                    >
                      <b className={styles.vote}>Queue</b>
                    </button>
                  )}
                {canProcess && (
                  <button
                    className={styles.buttonactivate}
                    onClick={handleProcess}
                  >
                    <b className={styles.vote}>Process Payment</b>
                  </button>
                )}
                {proposal[7] && (
                  <div className={styles.statussuccess}>
                    <b className={styles.active}>Success</b>
                  </div>
                )}
                {proposal[8] && (
                  <div className={styles.statusqueued}>
                    <b className={styles.active}>Queued</b>
                  </div>
                )}
              </div>
            </div>
            <div className={styles.description}>
              <p className={styles.sedCondimentumDiam}>
                {proposalData?.description ||
                  "Proposal data is being synced, please wait until the sync is complete"}
              </p>
            </div>
          </div>
          <VotesContainer id={id} />
        </div>
      </div>
    </div>
  );
};

export default VotePage;
