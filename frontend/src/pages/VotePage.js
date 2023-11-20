import VotesContainer from "../components/VotesContainer";
import ContainerHeader from "../components/ContainerHeader";
import styles from "./VotePage.module.css";

const VotePage = () => {
  return (
    <div className={styles.votepage}>
      <ContainerHeader />
      <div className={styles.body}>
        <div className={styles.content}>
          <div className={styles.proposalcard}>
            <div className={styles.frametitle}>
              <b className={styles.id}>#</b>
              <b className={styles.id}>11</b>
              <b className={styles.id}>:</b>
              <b className={styles.id}>Donation to asdf DFsf</b>
            </div>
            <div className={styles.frameinfo}>
              <div className={styles.col1}>
                <div className={styles.framecreator}>
                  <div className={styles.balanceCcipBnm}>Creator</div>
                  <b className={styles.address}>
                    0x0bF8eD3f9357bFea8226C4e5a4D2Bae6dA22637e
                  </b>
                </div>
                <div className={styles.framecreator}>
                  <div className={styles.balanceCcipBnm}>Reciever</div>
                  <b className={styles.address}>
                    0x0bF8eD3f9357bFea8226C4e5a4D2Bae6dA22637e
                  </b>
                </div>
                <div className={styles.framecreator}>
                  <div className={styles.balanceCcipBnm}>Proposed Amount</div>
                  <div className={styles.amount}>
                    <b className={styles.id}>{`145 `}</b>
                    <div className={styles.ccipBnm}>CCIP-BnM</div>
                  </div>
                </div>
              </div>
              <div className={styles.col2}>
                <div className={styles.framecreator}>
                  <div className={styles.balanceCcipBnm}>Required Vote</div>
                  <b className={styles.b}>1,465</b>
                </div>
                <div className={styles.framecreator}>
                  <div className={styles.balanceCcipBnm}>Votes Received</div>
                  <b className={styles.b}>5</b>
                </div>
              </div>
              <div className={styles.col3}>
                <div className={styles.framevotepower}>
                  <div className={styles.balanceCcipBnm}>Your Vote Power</div>
                  <b className={styles.b}>5</b>
                </div>
                <button className={styles.buttonvote}>
                  <b className={styles.vote}>Vote For</b>
                </button>
                <button className={styles.buttonactivate}>
                  <b className={styles.vote}>Activate</b>
                </button>
              </div>
            </div>
            <div className={styles.description}>
              <p className={styles.sedCondimentumDiam}>
                Sed condimentum diam orci, eget condimentum ipsum convallis
                quis. Sed ut perspiciatis, unde omnis iste natus error sit
                voluptatem accusantium doloremque laudantium, totam rem aperiam
                eaque ipsa, quae ab illo inventore veritatis et quasi architecto
                beatae vitae dicta sunt, explicabo. Nemo enim ipsam voluptatem,
                quia voluptas sit, aspernatur aut odit aut fugit, sed quia
                consequuntur magni dolores eos, qui ratione voluptatem sequi
                nesciunt, neque porro quisquam est, qui dolorem ipsum, quia
                dolor sit amet consectetur adipiscing velit, sed quia non
                numquam do eius modi tempora inci[di]dunt, ut labore et dolore
                magnam aliquam quaerat voluptatem. Ut enim ad minima veniam,
                quis nostrum exercitationem ullam corporis suscipit laboriosam,
                nisi ut aliquid ex ea commodi consequatur?
              </p>
              <p className={styles.sedCondimentumDiam}>&nbsp;</p>
              <p className={styles.sedCondimentumDiam}>
                {" "}
                Sed ut perspiciatis, unde omnis iste natus error sit voluptatem
                accusantium doloremque laudantium, totam rem aperiam eaque ipsa,
                quae ab illo inventore veritatis et quasi architecto beatae
                vitae dicta sunt, explicabo. Nemo enim ipsam voluptatem, quia
                voluptas sit, aspernatur aut odit aut fugit, sed quia
                consequuntur magni dolores eos, qui ratione voluptatem sequi
                nesciunt, neque porro quisquam est, qui dolorem ipsum, quia
                dolor sit amet consectetur adipiscing velit, sed quia non
                numquam do eius modi tempora inci[di]dunt, ut labore et dolore
                magnam aliquam quaerat voluptatem. Ut enim ad minima veniam,
                quis nostrum exercitationem ullam corporis suscipit laboriosam,
                nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum
                iure reprehenderit, qui in ea voluptate velit esse, quam nihil
                molestiae consequatur, vel illum, qui dolorem eum fugiat, quo
                voluptas nulla pariatur?
              </p>
            </div>
          </div>
          <VotesContainer />
        </div>
      </div>
    </div>
  );
};

export default VotePage;
