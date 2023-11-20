import ContainerHeader from "../components/ContainerHeader";
import CurrentContractCard from "../components/CurrentContractCard";
import Row from "../components/Row";
import NodeContracts from "../components/NodeContracts";
import MasterContractCard from "../components/MasterContractCard";
import styles from "./MainDashboard.module.css";

const MainDashboard = () => {
  return (
    <div className={styles.mainDashboard}>
      <ContainerHeader />
      <div className={styles.body}>
        <div className={styles.content}>
          <CurrentContractCard />
          <div className={styles.proposals}>
            <b className={styles.proposals1}>Proposals</b>
            <div className={styles.list}>
              <div className={styles.list}>
                <Row />
              </div>
            </div>
          </div>
        </div>
        <div className={styles.nodecards}>
          <MasterContractCard />
          <NodeContracts />
        </div>
      </div>
    </div>
  );
};

export default MainDashboard;
