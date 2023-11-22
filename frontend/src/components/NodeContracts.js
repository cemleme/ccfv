import NodeCard from "./NodeCard";
import styles from "./NodeContracts.module.css";
import {
  avalancheFuji,
  polygonMumbai,
  bscTestnet,
  optimismGoerli,
  baseGoerli,
} from "viem/chains";

const NodeContracts = () => {
  return (
    <div className={styles.frameParent}>
      <div className={styles.nodecardParent}>
        <NodeCard targetChain={avalancheFuji} />
        <NodeCard targetChain={polygonMumbai} />
      </div>
      <div className={styles.nodecardParent}>
        <NodeCard targetChain={bscTestnet} />
        <NodeCard targetChain={baseGoerli} />
      </div>
      <div className={styles.nodecardParent}>
        <NodeCard targetChain={optimismGoerli} />
        <div className={styles.emptycard}></div>
      </div>
    </div>
  );
};

export default NodeContracts;
