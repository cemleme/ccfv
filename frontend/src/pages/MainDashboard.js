import ContainerHeader from "../components/ContainerHeader";
import CurrentContractCard from "../components/CurrentContractCard";
import Row from "../components/Row";
import NodeContracts from "../components/NodeContracts";
import MasterContractCard from "../components/MasterContractCard";
import styles from "./MainDashboard.module.css";
import Proposals from "../components/Proposals";

const MainDashboard = () => {
  return (
    <div className={styles.mainDashboard}>
      <ContainerHeader />
      <div className={styles.body}>
        <div className={styles.content}>
          <CurrentContractCard />
          <Proposals />
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
