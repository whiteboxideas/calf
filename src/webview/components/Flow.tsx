import * as React from 'react';
import { useCallback, useEffect, useState } from 'react';
import ReactFlow, {
  useNodesState,
  useEdgesState,
  addEdge,
  ConnectionLineType,
  Controls,
    MiniMap,
} from 'reactflow';
import * as dagre from 'dagre';

import 'reactflow/dist/style.css';
import '../dagre.css'; 
import { LayoutSwitchButton } from './LayoutSwitchButton';
import { ShowAllPropsButton } from './ShowAllPropsButton';

export const Flow = ({ initialNodes, initialEdges, handleAllProps}: any) => {  
  const addNewTools = () => {
    const extraButton1 = document.createElement('button');
    const extraButton2 = document.createElement('button');

    extraButton1.setAttribute('type', 'button');
    extraButton2.setAttribute('type', 'button');

    extraButton1.setAttribute('class', 'react-flow__controls-button react-flow__controls-interactive');
    extraButton2.setAttribute('class', 'react-flow__controls-button react-flow__controls-interactive');

    const toolbar = document.getElementsByClassName('react-flow__panel react-flow__controls bottom left');
    toolbar[0].appendChild(extraButton1);
    toolbar[0].appendChild(extraButton2);
  };
  const [showAllProps, setShowAllProps]: [boolean, Function] = useState(false);
  const [vertical, setVertical] = useState(false);

  useEffect(() => { 
    setTimeout(addNewTools, 5);
  }, []);
  
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  const nodeWidth = 250;
  const nodeHeight = 120;
  const [disabled, setDisabled]: any = useState(false);
//this is the function that does the layout of the graph based on the direction of the graph
  const getLayoutedElements = (
    nodes: any[],
    edges: any[],
    direction = 'TB'
  ) => {
    console.log('nodes before layout', nodes);
    const isHorizontal = direction === 'LR';
    dagreGraph.setGraph({ rankdir: direction });

    nodes.forEach((node) => {
      dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
    });

    edges.forEach((edge) => {
      dagreGraph.setEdge(edge.source, edge.target);
    });

    dagre.layout(dagreGraph);

    nodes.forEach((node) => {
      const nodeWithPosition = dagreGraph.node(node.id);
      node.targetPosition = isHorizontal ? 'left' : 'top';
      node.sourcePosition = isHorizontal ? 'right' : 'bottom';

      // We are shifting the dagre node position (anchor=center center) to the top left
      // so it matches the React Flow node anchor point (top left).
      node.position = {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeHeight / 2,
      };
      return node;
    });
    return { nodes, edges };
  };

  const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
    initialNodes,
    initialEdges,
    'LR'
  );

  useEffect(() => {
    if (initialNodes) {
      setNodes(initialNodes);
    }
    if (initialEdges) {
      setEdges(initialEdges);
    }
  }, [initialNodes]);

  const [nodes, setNodes, onNodesChange] = useNodesState(layoutedNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(layoutedEdges);

  const onConnect = useCallback(
    (params) =>
      setEdges((eds) =>
        addEdge(
          { ...params, type: ConnectionLineType.SmoothStep, animated: true },
          eds
        )
      ),
    []
  );
  
  const onLayout = useCallback(
    ( ) => {
      console.log('layout',vertical);
      const localDirection = vertical ? 'LR' : 'LR';
      setDisabled(!disabled);
      const { nodes: layoutedNodes, edges: layoutedEdges } =
        getLayoutedElements(nodes, edges, localDirection);
      setNodes([...layoutedNodes]);
      setEdges([...layoutedEdges]);
    },
    [nodes, edges,vertical]
  );

  const onNodeClickToggleCollapse = (event: any, node: any) => {
    console.log('node', node );
    console.log('nodes', nodes );
    // if (node.type === 'input') {
    //   return;
    // }
    // node.isHidden = !node.isHidden;
    // setNodes([...nodes]);
  }
  return (
    <div className="tree_view" >
      <div className="layoutflow">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClickToggleCollapse}
          onConnect={onConnect}
          connectionLineType={ConnectionLineType.SmoothStep}
          maxZoom={0.8}
          fitView={true}
          zoomOnScroll={true}
        >
          <MiniMap 
            nodeColor={(node) => {
              switch (node.type) {
                case 'input': return '#ACD9D9';
                case 'default': return 'blue';
                case 'output': return 'green';
                default: return '#eee';
              }
            }}
          />
          <Controls  />
                </ReactFlow>
         {/* <LayoutSwitchButton vertical={vertical} onLayout={onLayout} setVertical={setVertical} />
         <ShowAllPropsButton showAllProps={showAllProps} handleAllProps={handleAllProps} setShowAllProps={setShowAllProps} /> */}
      </div>
    </div>
  );
};

 