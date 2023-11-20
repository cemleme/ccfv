import styles from "./VotesContainer.module.css";

const VotesContainer = () => {
  return (
    <div className={styles.voters}>
      <b className={styles.votes}>Votes</b>
      <div className={styles.list}>
        <div className={styles.items}>
          <div className={styles.voterrow}>
            <b className={styles.address}>
              0x0bF8eD3f9357bFea8226C4e5a4D2Bae6dA22637e
            </b>
            <div className={styles.proposalamount}>
              <b className={styles.label}>Vote:</b>
              <b className={styles.address}>14.000</b>
            </div>
            <div className={styles.network}>
              <b className={styles.name}>Avalanche</b>
            </div>
          </div>
          <div className={styles.voterrow}>
            <b className={styles.address}>
              0x0bF8eD3f9357bFea8226C4e5a4D2Bae6dA22637c
            </b>
            <div className={styles.proposalamount}>
              <b className={styles.label}>Vote:</b>
              <b className={styles.address}>14.000</b>
            </div>
            <div className={styles.network}>
              <b className={styles.name}>Polygon</b>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VotesContainer;
