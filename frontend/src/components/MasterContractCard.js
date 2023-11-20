import { useNetwork, useSwitchNetwork } from "wagmi";
import styles from "./MasterContractCard.module.css";
import { sepolia } from "viem/chains";

const MasterContractCard = ({ title, targetChain }) => {
  const { chain } = useNetwork();
  const { switchNetwork } = useSwitchNetwork();

  return (
    <div
      className={
        chain && chain?.id === sepolia.id
          ? `${styles.mastercard} ${styles.selectednode}`
          : `${styles.mastercard}`
      }
    >
      <div className={styles.frametitle}>
        <b className={styles.title}>Master Contract: Sepolia</b>
        {chain && chain?.id !== sepolia.id && (
          <button
            className={styles.buttonconnect}
            onClick={() => switchNetwork?.(sepolia.id)}
          >
            <b className={styles.connect}>Connect</b>
          </button>
        )}
      </div>
      <div className={styles.frameinfo}>
        <div className={styles.data}>
          <div className={styles.framevotepower}>
            <div className={styles.lifeTimeFunds}>Funds to Receive</div>
            <div className={styles.parent}>
              <b className={styles.b}>145</b>
            </div>
          </div>
          <div className={styles.framevotepower}>
            <div className={styles.totalVotePower}>Total Vote Power</div>
            <b className={styles.b}>1,465</b>
          </div>
        </div>
        <div className={styles.currentfunds}>
          <div className={styles.totalFunds}>Current Funds</div>
          <b className={styles.b1}>9.3</b>
          <div className={styles.totalVotePower}>CCIP-BnM</div>
        </div>
      </div>
    </div>
  );
};

export default MasterContractCard;
