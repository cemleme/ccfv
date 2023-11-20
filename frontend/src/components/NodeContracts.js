import NodeCard from "./NodeCard";
import styles from "./NodeContracts.module.css";
import { avalancheFuji, polygonMumbai, bscTestnet } from "viem/chains";

const NodeContracts = () => {
  return (
    <div className={styles.frameParent}>
      <div className={styles.nodecardParent}>
        <NodeCard targetChain={avalancheFuji} />
        <NodeCard targetChain={polygonMumbai} />
      </div>
      <div className={styles.nodecardParent}>
        <div className={styles.nodecard}>
          <div className={styles.frametitle}>
            <b className={styles.title}>Node: BNB Testnet</b>
            <button className={styles.buttonconnect}>
              <b className={styles.connect}>Connect</b>
            </button>
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
        <div className={styles.nodecard}>
          <div className={styles.frametitle}>
            <b className={styles.title}>Node: Base Goerli</b>
            <button className={styles.buttonconnect}>
              <b className={styles.connect}>Connect</b>
            </button>
          </div>
          <div className={styles.frameinfo}>
            <div className={styles.framevotepower}>
              <div className={styles.totalVotePower}>Total Vote Power</div>
              <b className={styles.b}>2300</b>
            </div>
            <div className={styles.framevotepower}>
              <div className={styles.totalVotePower}>Funds to Bridge</div>
              <b className={styles.b}>{`10 `}</b>
              <div className={styles.totalVotePower}>CCIP-BnM</div>
            </div>
            <div className={styles.framevotepower}>
              <div className={styles.totalVotePower}>Votes to Bridge</div>
              <b className={styles.b}>10</b>
            </div>
          </div>
        </div>
      </div>
      <div className={styles.nodecardParent}>
        <div className={styles.nodecard}>
          <div className={styles.frametitle}>
            <b className={styles.title}>Node: Optimism Goerli</b>
            <button className={styles.buttonconnect}>
              <b className={styles.connect}>Connect</b>
            </button>
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
        <div className={styles.nodecard}>
          <div className={styles.frametitle}>
            <b className={styles.title}>Node: Arbitrum Goerli</b>
            <button className={styles.buttonconnect}>
              <b className={styles.connect}>Connect</b>
            </button>
          </div>
          <div className={styles.frameinfo}>
            <div className={styles.framevotepower}>
              <div className={styles.totalVotePower}>Total Vote Power</div>
              <b className={styles.b}>2300</b>
            </div>
            <div className={styles.framevotepower}>
              <div className={styles.totalVotePower}>Funds to Bridge</div>
              <b className={styles.b}>{`10 `}</b>
              <div className={styles.totalVotePower}>CCIP-BnM</div>
            </div>
            <div className={styles.framevotepower}>
              <div className={styles.totalVotePower}>Votes to Bridge</div>
              <b className={styles.b}>10</b>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NodeContracts;
