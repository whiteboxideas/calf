import * as path from 'path';
import { getNonce } from './getNonce';
import { Tree } from './types/Tree';
import { traverseTree,getReferencesVS,getDocumentAndPosition} from './helper';
import { pleaseParse } from './pleaseParse';


export class Parser {
  entryFile: string;
  tree: Tree | undefined;

  constructor(filePath: string) {
    // Fix when selecting files in wsl file system
    this.entryFile = filePath;
    if (process.platform === 'linux' && this.entryFile.includes('wsl$')) {
      this.entryFile = path.resolve(
        filePath.split(path.win32.sep).join(path.posix.sep)
      );
      this.entryFile = '/' + this.entryFile.split('/').slice(3).join('/');
      // Fix for when running wsl but selecting files held on windows file system
    } else if (
      process.platform === 'linux' &&
      /[a-zA-Z]/.test(this.entryFile[0])
    ) {
      const root = `/mnt/${this.entryFile[0].toLowerCase()}`;
      this.entryFile = path.join(
        root,
        filePath.split(path.win32.sep).slice(1).join(path.posix.sep)
      );
    }

    this.tree = undefined;
    // Break down and reasemble given filePath safely for any OS using path?
  }

  // Public method to generate component tree based on current entryFile
  public   async parse():  Promise<Tree>  {
    // Create root Tree node
    const root = {
      id: getNonce(),
      name: path.basename(this.entryFile).replace(/\.(t|j)sx?$/, ''),
      fileName: path.basename(this.entryFile),
      filePath: this.entryFile,
      importPath: '/', // this.entryFile here breaks windows file path on root e.g. C:\\ is detected as third party
      expanded: false,
      depth: 0,
      count: 1,
      thirdParty: false,
      reactRouter: false,
      reduxConnect: false,
      children: [],
      parents:null, 
      parentList: [],
      props: {},
      mainExports: [],
      fileImports: [],
      error: '',
    };
    const {document,position}=getDocumentAndPosition(root);


    this.tree = root;
     pleaseParse(root);  
    this.tree.parents = await getReferencesVS(document, position);

    return this.tree;
  }


  
  public getTree(): Tree {
    return this.tree!;
  }

  public setTree(tree: Tree): void {
    this.entryFile = tree.filePath;
    this.tree = tree;
  }

  public updateTree(filePath: string): Tree {
    let children: any[] = [];

    const getChildNodes = (node: Tree): void => {
      const { depth, filePath, expanded } = node;
      children.push({ depth, filePath, expanded });
    };

    const matchExpand = (node: Tree): void => {
      for (let i = 0; i < children.length; i += 1) {
        const oldNode = children[i];
        if (
          oldNode.depth === node.depth &&
          oldNode.filePath === node.filePath &&
          oldNode.expanded
        ) {
          node.expanded = true;
        }
      }
    };

    const parserCallback = (node: Tree): void => {
      if (node.filePath === filePath) {
        node.children.forEach((child) => {
           traverseTree(getChildNodes, child);
        });

        const newNode =  pleaseParse(node);

        traverseTree(matchExpand, newNode);

        children = [];
      }
    };

     traverseTree(parserCallback, this.tree);

    return this.tree!;
  }
 

}


