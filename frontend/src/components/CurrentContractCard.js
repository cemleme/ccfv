import { useState, useCallback } from "react";
import AddFundModal from "./AddFundModal";
import PortalPopup from "./PortalPopup";
import CreateProposalModal from "./CreateProposalModal";
import styles from "./CurrentContractCard.module.css";
import { useNetwork } from "wagmi";
import { sepolia } from "viem/chains";
import { useSelector } from "react-redux";

const CurrentContractCard = () => {
  const { chain } = useNetwork();
  const [isAddFundModalPopupOpen, setAddFundModalPopupOpen] = useState(false);
  const [isCreateProposalModalPopupOpen, setCreateProposalModalPopupOpen] =
    useState(false);
  const stats = useSelector((state) => state.root.stats);

  const openAddFundModalPopup = useCallback(() => {
    setAddFundModalPopupOpen(true);
  }, []);

  const closeAddFundModalPopup = useCallback(() => {
    setAddFundModalPopupOpen(false);
  }, []);

  const openCreateProposalModalPopup = useCallback(() => {
    setCreateProposalModalPopupOpen(true);
  }, []);

  const closeCreateProposalModalPopup = useCallback(() => {
    setCreateProposalModalPopupOpen(false);
  }, []);

  if (!chain || !stats || !stats[chain?.id]) return;

  return (
    <>
      <div className={styles.currentcard}>
        <b className={styles.title}>Current Contract: {chain?.name}</b>
        <div className={styles.frameinfo}>
          <div className={styles.col1}>
            <div className={styles.framevotepower}>
              <div className={styles.totalVotePower}>Total Vote Power</div>
              <b className={styles.b}>{stats[chain?.id].totalVotePower}</b>
            </div>
            <div className={styles.framevotepower}>
              <div className={styles.totalVotePower}>Your Vote Power</div>
              <b className={styles.b}>{stats[chain?.id].userVotePower}</b>
            </div>
          </div>
          <div className={styles.col1}>
            <div className={styles.lifetimefunds}>
              <div className={styles.lifeTimeFunds}>Life Time Funds</div>
              <div className={styles.parent}>
                <b className={styles.b}>{stats[chain?.id].totalVotePower}</b>
                <div className={styles.ccipBnm}>CCIP-BnM</div>
              </div>
            </div>
            {chain?.id !== sepolia.id && (
              <div className={styles.lifetimefunds}>
                <div className={styles.lifeTimeFunds}>Funds to Bridge</div>
                <div className={styles.parent}>
                  <b className={styles.b}>{stats[chain?.id].fundsToBridge}</b>
                  <div className={styles.ccipBnm}>CCIP-BnM</div>
                </div>
              </div>
            )}
          </div>
          <div className={styles.col3}>
            <button
              className={styles.buttonaddfund}
              onClick={openAddFundModalPopup}
            >
              <b className={styles.addFund}>Add Fund</b>
            </button>
            {chain?.id === sepolia.id && (
              <button
                className={styles.buttoncreateproposal}
                onClick={openCreateProposalModalPopup}
              >
                <b className={styles.addFund}>Create Proposal</b>
              </button>
            )}
          </div>
        </div>
      </div>
      {isAddFundModalPopupOpen && (
        <PortalPopup
          overlayColor="rgba(113, 113, 113, 0.3)"
          placement="Centered"
          onOutsideClick={closeAddFundModalPopup}
        >
          <AddFundModal onClose={closeAddFundModalPopup} />
        </PortalPopup>
      )}
      {isCreateProposalModalPopupOpen && (
        <PortalPopup
          overlayColor="rgba(0, 0, 0, 0.8)"
          placement="Centered"
          onOutsideClick={closeCreateProposalModalPopup}
        >
          <CreateProposalModal onClose={closeCreateProposalModalPopup} />
        </PortalPopup>
      )}
    </>
  );
};

export default CurrentContractCard;
