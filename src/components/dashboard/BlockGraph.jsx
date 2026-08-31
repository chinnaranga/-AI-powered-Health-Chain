import React from 'react';
import { motion } from 'framer-motion';

// Generates a horizontal chain of SVG block nodes
const BlockGraph = ({ blocks = [], accent = '#14B8A6' }) => {
    const displayBlocks = blocks.slice(-8); // show last 8
    const W = 100;
    const H = 56;
    const nodeW = 64;
    const nodeH = 36;
    const spacing = 32;
    const totalW = displayBlocks.length * (nodeW + spacing) - spacing;

    return (
        <div className="overflow-x-auto pb-2">
            <svg
                viewBox={`0 0 ${totalW || 400} ${H}`}
                style={{ width: Math.max(totalW, 400), height: H }}
                className="overflow-visible"
            >
                {displayBlocks.map((block, i) => {
                    const x = i * (nodeW + spacing);
                    const cy = H / 2;
                    const isLast = i === displayBlocks.length - 1;
                    return (
                        <g key={block.id ?? i}>
                            {/* Connector line */}
                            {i > 0 && (
                                <line
                                    x1={x}
                                    y1={cy}
                                    x2={x - spacing}
                                    y2={cy}
                                    stroke="#334155"
                                    strokeWidth="1.5"
                                    strokeDasharray="4 3"
                                />
                            )}
                            {/* Block rect */}
                            <rect
                                x={x}
                                y={cy - nodeH / 2}
                                width={nodeW}
                                height={nodeH}
                                rx={6}
                                fill={isLast ? `${accent}22` : '#1E293B'}
                                stroke={isLast ? accent : '#334155'}
                                strokeWidth={isLast ? 1.5 : 1}
                            />
                            {/* Block number */}
                            <text
                                x={x + nodeW / 2}
                                y={cy - 4}
                                textAnchor="middle"
                                fontSize="9"
                                fill={isLast ? accent : '#64748B'}
                                fontFamily="monospace"
                                fontWeight="700"
                            >
                                #{block.id ?? i + 1}
                            </text>
                            {/* Hash preview */}
                            <text
                                x={x + nodeW / 2}
                                y={cy + 8}
                                textAnchor="middle"
                                fontSize="7"
                                fill="#475569"
                                fontFamily="monospace"
                            >
                                {String(block.hash ?? block.ipfsHash ?? '0x???').substring(0, 8)}
                            </text>
                        </g>
                    );
                })}
            </svg>
        </div>
    );
};

export default BlockGraph;
