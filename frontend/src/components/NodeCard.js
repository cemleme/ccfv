import styles from "./NodeCard.module.css";
import {
  useNetwork,
  useSwitchNetwork,
  useContractRead,
  useAccount,
} from "wagmi";
import nodeAbi from "../constants/node.abi";
import config from "../constants/config";
import { useSelector, useDispatch } from "react-redux";
import { formatEther } from "viem";
import { useEffect } from "react";
import { addFundsToBridge, setStats, addUnsyncedId } from "../reducers/root";

const NodeCard = ({ targetChain }) => {
  const { chain } = useNetwork();
  const { address, isConnecting, isDisconnected } = useAccount();
  const { switchNetwork } = useSwitchNetwork();
  const dispatch = useDispatch();

  const { data, isError, isLoading, error } = useContractRead({
    address: config[targetChain.id].ccfv,
    abi: nodeAbi,
    functionName: "getStats",
    args: [address],
    chainId: targetChain.id,
    watch: true,
  });

  useEffect(() => {
    if (!data) return <></>;

    dispatch(
      addFundsToBridge({ id: targetChain.id, value: formatEther(data[2]) })
    );
    dispatch(
      setStats({
        id: targetChain.id,
        value: {
          totalVotePower: formatEther(data[0]),
          userVotePower: formatEther(data[1]),
          fundsToBridge: formatEther(data[2]),
          cursorRight: parseInt(data[4]),
          proposalsUnsynced: data[6].map((i) => parseInt(i)),
        },
      })
    );
    dispatch(addUnsyncedId({ ids: data[6].map((i) => parseInt(i)) }));
  }, [data]);

  if (!data) return <></>;

  return (
    <div
      className={
        chain && chain?.id === targetChain.id
          ? `${styles.nodecard} ${styles.selectednode}`
          : `${styles.nodecard}`
      }
    >
      <div className={styles.frametitle}>
        <b className={styles.title}>
          Node: <br />
          {targetChain.name.length < 20
            ? targetChain.name
            : targetChain.name.substring(0, 20)}
        </b>
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
          <b className={styles.b}>{formatEther(data[0])}</b>
        </div>
        <div className={styles.framevotepower}>
          <div className={styles.totalVotePower}>Funds to Bridge</div>
          <b className={styles.b}>{formatEther(data[2])}</b>
          <div className={styles.totalVotePower}>CCIP-BnM</div>
        </div>
        <div className={styles.framevotepower}>
          <div className={styles.totalVotePower}>Votes to Bridge</div>
          <b className={styles.b}>{formatEther(data[3])}</b>
        </div>
      </div>
    </div>
  );
};

export default NodeCard;
