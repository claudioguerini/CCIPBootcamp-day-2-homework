const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CCIP Cross Chain Name Service", function () {
  let ccipSimulator;
  let routerAddress;
  let ccnsRegister;
  let ccnsReceiver;
  let ccnsLookup;
  let alice;
  const domain = "alice.ccns";
  const chainId = 1; // Example chain ID, adjust as needed

  before(async function () {
    // Get signers
    [alice] = await ethers.getSigners();

    // Deploy CCIPLocalSimulator
    const CCIPLocalSimulator = await ethers.getContractFactory("CCIPLocalSimulator");
    ccipSimulator = await CCIPLocalSimulator.deploy();
    await ccipSimulator.deployed();

    // Get Router contract address
    routerAddress = await ccipSimulator.configuration();

    // Deploy CrossChainNameServiceRegister
    const CCNSRegister = await ethers.getContractFactory("CrossChainNameServiceRegister");
    ccnsRegister = await CCNSRegister.deploy(routerAddress);
    await ccnsRegister.deployed();

    // Deploy CrossChainNameServiceReceiver
    const CCNSReceiver = await ethers.getContractFactory("CrossChainNameServiceReceiver");
    ccnsReceiver = await CCNSReceiver.deploy(routerAddress);
    await ccnsReceiver.deployed();

    // Deploy CrossChainNameServiceLookup
    const CCNSLookup = await ethers.getContractFactory("CrossChainNameServiceLookup");
    ccnsLookup = await CCNSLookup.deploy(routerAddress);
    await ccnsLookup.deployed();

    // Enable chain for the CCNS contracts if necessary
    await ccnsRegister.enableChain(chainId);
    await ccnsReceiver.enableChain(chainId);
    await ccnsLookup.enableChain(chainId);
  });

  it("should register and lookup the domain correctly", async function () {
    // Register the domain
    await ccnsRegister.register(domain, alice.address);

    // Lookup the domain
    const resolvedAddress = await ccnsLookup.lookup(domain);
    expect(resolvedAddress).to.equal(alice.address);
  });
});
