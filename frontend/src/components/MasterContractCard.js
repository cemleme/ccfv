import styles from "./MasterContractCard.module.css";
import { sepolia } from "viem/chains";
import {
  useNetwork,
  useSwitchNetwork,
  useContractRead,
  useAccount,
} from "wagmi";
import masterAbi from "../constants/master.abi";
import config from "../constants/config";
import { formatEther } from "viem";
import { useSelector, useDispatch } from "react-redux";
import { useEffect } from "react";
import { setStats } from "../reducers/root";

const MasterContractCard = () => {
  const { chain } = useNetwork();
  const { address, isConnecting, isDisconnected } = useAccount();
  const { switchNetwork } = useSwitchNetwork();
  const dispatch = useDispatch();
  const fundsToBridge = useSelector((state) => state.root.fundsToBridge);

  const { data, isError, isLoading } = useContractRead({
    address: config[sepolia.id].ccfv,
    abi: masterAbi,
    functionName: "getStats",
    args: [address],
    chainId: sepolia.id,
    watch: true,
  });

  useEffect(() => {
    if (!data) return;

    dispatch(
      setStats({
        id: sepolia.id,
        value: {
          totalVotePower: formatEther(data[0]),
          userVotePower: formatEther(data[2]),
          currentFunds: formatEther(data[1]),
        },
      })
    );
  }, [data]);

  if (!data) return <></>;

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
              <b className={styles.b}>
                {Object.values(fundsToBridge).reduce(
                  (a, b) => parseFloat(a) + parseFloat(b),
                  0
                )}
              </b>
              <div className={styles.ccipBnm}>CCIP-BnM</div>
            </div>
          </div>
          <div className={styles.framevotepower}>
            <div className={styles.totalVotePower}>Total Vote Power</div>
            <b className={styles.b}>{formatEther(data[0])}</b>
          </div>
        </div>
        <div className={styles.currentfunds}>
          <div className={styles.totalFunds}>Current Funds</div>
          <b className={styles.b1}>{formatEther(data[1])}</b>
          <div className={styles.totalVotePower}>CCIP-BnM</div>
        </div>
      </div>
    </div>
  );
};

export default MasterContractCard;
