import React, { useState, useEffect } from 'react';
import * as d3 from 'd3';

interface Node {
  id: number;
  x: number;
  y: number;
}

interface Edge {
  source: number;
  target: number;
}

const Graph: React.FC = () => {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [generatedNodeIds, setGeneratedNodeIds] = useState<number[]>([]);
  const [sourceNodeId, setSourceNodeId] = useState<number | undefined>(undefined);
  const [targetNodeId, setTargetNodeId] = useState<number | undefined>(undefined);
  const [edgeToRemove, setEdgeToRemove] = useState<{ source: number, target: number } | undefined>(undefined);

  const width = 600;  // Width of the SVG
  const height = 400; // Height of the SVG

  // Function to add a new node
  const addNode = () => {
    let newNodeId = nodes.length + 1;

    // Ensure newNodeId is unique
    // eslint-disable-next-line no-loop-func
    while (nodes.some(node => node.id === newNodeId)) {
      newNodeId++;
    }

    const newNode = {
      id: newNodeId,
      x: Math.random() * (width - 20) + 10,
      y: Math.random() * (height - 20) + 10,
    };
    setNodes([...nodes, newNode]);
    setGeneratedNodeIds([...generatedNodeIds, newNodeId]);
  };

  // Function to add a new edge
  const addEdge = () => {
    if (sourceNodeId !== undefined && targetNodeId !== undefined) {
      const sourceExists = nodes.some(node => node.id === sourceNodeId);
      const targetExists = nodes.some(node => node.id === targetNodeId);

      if (sourceExists && targetExists) {
        const edgeExists = edges.some(edge =>
          (edge.source === sourceNodeId && edge.target === targetNodeId) ||
          (edge.source === targetNodeId && edge.target === sourceNodeId)
        );

        if (!edgeExists) {
          const newEdge = { source: sourceNodeId, target: targetNodeId };
          setEdges([...edges, newEdge]);
          setSourceNodeId(undefined);
          setTargetNodeId(undefined);
        } else {
          console.log('Edge is already exists');
        }
      } else {
        console.log('One or both of the selected nodes do not exist');
      }
    }
  };

  // Function to remove the last added node
  const removeLastNode = () => {
    if (generatedNodeIds.length > 0) {
      const lastNodeId = generatedNodeIds[generatedNodeIds.length - 1];
      setNodes(nodes.filter(node => node.id !== lastNodeId));
      setEdges(edges.filter(edge => edge.source !== lastNodeId && edge.target !== lastNodeId));
      setGeneratedNodeIds(generatedNodeIds.slice(0, -1));
    }
  };

  // Function to remove an edge
  const removeEdge = () => {
    if (edgeToRemove) {
      setEdges(edges.filter(edge => !(edge.source === edgeToRemove.source && edge.target === edgeToRemove.target)));
      setEdgeToRemove(undefined);
    }
  };

  // Visualization using D3.js
  useEffect(() => {
    const svg = d3.select('svg');
    svg.selectAll('*').remove();

    // Draw the boundary
    svg.append('rect')
      .attr('width', width)
      .attr('height', height)
      .attr('fill', 'none')
      .attr('stroke', 'black')
      .attr('stroke-width', 2);

    const g = svg.append('g');

    // Render edges
g.selectAll('line')
.data(edges)
.enter()
.append('line')
.attr('x1', d => nodes[d.source - 1]?.x)
.attr('y1', d => nodes[d.source - 1]?.y)
.attr('x2', d => nodes[d.target - 1]?.x)
.attr('y2', d => nodes[d.target - 1]?.y)
.style('stroke', 'black')
.style('stroke-width', 2)
.on('mouseover', function () {
  d3.select(this).style('stroke-width', 5); // Make the edge bold on hover
})
.on('mouseout', function () {
  d3.select(this).style('stroke-width', 2); // Reset stroke width when the mouse leaves
});



    // Render nodes
    const nodeSelection = g.selectAll('g.node')
      .data(nodes)
      .enter()
      .append('g')
      .attr('class', 'node')
      .attr('transform', d => `translate(${d.x}, ${d.y})`);

    nodeSelection.append('circle')
      .attr('r', 10)
      .style('fill', 'green')
      .call(d3.drag<SVGCircleElement, Node>()
        .on('start', (event, d) => {
          d3.select(event.sourceEvent.target).raise();
        })
        .on('drag', (event, d) => {
          const newX = Math.max(10, Math.min(width - 10, event.x));
          const newY = Math.max(10, Math.min(height - 10, event.y));

          setNodes(nodes.map(node => {
            if (node.id === d.id) {
              return { ...node, x: newX, y: newY };
            }
            return node;
          }));

          d3.select(event.sourceEvent.target)
            .attr('cx', newX)
            .attr('cy', newY);

          d3.select(event.sourceEvent.target.parentNode)
            .attr('transform', `translate(${newX}, ${newY})`);
        })
      );

    nodeSelection.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .text(d => d.id)
      .style('font-size', '12px')
      .style('fill', 'white');

    nodeSelection.selectAll('circle')
      .on('mouseover', function () {
        d3.select(this).style('fill', 'red');
      })
      .on('mouseout', function () {
        d3.select(this).style('fill', 'green');
      });

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([1, 4])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom as any);

  }, [nodes, edges]);

  
  return (

    <div>
      <svg width={width} height={height}></svg>  
      {/* Node Functions */}
      <div style={{ marginTop: '10px' }}>
        <span style={{ fontWeight: 'bold' }}>Node Functions:</span>
        <div style={{ marginTop: '10px' }}>
          <button onClick={addNode}>Add Node</button>
          <button onClick={removeLastNode}>Remove Last Node</button>
        </div>
      </div>
      
      {/* Edge Functions */}
      <div style={{ marginTop: '10px' }}>
        <span style={{ fontWeight: 'bold' }}>Edge Functions:</span>
        <div style={{ marginTop: '10px' }}>
          <select onChange={(e) => setSourceNodeId(Number(e.target.value))} value={sourceNodeId || ''}>
            <option value="" disabled>Select Source Node</option>
            {nodes.map(node => (
              <option key={node.id} value={node.id}>{`Node ${node.id}`}</option>
            ))}
          </select>
          <select onChange={(e) => setTargetNodeId(Number(e.target.value))} value={targetNodeId || ''}>
            <option value="" disabled>Select Target Node</option>
            {nodes.map(node => (
              <option key={node.id} value={node.id}>{`Node ${node.id}`}</option>
            ))}
          </select>
          <button onClick={addEdge}>Add Edge</button>
        </div> 
      </div>

      <div style={{ marginTop: '10px' }}>
        <select onChange={(e) => {
          const [source, target] = e.target.value.split(',');
          setEdgeToRemove({ source: Number(source), target: Number(target) });
        }} value={edgeToRemove ? `${edgeToRemove.source},${edgeToRemove.target}` : ''}>
          <option value="" disabled>Select Edge to Remove</option>
          {edges.map(edge => (
            <option key={`${edge.source},${edge.target}`} value={`${edge.source},${edge.target}`}>
              {`Edge from Node ${edge.source} to Node ${edge.target}`}
            </option>
          ))}
        </select>
        <button onClick={removeEdge}>Remove Edge</button>
      </div>
    </div>
  );
};


export default Graph;
