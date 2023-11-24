# CCFV: CrossChain Funding and Voting

Try at https://ccfv.netlify.app

**CCFV** (CrossChain Funding and Voting) is a cutting-edge platform that revolutionizes how funding and decision-making cross over multiple blockchain ecosystems.
At its core, CCFV enables project creators to launch funding campaigns on a primary blockchain while seamlessly integrating with various other blockchains.
The platform empowers users from different networks to participate in funding and governance, making the process truly decentralized and inclusive.

CCFV at the moment is running on 7 blockchains (Sepolia, Fuji, Mumbai, BNB Testnet, ...); using Chainlink CCIP, Functions, Automation and Price Feeds all at the same time.

## The Problem

Ethereum Mainnet is often the preferred layer for long-term fund storage due to its robust security and wide acceptance.
However, high gas fees on Ethereum can significantly erode small donations, with costs sometimes surpassing the donation amount itself.

Let's imagine Ava; she is willing to donate $5, but the fluctuating gas fees, ranging from 20% to 100%, make it impractical on Ethereum. If she donates $5, most of it will go to the gas fees and very small if not non, will be an actual donation.
With mass participation, the proportion of funds wasted on gas could become substantial, detracting from the intended charitable impact.

We need a solution to allow users to donate with less gas fees.

Now let's imagine Frank; he prefers Avalanche for its low fees and fast transactions, but his donations are lost to a project anchored solely on Ethereum. Mark and Britney face similar issues with their favored chains, Polygon and BNB Chain, respectively.

Imagine the miss of donations on all these different chains if we process on only 1 blockchain.

We can create multiple donation contracts on different blockchains; but setting up isolated funding contracts on different chains leads to fragmented pools of funds and diluted impact.
The split in balance can reduce the visibility and attractiveness of the funding campaign.
The challenge of decentralized voting is compounded by high costs and the need for a trustless system to aggregate votes.

Here comes CCFV; leveraging Chainlink CCIP, bridges the gap by connecting donations and votes across multiple chains.
It enables a collective funding pool with lower overheads and a decentralized voting mechanism, maximizing efficiency and engagement.

## Usage of Chainlink CCIP

CCFV leverages Chainlink's Cross-Chain Interoperability Protocol (CCIP) to enable seamless communication and data transfer across different blockchains. The utilization of CCIP is fundamental to CCFV's success in aggregating donations and votes from various blockchain communities onto a primary Ethereum mainnet contract. Through CCIP, CCFV minimizes gas fees, ensures data integrity, and enhances the overall efficiency of cross-chain transactions.

## Usage of Chainlink Automation

CCFV leverages Chainlink Automation to automate and streamline CCIP bridging process at predefined intervals. Chainlink Automation ensures the timely and efficient execution of data transfers from Node Contracts to the Master Contract. This automation eliminates the need for manual intervention, reducing the risk of delays and enhancing the overall reliability of CCFV's cross-chain operations.

## Usage of Chainlink Functions

CCFV relies on Chainlink Functions to facilitate the smooth retrieval of proposal IDs from the master contract into secondary node contracts across various blockchains.

## Usage of Chainlink Price Feeds

CCFV employs Chainlink Price Feeds to dynamically calculate the create proposal fee in ETH and LINK on-chain. By leveraging Chainlink's reliable and decentralized price oracle network, CCFV ensures accurate and up-to-date conversion rates between ETH and LINK. This integration allows for real-time fee adjustments based on market fluctuations, providing a fair and transparent mechanism for determining proposal creation costs.

## Technologies

Chainlink CCIP to bridge funds and votes from node contracts to the master contract
Chainlink Functions to get latest proposal id from master contract to sync to node contracts
Chainlink Automation to automate CCIP bridging
Chainlink PriceFeeds to use payable function with LINK value
TheGraph for event indexing and frontend usage
React for frontend

## Inspiration

CCFV (CrossChain Funding and Voting) is inspired by the evolving world of decentralized finance (DeFi) and blockchain technology. We were motivated to address the challenges faced by traditional funding models and existing Web3 platforms. Our vision is to bring together various blockchain communities, allowing individuals, regardless of their blockchain preference, to easily take part in funding campaigns and governance processes.

## What it does

CCFV (CrossChain Funding and Voting) is a revolutionary platform that redefines decentralized funding and decision-making in the blockchain space. At its core, CCFV unites various blockchain communities, allowing project creators to launch funding campaigns on a primary blockchain while seamlessly interacting with multiple other blockchains. The platform enables users from different networks to participate in funding initiatives and governance processes without the limitations of traditional multi-chain environments. Leveraging Chainlink's Cross-Chain Interoperability Protocol (CCIP), CCFV efficiently aggregates donations and votes from different blockchains, providing a transparent, cost-effective, and inclusive solution. By bridging the gaps between blockchains, CCFV ensures that funds and votes are accessible to a global audience, fostering collaboration, trust, and collective impact.

## How we built it && Challenges we ran into

CCFV at the moment is running on 7 blockchains (Sepolia, Fuji, Mumbai, BNB Testnet, ...); using Chainlink CCIP, Functions, Automation and Price Feeds all at the same time. The most difficuly challange was testing all these components together in multiple chains.

## Accomplishments that we're proud of

CCFV successfully integrates funding campaigns and voting mechanisms across multiple blockchain ecosystems, fostering a unified and accessible platform for decentralized collaboration. The protocol handles this using Chainlink CCIP, Functions, Automation and Price Feeds in a harmonized integration.

## What we learned

My experience with CCFV has been a rich learning journey, marked by accomplishments and insights. A standout learning opportunity was our adept use of Chainlink components across seven different blockchains. This hands-on experience expanded our technical know-how, teaching us the intricacies of decentralized oracles, data aggregation, and secure cross-chain interoperability.

## What's next for CCFV: CrossChain Funding with Voting

Looking ahead, CCFV is dedicated to continuous improvement and growth. Our roadmap includes expanding cross-chain support to embrace a more diverse user base, introducing advanced governance features for enhanced user control, and prioritizing user experience improvements based on valuable feedback.

## Repos

Demo: https://ccfv.netlify.app

Github (Contracts, Frontend, TheGraph):
https://github.com/cemleme/ccfv


Block Explorers:

https://sepolia.etherscan.io/address/0x21d06f85824b59e357c4fda5e2b9b8d014152a4b
https://testnet.snowtrace.io/address/0xade11a9802ab4013ea5f56cb6064d9d612eec927
https://mumbai.polygonscan.com/address/0x84135a57dD315681b16aaD7D21205629AeB0D8A6
https://testnet.bscscan.com/address/0xed1b65fa69845618ab8649d2b651cbc638daacb2
https://goerli-optimism.etherscan.io/address/0xed1B65Fa69845618aB8649d2B651cBC638dAACb2
https://goerli.basescan.org/address/0xABa4b5bf3cb3c3a13782011A3e8a9c961aF590F9

TheGraph Subgraphs:

https://api.thegraph.com/subgraphs/name/cemleme/ccfvsepolia
https://api.thegraph.com/subgraphs/name/cemleme/ccfvfuji
https://api.thegraph.com/subgraphs/name/cemleme/ccfvmumbai
https://api.thegraph.com/subgraphs/name/cemleme/ccfvbsc
https://api.thegraph.com/subgraphs/name/cemleme/ccfvoptimism
