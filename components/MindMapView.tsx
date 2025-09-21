import React from 'react';
import { MindMap, MindMapNode } from '../types';

interface MindMapNodeComponentProps {
  node: MindMapNode;
}

const MindMapNodeComponent: React.FC<MindMapNodeComponentProps> = ({ node }) => (
  <li>
    <div className="flex items-center">
        <div className="relative px-4 py-2 bg-neutral-800/70 border border-neutral-700/50 rounded-lg text-neutral-200 text-sm font-medium">
            {node.label}
        </div>
    </div>
    {node.children && node.children.length > 0 && (
      <ul>
        {node.children.map(child => <MindMapNodeComponent key={child.id} node={child} />)}
      </ul>
    )}
  </li>
);

export const MindMapView: React.FC<{ mindMap: MindMap }> = ({ mindMap }) => {
    if (!mindMap || !mindMap.root) {
        return (
            <div className="text-center py-10 text-neutral-500 animate-fade-scale-in">
                No mind map could be generated for this topic.
            </div>
        );
    }

    const mindMapStyles = `
        .mind-map {
            display: inline-block;
            min-width: 100%;
        }
        .mind-map, .mind-map ul, .mind-map li {
            position: relative;
        }
        .mind-map ul {
            padding-left: 40px;
            margin-left: 20px;
        }
        .mind-map li {
            list-style-type: none;
            padding: 12px 0;
            animation: fadeScaleIn 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
            opacity: 0;
            transform: scale(0.95);
        }
        /* Connector lines */
        .mind-map li::before, .mind-map li::after {
            content: '';
            position: absolute;
            left: 0;
            background-color: #3d3d3d; /* neutral-600 */
        }
        /* Horizontal line from parent to child */
        .mind-map li::before {
            border-top: 1px solid #3d3d3d;
            top: 50%;
            width: 40px;
            height: 0;
            margin-top: -1px;
        }
        /* Vertical line connecting siblings */
        .mind-map li::after {
            height: 100%;
            width: 1px;
            top: 0;
        }
        /* Remove connector from root node's children */
        .mind-map > ul > li::before, .mind-map > ul > li::after {
            display: none;
        }
        /* Remove dangling connector from last child */
        .mind-map li:last-child::after {
            height: 50%;
        }
        /* Adjust root node style */
        .mind-map > ul > li {
            padding: 0;
        }
        /* Adjust children of root */
        .mind-map > ul > li > ul {
            margin-left: 0;
            padding-left: 60px;
        }
    `;

    return (
        <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-8 overflow-x-auto animate-fade-scale-in">
            <style>{mindMapStyles}</style>
            <div className="mind-map">
                <ul>
                    <MindMapNodeComponent node={mindMap.root} />
                </ul>
            </div>
        </div>
    );
};