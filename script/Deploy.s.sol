// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../src/ReputationSBT.sol";
import "../src/MockProtocolFactory.sol";

contract Deploy is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        
        console.log("Deploying from:", deployer);
        console.log("Balance:", deployer.balance);
        
        vm.startBroadcast(deployerPrivateKey);
        
        // 1. Deploy ReputationSBT
        console.log("\n=== DEPLOYING REPUTATION SYSTEM ===");
        ReputationSBT reputationSBT = new ReputationSBT();
        console.log("ReputationSBT deployed at:", address(reputationSBT));
        
        // 2. Deploy Mock Protocol Factory
        console.log("\n=== DEPLOYING MOCK PROTOCOLS ===");
        MockProtocolFactory factory = new MockProtocolFactory();
        console.log("MockProtocolFactory deployed at:", address(factory));
        
        // 3. Deploy all protocols
        factory.deployAllProtocols();
        
        // 4. Get addresses
        (
            address namoshi,
            address satsuma,
            address spine,
            address mintpark,
            address asigna,
            address dvote
        ) = factory.getAllAddresses();
        
        console.log("Namoshi deployed at:", namoshi);
        console.log("Satsuma deployed at:", satsuma);
        console.log("Spine deployed at:", spine);
        console.log("MintPark deployed at:", mintpark);
        console.log("Asigna deployed at:", asigna);
        console.log("DVote deployed at:", dvote);
        
        // 5. Deploy orchestrator
        DemoOrchestrator orchestrator = new DemoOrchestrator(
            namoshi, satsuma, spine, mintpark, asigna, dvote
        );
        console.log("DemoOrchestrator deployed at:", address(orchestrator));
        
        // 6. Authorize deployer as relay
        reputationSBT.setAuthorizedRelay(deployer, true);
        console.log("Authorized deployer as relay");
        
        vm.stopBroadcast();
        
        // 7. Print env vars
        console.log("\n=== UPDATE YOUR .env FILE ===");
        console.log("REPUTATION_CONTRACT_ADDRESS=", vm.toString(address(reputationSBT)));
        console.log("NAMOSHI_CONTRACT_ADDRESS=", vm.toString(namoshi));
        console.log("SATSUMA_CONTRACT_ADDRESS=", vm.toString(satsuma));
        console.log("SPINE_CONTRACT_ADDRESS=", vm.toString(spine));
        console.log("MINT_PARK_CONTRACT_ADDRESS=", vm.toString(mintpark));
        console.log("ASIGNA_CONTRACT_ADDRESS=", vm.toString(asigna));
        console.log("DVOTE_CONTRACT_ADDRESS=", vm.toString(dvote));
    }
}
