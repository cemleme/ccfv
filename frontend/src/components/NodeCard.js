import styles from "./NodeCard.module.css";
import { useNetwork, useSwitchNetwork } from "wagmi";

const NodeCard = ({ targetChain }) => {
  const { chain } = useNetwork();
  const { switchNetwork } = useSwitchNetwork();

  return (
    <div className={chain && chain?.id === targetChain.id ? `${styles.nodecard} ${styles.selectednode}` : `${styles.nodecard}`}>
      <div className={styles.frametitle}>
        <b className={styles.title}>Node: {targetChain.name}</b>
        {chain && chain?.id !== targetChain.id && (
          <button
            className={styles.buttonconnect}
            onClick={() => switchNetwork?.(targetChain.id)}
          >
            <b className={styles.connect}>Connect</b>
          </button>
        )}
      </div>
      <div className={styles.frameinfo}>
        <div className={styles.framevotepower}>
          <div className={styles.totalVotePower}>Total Vote Power</div>
          <b className={styles.b}>1,465</b>
        </div>
        <div className={styles.framevotepower}>
          <div className={styles.totalVotePower}>Funds to Bridge</div>
          <b className={styles.b}>{`145 `}</b>
          <div className={styles.totalVotePower}>CCIP-BnM</div>
        </div>
        <div className={styles.framevotepower}>
          <div className={styles.totalVotePower}>Votes to Bridge</div>
          <b className={styles.b}>290</b>
        </div>
      </div>
    </div>
  );
};

export default NodeCard;
