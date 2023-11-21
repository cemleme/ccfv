import { sepolia, useContractRead, useAccount, useNetwork } from "wagmi";
import Row from "../components/Row";
import masterAbi from "../constants/master.abi";
import styles from "./Proposals.module.css";
import config from "../constants/config";
import { formatEther } from "viem";
import { useSelector } from "react-redux";

const Proposals = () => {
  const { chain } = useNetwork();
  const { address, isConnecting, isDisconnected } = useAccount();
  const stats = useSelector((state) => state.root.stats);

  const { data: cursorRight } = useContractRead({
    address: config[sepolia.id].ccfv,
    abi: masterAbi,
    functionName: "proposalCursorRight",
    chainId: sepolia.id,
  });

  const {
    data: proposals,
    isError,
    isLoading,
  } = useContractRead({
    address: config[sepolia.id].ccfv,
    abi: masterAbi,
    functionName: "getProposals",
    chainId: sepolia.id,
    args: [0, 20],
    watch: true
  });

  console.log(proposals);
  if (!proposals) return <></>;
  return (
    <div className={styles.proposals}>
      <b className={styles.proposals1}>Proposals</b>
      <div className={styles.list}>
        <div className={styles.list}>
          {proposals.map((p) => (
            <Row
              key={p.id}
              proposal={p}
              cursorRight={stats[chain?.id]?.cursorRight}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Proposals;
