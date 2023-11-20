import styles from "./ContainerHeader.module.css";
import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useWeb3Modal } from "@web3modal/wagmi/react";
import { useAccount, useBalance } from "wagmi";
import { useNetwork } from "wagmi";
import config from "../constants/config";

const ContainerHeader = () => {
  const navigate = useNavigate();
  const { chain } = useNetwork();
  const { open } = useWeb3Modal();
  const { address, isConnecting, isDisconnected } = useAccount();
  const balance = useBalance({
    address,
    token: config[chain.id].token,
  });

  console.log(balance);

  const onButtonInspectClick = useCallback(() => {
    navigate("/");
  }, [navigate]);

  return (
    <div className={styles.header}>
      <div className={styles.logoWrapper}>
        <button className={styles.logo} onClick={onButtonInspectClick}>
          <img className={styles.g31909Icon} alt="" src="/g31909.svg" />
          <div className={styles.logotext}>CCFV</div>
        </button>
      </div>
      <div className={styles.empty} />
      <div className={styles.userbalance}>
        <div className={styles.text}>
          <div className={styles.balanceCcipBnm}>Balance CCIP-BnM</div>
          <b className={styles.b}>
            {balance.data && parseFloat(balance.data.formatted).toFixed(5)}
          </b>
        </div>
      </div>
      <div className={styles.connect}>
        <button className={styles.buttonconnect} onClick={() => open()}>
          {address
            ? address.slice(0, 4) + "..." + address.slice(-4)
            : "Connect"}
        </button>
      </div>
    </div>
  );
};

export default ContainerHeader;
