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
  });
  const [needsActivating, setNeedsActivating] = useState(false);
  const [canVote, setCanVote] = useState(false);
  const [proposalData, setProposalData] = useState();

  const { isLoading: isVoteLoading, write: writeVote } = useContractWrite({
    address: config[chain.id]?.ccfv,
    abi: chain.name == "Sepolia" ? masterAbi : nodeAbi,
    functionName: "voteForProposal",
    args: [id],
  });

  const handleVote = () => {
    writeVote();
  };

  const { data: masterStats } = useContractRead({
    address: config[sepolia.id]?.ccfv,
    abi: masterAbi,
    functionName: "getStats",
    args: [address],
    chainId: sepolia.id,
  });

  const {
    data: currentNetworkStats,
    isError,
    isLoading,
  } = useContractRead({
    address: config[chain.id]?.ccfv,
    abi: chain.name == "Sepolia" ? masterAbi : nodeAbi,
    functionName: "getStats",
    args: [address],
    chainId: chain.id,
  });

  const { data: userVoted } = useContractRead({
    address: config[chain.id]?.ccfv,
    abi: chain.name == "Sepolia" ? masterAbi : nodeAbi,
    functionName: "userVoted",
    chainId: chain.id,
    args: [address, id],
    watch: true,
  });

  useEffect(() => {
    if (chain.name === "Sepolia") {
      setNeedsActivating(false);
      setCanVote(!userVoted);
    } else {
      const cursorRight = currentNetworkStats[4];
      setNeedsActivating(cursorRight <= formatEther(id));
      setCanVote(cursorRight > formatEther(id) && !userVoted);
    }
  }, [userVoted, currentNetworkStats, chain]);

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
              </div>
              <div className={styles.col2}>
                <div className={styles.framecreator}>
                  <div className={styles.balanceCcipBnm}>Required Vote</div>
                  <b className={styles.b}>
                    {parseFloat(formatEther(masterStats[0])) * 0.7}
                  </b>
                </div>
                <div className={styles.framecreator}>
                  <div className={styles.balanceCcipBnm}>Votes Received</div>
                  <b className={styles.b}>{formatEther(proposal[4])}</b>
                </div>
              </div>
              <div className={styles.col3}>
                <div className={styles.framevotepower}>
                  <div className={styles.balanceCcipBnm}>Your Vote Power</div>
                  <b className={styles.b}>
                    {formatEther(currentNetworkStats[1])}
                  </b>
                </div>
                {userVoted && (
                  <div className={styles.voted}>
                    <b className={styles.vote}>Voted</b>
                  </div>
                )}
                {canVote && (
                  <button className={styles.buttonvote} onClick={handleVote}>
                    <b className={styles.vote}>
                      {isVoteLoading ? "Voting..." : "Vote For"}
                    </b>
                  </button>
                )}
                {needsActivating && (
                  <button className={styles.buttonactivate}>
                    <b className={styles.vote}>Activate</b>
                  </button>
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
