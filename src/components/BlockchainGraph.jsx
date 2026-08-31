import { useState, useCallback, useMemo } from 'react';
import {
    ReactFlow,
    Background,
    Controls,
    MiniMap,
    useNodesState,
    useEdgesState,
    Handle,
    Position,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, X, Shield, Clock, Hash } from 'lucide-react';

// Custom node component
function RecordNode({ data }) {
    return (
        <div className={`px-4 py-3 rounded-xl border backdrop-blur-xl min-w-[140px] transition-all duration-300 cursor-pointer
      ${data.selected
                ? 'bg-cyan-500/20 border-cyan-400/50 shadow-neon'
                : 'bg-white/5 border-white/10 hover:border-cyan-500/30 hover:shadow-neon-sm'
            }`}
        >
            <Handle type="target" position={Position.Left} className="!bg-cyan-400 !w-2 !h-2 !border-0" />
            <Handle type="source" position={Position.Right} className="!bg-cyan-400 !w-2 !h-2 !border-0" />
            <div className="flex items-center gap-2 mb-1">
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${data.type === 'genesis' ? 'bg-purple-500/20' :
                        data.type === 'verified' ? 'bg-emerald-500/20' : 'bg-cyan-500/20'
                    }`}>
                    {data.type === 'genesis' ? (
                        <Shield className="w-3 h-3 text-purple-400" />
                    ) : (
                        <FileText className="w-3 h-3 text-cyan-400" />
                    )}
                </div>
                <span className="text-xs font-semibold text-white truncate">{data.label}</span>
            </div>
            <p className="text-[10px] text-slate-500 font-mono truncate">{data.hash}</p>
        </div>
    );
}

const nodeTypes = { record: RecordNode };

const initialNodes = [
    { id: '1', type: 'record', position: { x: 0, y: 100 }, data: { label: 'Genesis Block', hash: '0x0000...0000', type: 'genesis', timestamp: '2026-01-01', status: 'Verified', records: 0 } },
    { id: '2', type: 'record', position: { x: 250, y: 0 }, data: { label: 'Blood Test', hash: 'QmX7b3...a9f2', type: 'verified', timestamp: '2026-02-15', status: 'Verified', records: 1 } },
    { id: '3', type: 'record', position: { x: 250, y: 200 }, data: { label: 'MRI Scan', hash: 'QmR4k1...c3e8', type: 'verified', timestamp: '2026-02-20', status: 'Verified', records: 1 } },
    { id: '4', type: 'record', position: { x: 500, y: 50 }, data: { label: 'Prescription', hash: 'QmT9p2...d7b1', type: 'pending', timestamp: '2026-02-25', status: 'Pending', records: 1 } },
    { id: '5', type: 'record', position: { x: 500, y: 200 }, data: { label: 'ECG Report', hash: 'QmK8j3...f6c9', type: 'verified', timestamp: '2026-03-01', status: 'Verified', records: 1 } },
    { id: '6', type: 'record', position: { x: 750, y: 120 }, data: { label: 'Lab Results', hash: 'QmW2n5...e4a3', type: 'verified', timestamp: '2026-03-02', status: 'Verified', records: 1 } },
];

const initialEdges = [
    { id: 'e1-2', source: '1', target: '2', animated: true, style: { stroke: '#00F5FF', strokeWidth: 1.5 } },
    { id: 'e1-3', source: '1', target: '3', animated: true, style: { stroke: '#00F5FF', strokeWidth: 1.5 } },
    { id: 'e2-4', source: '2', target: '4', animated: true, style: { stroke: '#00F5FF', strokeWidth: 1.5 } },
    { id: 'e3-5', source: '3', target: '5', animated: true, style: { stroke: '#00F5FF', strokeWidth: 1.5 } },
    { id: 'e4-6', source: '4', target: '6', animated: true, style: { stroke: '#00F5FF', strokeWidth: 1.5 } },
    { id: 'e5-6', source: '5', target: '6', animated: true, style: { stroke: '#00F5FF', strokeWidth: 1.5 } },
];

export default function BlockchainGraph({ className = '' }) {
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
    const [selectedNode, setSelectedNode] = useState(null);

    const onNodeClick = useCallback((_, node) => {
        setSelectedNode(node.data);
    }, []);

    return (
        <div className={`relative w-full h-[500px] rounded-2xl overflow-hidden border border-white/10 bg-navy-950/50 ${className}`}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onNodeClick={onNodeClick}
                nodeTypes={nodeTypes}
                fitView
                proOptions={{ hideAttribution: true }}
                className="!bg-transparent"
            >
                <Background color="rgba(0,245,255,0.03)" gap={30} size={1} />
                <Controls
                    className="!bg-navy-900/80 !border-white/10 !rounded-xl !shadow-glass [&>button]:!bg-white/5 [&>button]:!border-white/10 [&>button]:!text-slate-400 [&>button:hover]:!bg-white/10 [&>button:hover]:!text-white"
                />
                <MiniMap
                    nodeStrokeColor="#00F5FF"
                    nodeColor="#0B1120"
                    maskColor="rgba(2, 6, 23, 0.8)"
                    className="!bg-navy-900/80 !border-white/10 !rounded-xl"
                />
            </ReactFlow>

            {/* Node detail modal */}
            <AnimatePresence>
                {selectedNode && (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="absolute top-4 right-4 w-72 bg-navy-900/95 backdrop-blur-xl border border-white/10 rounded-xl p-5 shadow-glass-lg z-10"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="text-sm font-bold text-white">{selectedNode.label}</h4>
                            <button onClick={() => setSelectedNode(null)} className="text-slate-500 hover:text-white transition-colors">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 text-xs">
                                <Hash className="w-3.5 h-3.5 text-cyan-400" />
                                <span className="text-slate-500">Hash:</span>
                                <span className="text-slate-300 font-mono">{selectedNode.hash}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs">
                                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                                <span className="text-slate-500">Timestamp:</span>
                                <span className="text-slate-300">{selectedNode.timestamp}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs">
                                <Shield className="w-3.5 h-3.5 text-cyan-400" />
                                <span className="text-slate-500">Status:</span>
                                <span className={`font-medium ${selectedNode.status === 'Verified' ? 'text-emerald-400' : 'text-amber-400'}`}>
                                    {selectedNode.status}
                                </span>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
