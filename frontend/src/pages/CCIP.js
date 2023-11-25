import ContainerHeader from "../components/ContainerHeader";
import styles from "./CCIP.module.css";
import { formatEther } from "viem";
import { useEffect, useState } from "react";

const CCIP = () => {
  const [bridges, setBridges] = useState([]);

  const loadGraphData = async (network) => {
    const graph =
      "https://api.thegraph.com/subgraphs/name/cemleme/ccfv" + network;

    const query = `query {
      messageSents(first:1000){
        id
        messageId
        voteAmount
        tokenAmount
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
    console.log(result.data);
    const _bridges = result.data.messageSents;
    return _bridges.map((v) => ({ ...v, network }));
  };

  //PROPOSAL VOTES FROM THEGRAPH
  useEffect(() => {
    const loadData = async () => {
      let allBridges = [];
      const allBridgeData = await Promise.all([
        loadGraphData("fuji"),
        loadGraphData("mumbai"),
        loadGraphData("bsc"),
        loadGraphData("optimism"),
      ]);
      allBridgeData.forEach((v) => allBridges.push(...v));
      allBridges = allBridges.sort(
        (a, b) => parseInt(b.blockTimestamp) - parseInt(a.blockTimestamp)
      );
      setBridges(allBridges);
    };
    loadData();
  }, []);

  return (
    <div className={styles.votepage}>
      <ContainerHeader />
      <div className={styles.body}>
        <div className={styles.content}>
          <div className={styles.voters}>
            <b className={styles.votes}>All CCIP Transfers</b>
            <div className={styles.list}>
              <div className={styles.items}>
                {bridges.map((bridge) => (
                  <div key={bridge.id} className={styles.voterrow}>
                    <div>
                      <a
                        className={styles.buttonccip}
                        href={`https://ccip.chain.link/msg/${bridge.messageId}`}
                        target="_blank"
                      >
                        CCIP Explorer
                      </a>
                    </div>
                    <div className={styles.proposalamount}>
                      <b className={styles.address}>Votes:</b>
                      {formatEther(bridge.voteAmount)}
                    </div>
                    <div className={styles.proposalamount}>
                      <b className={styles.address}>CCIP-BnM:</b>
                      {formatEther(bridge.tokenAmount)}
                    </div>
                    <div
                      className={`${styles.network} ${styles[bridge.network]}`}
                    >
                      <b className={styles.name}>{bridge.network}</b>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CCIP;
