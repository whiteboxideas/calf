import * as React from "react";

import { useEffect  } from "react";
import { Node, Edge } from "reactflow";
import Badge from '@mui/material/Badge';
import TextSnippetIcon from '@mui/icons-material/TextSnippet';
import CloseFullscreenIcon from '@mui/icons-material/CloseFullscreen';
import InfoIcon from '@mui/icons-material/Info';

import CIcon from "@coreui/icons-react";
import { cibRedux } from "@coreui/icons"; 
import { viewFile, postMessage } from "./vscodeUtils";
import { useMessageHandler } from "./useMessageHandler";


export const useSidebarLogic = () => {
    const initialNodes: Node[] = []; 
    const initialEdges: Edge[] = [];
    let viewData: any;
    const nodeIDs =[]
    let id = 0;

    const {treeData,settings,rootFile} = useMessageHandler( );
  
     // Separate useEffect that gets triggered when the treeData and settings state variables get updated
     useEffect(() => {
      if (treeData && settings) {
        // Invoke parser to parse based on user's settings
        parseViewTree();
      }
    }, [treeData, settings]);
  
     // Edits and returns component tree based on users settings
     const parseViewTree = (): void => {
      console.log('useSidebarLogic.tsx-35: treeData',treeData);
      // Deep copy of the treeData passed in
      const treeParsed = JSON.parse(JSON.stringify(treeData[0]));
  
      // Helper function for the recursive parsing
      const traverse = (node: any): void => {
        let validChildren = [];
  
        // Logic to parse the nodes based on the users settings
        for (let i = 0; i < node.children.length; i++) {
          if (
            node.children[i].thirdParty &&
            settings.thirdParty &&
            !node.children[i].reactRouter
          ) {
            validChildren.push(node.children[i]);
          } else if (node.children[i].reactRouter && settings.reactRouter) {
            validChildren.push(node.children[i]);
          } else if (
            !node.children[i].thirdParty &&
            !node.children[i].reactRouter
          ) {
            validChildren.push(node.children[i]);
          }
        }
  
        // Update children with only valid nodes, and recurse through each node
        node.children = validChildren;
        node.children.forEach((child: any) => {
          traverse(child);
        });
      };
  
      // Invoking the helper function
      traverse(treeParsed);
      // Update the vewData state
      viewData = ([treeParsed])
      getNodes(viewData);
      makeEdges(viewData);
    };

    const handleAllProps = (displayValue) => {
      for (let i = 0; i < nodeIDs.length; i++) {
        const id = nodeIDs[i];
        const propsDiv = document.getElementById(id);
        propsDiv.style.display = displayValue
      }
    }
   
    
  
    const handleProps = (id) => {
      const propsDiv = document.getElementById(id);
      const styles = window.getComputedStyle(propsDiv);
      const display = styles.getPropertyValue('display');
      if (display === 'none') propsDiv.style.display = 'block';
      else propsDiv.style.display = 'none'
    }
    
    const getNodes = (tree: any) => {
      if (!tree) {
        return;
      }
      tree.forEach((item: any) => {
        if ( item.mainExports.length > 0) nodeIDs.push(item.id);
        const node = {
          id: (++id).toString(),
          data: {
            // if the item has props, show them on each div
            label: (
              // <Badge badgeContent={item.count} color="primary">
              <div className="nodeData">
                {/* for rendering modal to show live render of component */}
                  {item.count > 1 && (
                    <Badge badgeContent={item.count}  sx={{
                      "& .MuiBadge-badge": {
                        color: "var(--vscode-button-foreground)",
                        backgroundColor: "var(--vscode-settings-focusedRowBorder)"
                      }
                    }}>
                    </Badge>
                  )}
                <p className='nodeTitle'
                  style={{
                    fontFamily: 'var(--vscode-font-family)',
                    fontStyle: 'normal',
                    fontWeight: 700,
                    paddingBottom: '6px',
                    margin: "8px 0px 2px 0px",
                    textAlign: "center",
                    color: 'var(--vscode-foreground)',
                    fontSize: '22px',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    borderBottom: "2px solid var(--vscode-settings-focusedRowBorder)"
  
                  }}
                >
                  {item.fileName}
                </p>
                {/* {Object.keys(item.props).length > 0 &&
                  (
                    <>
                      <div id={item.id} 
                        style={{
                          display: "none",
                          columnWidth: '112px',
                          fontSize: '11pt',
                          color: 'var(--vscode-foreground)',
                          borderBottom: "2px solid var(--vscode-settings-focusedRowBorder)",
                          padding: '4px 0px 6px 5px',
                          wordBreak: 'break-all'
                        }}
                      >
                        {Object.keys(item.props).map((prop: any, idx: number) => (
                          <div key={idx} style={{display: 'flex' }}>
                            &#8226;{prop}
                          </div>
                        ))}
                      </div>
                    </>
                  )} */}
                  <div id={item.id} style={{ display: 'none', justifyContent: 'space-between' }}>
                    {item.mainExports.length > 0 && (
                      <>
                        <div
                          
                          style={{
                            display: 'block',
                            columnWidth: '112px',
                            fontSize: '11pt',
                            color: 'var(--vscode-foreground)',
                            borderBottom: '2px solid var(--vscode-settings-focusedRowBorder)',
                            padding: '4px 0px 6px 5px',
                            wordBreak: 'break-all',
                          }}
                        >
                          Exports:
                          {item.mainExports.map(({ name, start, isDefault }) => (
                            <div key={name + start} style={{ display: 'flex', color: isDefault && 'black' }}>
                              &#8226;{name}
                            </div>
                          ))}
                        </div>
                      </>
                    )}

                    {item.fileImports.length > 0 && (
                      <>
                        <div 
                          style={{
                            display: 'block',
                            columnWidth: '112px',
                            fontSize: '11pt',
                            color: 'var(--vscode-foreground)',
                            borderBottom: '2px solid var(--vscode-settings-focusedRowBorder)',
                            padding: '4px 0px 6px 5px',
                            wordBreak: 'break-all',
                          }}
                        >
                          Imports:
                          {item.fileImports.map((item) => {
                            const sourceValue = item.source.value;
const lastPart = sourceValue.split('/').pop();
                            return (
                              <div key={lastPart} style={{ display: 'flex', color: item.isLibraryImport && 'black' }}>
                                &#8226;{lastPart}
                              </div>
                            );
                          })}
                        </div>
                      </>
                    )}
                  </div>
                <div style={{justifyContent: 'space-between', display: 'flex', margin: '5px 0px'}}>
                  <div className="nodeToolbar">
                    { item.mainExports.length > 0 && (
                        <InfoIcon data-property={id.toString()} style={{ cursor: "pointer", padding: '0px 3px' }} htmlColor={'var(--vscode-foreground)'} sx={{ fontSize: 19 }} onClick={() => handleProps(item.id)}/>
                      )}
                      <TextSnippetIcon style={{ cursor: "pointer", padding: '0px 3px' }} htmlColor={'var(--vscode-foreground)'} sx={{ fontSize: 19 }} onClick={() => viewFile(item.filePath)}/>
                      <InfoIcon data-property={id.toString()} style={{ cursor: "pointer", padding: '0px 3px' }} htmlColor={'var(--vscode-foreground)'} sx={{ fontSize: 19 }} onClick={() =>  {console.log('test')}}/>
                   
                  </div>
                  <div className="nodeIndicators">
                    {item.reduxConnect && (
                      <CIcon icon={cibRedux} width={12} height={12}/>
                    )}
                  </div>
                </div>
              </div>
            ),
          },
          onClick : () => handleProps(item.fileName),
          position: { x: 0, y: 0 },
          type: item.depth === 0 ? 'input' : '',
          // hidden: item.depth === 1 ||item.depth === 0?  false : true,
          style: {
            backgroundColor:  item.depth === 1 ||item.depth === 0 ? 'rgba(0, 255, 0, 0.25)':"var(--vscode-dropdown-background)",
            borderRadius: "15px",
            width: '265px',
            boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)',
            border: item.children.length===0? 'none' : '1px solid red',
            padding: '10px 10px 3px 10px'
          },
        };
        initialNodes.push(node);
        if (item.children) {
          getNodes(item.children); 
        }
      });
    };
  
    //initialEdges test
    let ide = 0;
  
    const makeEdges = (tree: any, parentId?: any) => {
      if (!tree) {
        return;
      }
      tree.forEach((item: any) => {
        const nodeId = ++ide;
        if (parentId) {
          const edge = {
            id: `e${parentId}-${nodeId}`,
            source: parentId.toString(),
            target: nodeId.toString(),
            type: 'smoothstep',
            animated: false,
          };
          initialEdges.push(edge);
        }
        if (item.children) {
          makeEdges(item.children, nodeId);
        }
      });
    };
  
   
  
    return {rootFile,initialNodes, initialEdges, nodeIDs,handleAllProps}
  }