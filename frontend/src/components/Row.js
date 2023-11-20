import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Row.module.css";

const Row = () => {
  const navigate = useNavigate();

  const onButtonInspectClick = useCallback(() => {
    navigate("/vote");
  }, [navigate]);

  return (
    <div className={styles.row}>
      <div className={styles.rowleft}>
        <div className={styles.rowtop}>
          <div className={styles.rowtop}>
            <b className={styles.label}>#:</b>
            <b className={styles.proposalTitle}>1</b>
          </div>
          <div className={styles.rowtop}>
            <b className={styles.label}>Title:</b>
            <b className={styles.proposalTitle}>Donation to x funds</b>
          </div>
        </div>
        <div className={styles.rowtop}>
          <div className={styles.rowtop}>
            <b className={styles.label}>Receiver:</b>
            <b className={styles.proposalTitle}>0x4...122</b>
          </div>
          <div className={styles.rowtop}>
            <b className={styles.label}>Amount:</b>
            <b className={styles.proposalTitle}>14.000</b>
          </div>
        </div>
      </div>
      <div className={styles.rowstatus}>
        <div className={styles.statusongoing}>
          <b className={styles.active}>Ongoing</b>
        </div>
        <div className={styles.statuswaitingvotes}>
          <b className={styles.active}>Unsynced</b>
        </div>
        <div className={styles.statussuccess}>
          <b className={styles.active}>Success</b>
        </div>
        <div className={styles.statusqueued}>
          <b className={styles.active}>Queued</b>
        </div>
        <div className={styles.successfailed}>
          <b className={styles.active}>Failed</b>
        </div>
        <div className={styles.statusvoted}>
          <b className={styles.active}>Voted</b>
        </div>
        <div className={styles.progress}>
          <b className={styles.label}>10%</b>
          <div className={styles.progressChild} />
          <div className={styles.progressItem} />
        </div>
      </div>
      <div className={styles.rowright}>
        <button className={styles.buttonvote}>
          <b className={styles.vote}>Vote For</b>
        </button>
        <button className={styles.buttonactivate}>
          <b className={styles.vote}>Activate</b>
        </button>
        <button className={styles.buttonvote} onClick={onButtonInspectClick}>
          <b className={styles.vote}>Inspect</b>
        </button>
      </div>
    </div>
  );
};

export default Row;
