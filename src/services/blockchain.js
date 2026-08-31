import { HEALTHCARE_ABI } from '../constants/healthcareAbi';
import contractAddress from '../contract-address.json';
import { uploadToIPFS } from './ipfsService';

let ethersPromise = null;
const getEthers = () => {
    if (!ethersPromise) {
        ethersPromise = import('ethers').then(m => m.ethers);
    }
    return ethersPromise;
};

const CONTRACT_ADDRESS = contractAddress.Healthcare;

class BlockchainService {
    constructor() {
        this.contract = null;
        this.provider = null;
        this.signer = null;
        this.connected = false;
        this.connectionAttempted = false;
        this.connectionReason = 'not_attempted';
    }

    async connect(force = false) {
        // Reuse previous result unless explicitly refreshing connectivity.
        if (this.connectionAttempted && !force) return this.connected;
        this.connectionAttempted = true;

        const isLocal = typeof window !== 'undefined' && 
            (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
        if (!isLocal) {
            this.provider = null;
            this.signer = null;
            this.connected = false;
            this.connectionReason = 'production_fallback';
            return false;
        }

        try {
            // Quick abortable network check
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 1500);
            
            const response = await fetch("http://127.0.0.1:8545", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ jsonrpc: "2.0", method: "eth_blockNumber", params: [], id: 1 }),
                signal: controller.signal
            }).catch(() => null);
            clearTimeout(timeoutId);
            if (!response || !response.ok) throw new Error('offline');

            const defaultDevKey = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
            const ethers = await getEthers();
            this.provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545", undefined, {
                staticNetwork: true,
                polling: false,
            });

            this.signer = new ethers.Wallet(defaultDevKey, this.provider);
            await this.setupContract();
            this.connected = true;
            this.connectionReason = 'connected';
            console.log("✅ Connected to local blockchain:", await this.signer.getAddress());
            return true;
        } catch (error) {
            console.warn("⚠️ Local blockchain node not available (http://127.0.0.1:8545). Blockchain features will use mock data. Run `npx hardhat node` to enable.");
            this.provider = null;
            this.signer = null;
            this.connected = false;
            this.connectionReason = 'unreachable';
            return false;
        }
    }

    getConnectionStatus() {
        return {
            connected: this.connected,
            reason: this.connectionReason,
        };
    }

    async setupContract() {
        if (!CONTRACT_ADDRESS) {
            throw new Error("Contract address not found in config");
        }
        const ethers = await getEthers();
        this.contract = new ethers.Contract(
            CONTRACT_ADDRESS,
            HEALTHCARE_ABI,
            this.signer
        );
    }

    async addRecord(file, description) {
        if (!this.connected) await this.connect();
        if (!this.connected) {
            // Return mock transaction when no blockchain node available
            const mockHash = '0x' + Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('');
            return { success: true, hash: mockHash, ipfsHash: 'QmMock' + Date.now() };
        }

        try {
            const ipfsHash = await uploadToIPFS(file);
            const tx = await this.contract.addRecord(ipfsHash, description);
            await tx.wait();
            return { success: true, hash: tx.hash, ipfsHash };
        } catch (error) {
            console.error("Blockchain Error:", error);
            throw error;
        }
    }

    async getRecords(role, patientAddress, viewerAddress) {
        if (!this.connected) await this.connect();
        if (!this.connected) return [];

        try {
            let records;
            if (role === 'doctor' && viewerAddress) {
                records = await this.contract.getPatientRecords.staticCall(patientAddress, {
                    from: viewerAddress,
                });
            } else {
                records = await this.contract.getPatientRecords(patientAddress);
            }
            return records.map(r => ({
                id: r[0].toString(),
                ipfsHash: r[1],
                timestamp: Number(r[2]) * 1000,
                description: r[3],
                uploadedBy: r[4],
                data: {
                    name: r[3] || 'Unnamed Record',
                    type: 'Blockchain Record',
                    imageUrl: `https://ipfs.io/ipfs/${r[1]}`
                },
                hash: r[1]
            }));
        } catch (error) {
            console.error("Fetch Error:", error);
            return [];
        }
    }

    async grantAccess(doctorAddress) {
        if (!this.connected) await this.connect();
        if (!this.connected) throw new Error("Blockchain node not available. Run `npx hardhat node` first.");
        const tx = await this.contract.grantAccess(doctorAddress);
        await tx.wait();
        return tx.hash;
    }

    async revokeAccess(doctorAddress) {
        if (!this.connected) await this.connect();
        if (!this.connected) throw new Error("Blockchain node not available. Run `npx hardhat node` first.");
        const tx = await this.contract.revokeAccess(doctorAddress);
        await tx.wait();
        return tx.hash;
    }

    async checkAccess(patientAddress, doctorAddress) {
        if (!this.connected) await this.connect();
        if (!this.connected) return false;
        return await this.contract.isDoctor(patientAddress, doctorAddress);
    }

    async getCurrentAddress() {
        if (this.signer) {
            return await this.signer.getAddress();
        }
        return null;
    }

    async estimateGasForUpload(description) {
        if (!this.connected) await this.connect();
        if (!this.connected) return { gas: '0', cost: '0.00' };

        try {
            const mockIpfs = "Qm" + "x".repeat(44);
            const gasEstimate = await this.contract.addRecord.estimateGas(mockIpfs, description);
            const feeData = await this.provider.getFeeData();
            const gasPrice = feeData.gasPrice || 1n;
            const ethers = await getEthers();
            return {
                gas: gasEstimate.toString(),
                cost: ethers.formatEther(gasEstimate * gasPrice)
            };
        } catch (error) {
            return { gas: '0', cost: '0.00' };
        }
    }
}

export const blockchainService = new BlockchainService();
