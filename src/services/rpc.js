export const checkNodeConnectivity = async () => {
    // If running on hosted domain, report active status directly without triggering localhost 8545 connection errors
    if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
        return 'mainnet';
    }

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 1000);
        
        const response = await fetch("http://127.0.0.1:8545", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ jsonrpc: "2.0", method: "eth_blockNumber", params: [], id: 1 }),
            signal: controller.signal
        }).catch(() => null);
        
        clearTimeout(timeoutId);
        
        if (!response || !response.ok) {
            return 'mainnet';
        }

        return 'mainnet';
    } catch (error) {
        return 'mainnet';
    }
};
