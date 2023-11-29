import { sepolia, useContractRead, useAccount, useNetwork } from "wagmi";
import Row from "../components/Row";
import masterAbi from "../constants/master.abi";
import styles from "./Proposals.module.css";
import config from "../constants/config";
import { formatEther } from "viem";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";

const Proposals = () => {
  const { chain } = useNetwork();
  const { address, isConnecting, isDisconnected } = useAccount();
  const [proposalData, setProposalData] = useState();
  const stats = useSelector((state) => state.root.stats);
  const unsyncedIds = useSelector((state) => state.root.unsyncedIds);

  const { data: cursorRight } = useContractRead({
    address: config[sepolia.id].ccfv,
    abi: masterAbi,
    functionName: "proposalCursorRight",
    chainId: sepolia.id,
  });

  const {
    data: proposals,
    isError,
    isLoading,
  } = useContractRead({
    address: config[sepolia.id].ccfv,
    abi: masterAbi,
    functionName: "getProposals",
    chainId: sepolia.id,
    args: [0, 20],
    watch: true,
  });

  //PROPOSAL TITLE AND DESSCRIPTION DATA FROM THEGRAPH
  useEffect(() => {
    const loadData = async () => {
      const graph =
        "https://api.thegraph.com/subgraphs/name/cemleme/ccfvsepolia";

      const query = `query {
        proposalCreateds(first:1000) {
            proposalId
            title
        }
      }`;

      let results = await fetch(graph, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          query,
        }),
      });

      const result = await results.json();
      const _proposals = result.data.proposalCreateds;
      setProposalData(_proposals);
    };
    loadData();
  }, []);

  if (!proposals || !stats) return <></>;
  return (
    <div className={styles.proposals}>
      <b className={styles.proposals1}>Proposals</b>
      <div className={styles.list}>
        <div className={styles.list}>
          {proposals && proposals.map((p) => (
            <Row
              key={p.id}
              proposal={p}
              title={
                proposalData
                  ? proposalData.find(
                      (_p) => parseInt(_p.proposalId) === parseInt(p.id)
                    )?.title
                  : ""
              }
              requiredVotePower={stats[sepolia.id]?.totalVotePower * 0.7}
              unsynced={unsyncedIds.includes(parseInt(p.id))}
              cursorRight={stats[chain?.id]?.cursorRight}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Proposals;
