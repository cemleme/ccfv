import { useEffect, useState } from "react";
import styles from "./VotesContainer.module.css";
import { formatEther } from "viem";

const VotesContainer = ({ id }) => {
  const [votes, setVotes] = useState([]);

  const loadGraphData = async (network) => {
    const graph =
      "https://api.thegraph.com/subgraphs/name/cemleme/ccfv" + network;

    const query = `query ($pid: String!) {
      votedFors(first:1000, where:{proposalId: $pid}){
        id
        user
        votePower
        blockTimestamp
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
    const _votes = result.data.votedFors;
    return _votes.map((v) => ({ ...v, network }));
  };

  //PROPOSAL VOTES FROM THEGRAPH
  useEffect(() => {
    if (!id) return;
    const loadData = async () => {
      const allVotes = [];
      const allVotesData = await Promise.all([
        loadGraphData("sepolia"),
        loadGraphData("fuji"),
        loadGraphData("mumbai"),
      ]);
      allVotesData.forEach((v) => allVotes.push(...v));
      setVotes(allVotes);
    };
    loadData();
  }, [id]);

  return (
    <div className={styles.voters}>
      <b className={styles.votes}>Votes</b>
      <div className={styles.list}>
        <div className={styles.items}>
          {votes.map((vote) => (
            <div key={vote.id} className={styles.voterrow}>
              <b className={styles.address}>{vote.user}</b>
              <div className={styles.proposalamount}>
                <b className={styles.label}>Vote:</b>
                <b className={styles.address}>{formatEther(vote.votePower)}</b>
              </div>
              <div className={`${styles.network} ${styles[vote.network]}`}>
                <b className={styles.name}>{vote.network}</b>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VotesContainer;
