import VotesContainer from "../components/VotesContainer";
import ContainerHeader from "../components/ContainerHeader";
import styles from "./AllFunds.module.css";
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

const AllFunds = () => {
  const [funds, setFunds] = useState([]);

  const loadGraphData = async (network) => {
    const graph =
      "https://api.thegraph.com/subgraphs/name/cemleme/ccfv" + network;

    const query = `query {
      providedFunds(first:1000){
        id
        user
        amount
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
      }),
    });

    const result = await results.json();
    const _funds = result.data.providedFunds;
    return _funds.map((v) => ({ ...v, network }));
  };

  //PROPOSAL VOTES FROM THEGRAPH
  useEffect(() => {
    const loadData = async () => {
      let allFunds = [];
      const allFundsData = await Promise.all([
        loadGraphData("sepolia"),
        loadGraphData("fuji"),
        loadGraphData("mumbai"),
        loadGraphData("bsc"),
        loadGraphData("optimism"),
      ]);
      allFundsData.forEach((v) => allFunds.push(...v));
      allFunds = allFunds.sort(
        (a, b) => parseInt(b.blockTimestamp) - parseInt(a.blockTimestamp)
      );
      setFunds(allFunds);
    };
    loadData();
  }, []);

  return (
    <div className={styles.votepage}>
      <ContainerHeader />
      <div className={styles.body}>
        <div className={styles.content}>
          <div className={styles.voters}>
            <b className={styles.votes}>All Time Funds</b>
            <div className={styles.list}>
              <div className={styles.items}>
                {funds.map((fund) => (
                  <div key={fund.id} className={styles.voterrow}>
                    <b className={styles.address}>{fund.user}</b>
                    <div className={styles.proposalamount}>
                      <b className={styles.address}>
                        {formatEther(fund.amount)}
                      </b>
                      CCIP-BnM
                    </div>
                    <div
                      className={`${styles.network} ${styles[fund.network]}`}
                    >
                      <b className={styles.name}>{fund.network}</b>
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

export default AllFunds;
