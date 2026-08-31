import { useState, useEffect } from 'react';

export function useBlockStream() {
    const [blocks, setBlocks] = useState([]);
    const [latestBlockNumber, setLatestBlockNumber] = useState(null);

    useEffect(() => {
        let isSubscribed = true;
        let provider = null;
        let blockListener = null;
        let interval = null;

        const init = async () => {
            const isLocal = typeof window !== 'undefined' && 
                (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
            if (!isLocal) return;

            try {
                // Abortable fetch check
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 1000);
                const response = await fetch("http://127.0.0.1:8545", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ jsonrpc: "2.0", method: "eth_blockNumber", params: [], id: 1 }),
                    signal: controller.signal
                });
                clearTimeout(timeoutId);
                if (!response.ok) return;
            } catch {
                return; // Silent connection failure
            }

            try {
                const { ethers } = await import('ethers');
                provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545", undefined, {
                    staticNetwork: true
                });

                const currentBlockNumber = await provider.getBlockNumber();
                if (!isSubscribed) return;

                const fetchLatestBlocks = async (blockNum) => {
                    try {
                        const newBlocks = [];
                        for (let i = 0; i < 5; i++) {
                            const bNum = blockNum - i;
                            if (bNum < 0) break;
                            
                            const blockInfo = await provider.getBlock(bNum);
                            if (blockInfo) {
                                newBlocks.push({
                                    number: blockInfo.number,
                                    hash: blockInfo.hash,
                                    timestamp: blockInfo.timestamp,
                                    txCount: blockInfo.transactions.length
                                });
                            }
                        }
                        
                        if (isSubscribed) {
                            setBlocks(newBlocks.sort((a, b) => a.number - b.number));
                            setLatestBlockNumber(blockNum);
                        }
                    } catch (error) {
                        // Suppress background block fetching logs
                    }
                };

                await fetchLatestBlocks(currentBlockNumber);

                blockListener = (bNum) => {
                    fetchLatestBlocks(bNum);
                };

                provider.on("block", blockListener);

                interval = setInterval(async () => {
                     try {
                        const nextBlockNumber = await provider.getBlockNumber();
                        if (nextBlockNumber !== latestBlockNumber && isSubscribed) {
                             fetchLatestBlocks(nextBlockNumber);
                        }
                     } catch(e){}
                }, 12000);

            } catch (e) {
                // Ignore if node goes down after initial setup
            }
        };

        init();

        return () => {
            isSubscribed = false;
            if (provider && blockListener) {
                provider.off("block", blockListener);
            }
            if (interval) {
                clearInterval(interval);
            }
        };
    }, [latestBlockNumber]);

    return { blocks, latestBlockNumber };
}
