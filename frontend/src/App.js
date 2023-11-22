import { useEffect } from "react";
import {
  Routes,
  Route,
  useNavigationType,
  useLocation,
} from "react-router-dom";
import { Provider } from "react-redux";
import store from "./store";
import { WagmiConfig, configureChains, createConfig } from "wagmi";
import { createWeb3Modal, defaultWagmiConfig } from "@web3modal/wagmi/react";
import { sepolia, avalancheFuji, polygonMumbai, bscTestnet, baseGoerli, optimismGoerli } from "viem/chains";
import { walletConnectProvider, EIP6963Connector } from "@web3modal/wagmi";
import { publicProvider } from "wagmi/providers/public";
import { jsonRpcProvider } from "wagmi/providers/jsonRpc";
import { InjectedConnector } from "wagmi/connectors/injected";
import { WalletConnectConnector } from "wagmi/connectors/walletConnect";
import MainDashboard from "./pages/MainDashboard";
import VotePage from "./pages/VotePage";

const projectId = "dc25d2849a28047aaf861d949abe72c5";
const _chains = [sepolia, avalancheFuji, polygonMumbai, bscTestnet, baseGoerli, optimismGoerli];
const { chains, publicClient } = configureChains(_chains, [publicProvider()]);

// 2. Create wagmiConfig
const metadata = {
  name: "Web3Modal",
  description: "Web3Modal Example",
  url: "https://web3modal.com",
  icons: ["https://avatars.githubusercontent.com/u/37784886"],
};
//const wagmiConfig = defaultWagmiConfig({ chains, projectId, metadata });
const wagmiConfig = createConfig({
  autoConnect: true,
  connectors: [
    new WalletConnectConnector({
      chains,
      options: { projectId, showQrModal: false, metadata },
    }),
    new InjectedConnector({ chains, options: { shimDisconnect: true } }),
  ],
  publicClient,
});

createWeb3Modal({
  wagmiConfig,
  projectId,
  chains,
});

function App() {
  const action = useNavigationType();
  const location = useLocation();
  const pathname = location.pathname;

  useEffect(() => {
    if (action !== "POP") {
      window.scrollTo(0, 0);
    }
  }, [action, pathname]);

  useEffect(() => {
    let title = "";
    let metaDescription = "";

    switch (pathname) {
      case "/":
        title = "";
        metaDescription = "";
        break;
      case "/vote":
        title = "";
        metaDescription = "";
        break;
    }

    if (title) {
      document.title = title;
    }

    if (metaDescription) {
      const metaDescriptionTag = document.querySelector(
        'head > meta[name="description"]'
      );
      if (metaDescriptionTag) {
        metaDescriptionTag.content = metaDescription;
      }
    }
  }, [pathname]);

  return (
    <Provider store={store}>
      <WagmiConfig config={wagmiConfig}>
        <Routes>
          <Route path="/" element={<MainDashboard />} />
          <Route path="/vote/:id" element={<VotePage />} />
        </Routes>
      </WagmiConfig>
    </Provider>
  );
}
export default App;
