import * as React from "react";
import {Flow} from './Flow';
import {Navbar} from './Navbar';
import { useSidebarLogic } from "./sidebar-parts/useSidebarLogic";
 //lets see if this works
export const Sidebar = () => {
  const {rootFile,initialNodes, initialEdges, nodeIDs,handleAllProps}: any =  useSidebarLogic()
  return (
    <div className="sidebar">
      <Navbar rootFile={rootFile} />
      <Flow initialNodes={initialNodes} initialEdges={initialEdges} handleAllProps={handleAllProps} />
    </div>
  );
};