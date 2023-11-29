import styles from "./ContainerHeader.module.css";
import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useWeb3Modal } from "@web3modal/wagmi/react";
import { erc20ABI, useAccount, useContractRead } from "wagmi";
import { useNetwork } from "wagmi";
import config from "../constants/config";
import { formatEther } from "viem";

const ContainerHeader = () => {
  const navigate = useNavigate();
  const { chain } = useNetwork();
  const { open } = useWeb3Modal();
  const { address, isConnecting, isDisconnected } = useAccount();

  const onButtonHome = useCallback(() => {
    navigate("/");
  }, [navigate]);

  const onButtonAllFunds = useCallback(() => {
    navigate("/funds");
  }, [navigate]);

  const onButtonCCIP = useCallback(() => {
    navigate("/ccip");
  }, [navigate]);

  const {
    data: balance,
    isError: balanceError,
    isLoading: balanceLoading,
  } = useContractRead({
    address: config[chain?.id]?.token,
    abi: erc20ABI,
    functionName: "balanceOf",
    args: [address],
    watch: true,
  });

  return (
    <div className={styles.header}>
      <div className={styles.logoWrapper}>
        <button className={styles.logo} onClick={onButtonHome}>
          <img className={styles.g31909Icon} alt="" src="/g31909.svg" />
          <div className={styles.logotext}>CCFV</div>
        </button>
      </div>
      <div>
        <button className={styles.buttonlink} onClick={onButtonHome}>
          Home
        </button>
        <button className={styles.buttonlink} onClick={onButtonCCIP}>
          CCIP Messages
        </button>
        <button className={styles.buttonlink} onClick={onButtonAllFunds}>
          All Funds
        </button>
      </div>
      <div className={styles.empty} />

      <div className={styles.userbalance}>
        <div className={styles.text}>
          <div className={styles.balanceCcipBnm}>Balance CCIP-BnM</div>
          <b className={styles.b}>
            {balance && parseFloat(formatEther(balance)).toFixed(5)}
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
