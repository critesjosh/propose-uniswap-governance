const ethers = require("ethers");
const { Contract, utils } = ethers;
const {
  GOVERNOR_BRAVO_ABI,
  ENS_REGISTRY_ABI,
  ENS_PUBLIC_RESOLVER_ABI,
} = require("./utils")
const { namehash } = require("@ethersproject/hash");
const { keccak256 } = require("@ethersproject/keccak256");
const { Interface } = require("@ethersproject/abi");
require('dotenv').config()

async function main() {

  const governorBravoAddress = "0x408ED6354d4973f66138C91495F2f2FCbd8724C3";
  const governorBravo = new Contract(governorBravoAddress, GOVERNOR_BRAVO_ABI);

  const NODE_TOP_LEVEL = namehash("uniswap.eth");
  const LABEL = keccak256(utils.toUtf8Bytes("v3-core-license-grants"));
  const OWNER_UNISWAP_GOVERNANCE_TIMELOCK =
    "0x1a9C8182C09F50C8318d769245beA52c32BE35BC";
  const RESOLVER_PUBLIC_ENS_RESOLVER =
    "0x4976fb03c32e5b8cfe2b6ccb31c09ba78ebaba41";
  const TTL = 0;

  const NODE = namehash("v3-core-license-grants.uniswap.eth");
  const KEY = "Celo Uni v3 Additional Use Grant";
  const VALUE = `
        The Celo Foundation and cLabs (“Celo”) are granted an additional use grant to use the Uniswap V3 Core software code (which is made available to Celo subject to license available at https://github.com/Uniswap/v3-core/blob/main/LICENSE (the “Uniswap Code”)).  	
    As part of this additional use grant, Celo receives license to use the Uniswap Code for the purposes of a full deployment of the Uniswap Protocol v3 onto the Celo blockchain.
    Celo is permitted to use subcontractors to do this work.  
    This license is conditional on Celo complying with the terms of the Business Source License 1.1, made available at https://github.com/Uniswap/v3-core/blob/main/LICENSE.`;

  const ensRegistryInterface = new Interface(ENS_REGISTRY_ABI);
  const setSubnodeRecordCalldata = ensRegistryInterface.encodeFunctionData(
    "setSubnodeRecord",
    [
      NODE_TOP_LEVEL,
      LABEL,
      OWNER_UNISWAP_GOVERNANCE_TIMELOCK,
      RESOLVER_PUBLIC_ENS_RESOLVER,
      TTL,
    ]
  );

  const ensPublicResolverInterface = new Interface(ENS_PUBLIC_RESOLVER_ABI);
  const setTextCalldata = ensPublicResolverInterface.encodeFunctionData(
    "setText",
    [NODE, KEY, VALUE]
  );

  const ENS_REGISTRY_ADDRESS = "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e";
  const PUBLIC_ENS_RESOLVER_ADDRESS =
    "0x4976fb03c32e5b8cfe2b6ccb31c09ba78ebaba41";

  const targets = [ENS_REGISTRY_ADDRESS, PUBLIC_ENS_RESOLVER_ADDRESS];
  const values = [0, 0];
  const sigs = ["", ""];
  const calldatas = [setSubnodeRecordCalldata, setTextCalldata];
  const description = "Celo Additional Use Grant";
  const michiganAddress = "0x13BDaE8c5F0fC40231F0E6A4ad70196F59138548";

  const provider = new ethers.providers.AlchemyProvider(null, process.env.ALCHEMY_KEY)
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider)
  
  // const provider = new ethers.providers.JsonRpcProvider('http://localhost:24012/rpc')
  // const signer = provider.getSigner()

  // make the proposal
  await governorBravo
    .connect(wallet)
    .propose(targets, values, sigs, calldatas, description);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
