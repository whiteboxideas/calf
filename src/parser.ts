import * as babelParser from '@babel/parser';
import * as path from 'path';
import * as fs from 'fs';
import { getNonce } from './getNonce';
import { Tree } from './types/Tree';
import { ImportObj } from './types/ImportObj';
import { File}  from '@babel/types';
import * as vscode from 'vscode';
import { extractExportsAndImportsFromAST,
   getFileName, getJSXChildren, traverseTree 
  ,getReferencesVS} from './helper';
 

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

    this.tree = root;
    this.parser(root);  

    const document = vscode.window.activeTextEditor.document.uri; 
    const position = new vscode.Position(root.mainExports[0]?.loc?.start?.line-1, root.mainExports[0]?.loc?.start?.column-1); // replace with the actual position
     
    let  parents  = await getReferencesVS(document, position) ;
    this.tree.parents = parents;
    return this.tree;
  }

  public getTree(): Tree {
    return this.tree!;
  }

  // Set Sapling Parser with a specific Data Tree (from workspace state)
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

        const newNode = this.parser(node);

        traverseTree(matchExpand, newNode);

        children = [];
      }
    };

     traverseTree(parserCallback, this.tree);

    return this.tree!;
  }

  // Traverses the tree and changes expanded property of node whose id matches provided id
  public toggleNode(id: string, expanded: boolean): Tree {
    const callback = (node: { id: string; expanded: boolean }) => {
      if (node.id === id) {
        node.expanded = expanded;
      }
    };

       traverseTree(callback, this.tree);

    return this.tree!;
  }

  // Traverses all nodes of current component tree and applies callback to each node

  // Recursively builds the React component tree structure starting from root node
  private parser(componentTree: Tree,maxDepth:any=103): Tree | undefined {
    // If import is a node module, do not parse any deeper
    if (!['\\', '/', '.'].includes(componentTree.importPath[0])) {
      componentTree.thirdParty = true;
      if (
        componentTree.fileName === 'react-router-dom' ||
        componentTree.fileName === 'react-router'
      ) {
        componentTree.reactRouter = true;
      }
      return;
    }

    // Check that file has valid fileName/Path, if not found, add error to node and halt
    const fileName =  getFileName(componentTree);
    if (!fileName) {
      componentTree.error = 'File not found.';
      return;
    }

    // If current node recursively calls itself, do not parse any deeper:
    if (componentTree.parentList.includes(componentTree.filePath)) {
      return;
    }

    // Create abstract syntax tree of current component tree file
    let ast: babelParser.ParseResult<File>;
    try {
      ast = babelParser.parse(
        fs.readFileSync(path.resolve(componentTree.filePath), 'utf-8'),
        {
          sourceType: 'module',
          tokens: true,
          plugins: ['jsx', 'typescript'],
        }
      );
    } catch (err) {
      componentTree.error = 'Error while processing this file/node';
      return componentTree;
    } 
     const { fileExports, fileImports }= extractExportsAndImportsFromAST(ast);
      componentTree.mainExports =fileExports;
      componentTree.fileImports =fileImports;
    // Find imports in the current file, then find child components in the current file
    const imports = this.getImports(ast.program.body);

    // Get any JSX Children of current file:
    if (ast.tokens) {
      componentTree.children =  getJSXChildren(
        ast.tokens,
        imports,
        componentTree
      );
    }

    // Check if current node is connected to the Redux store
    if (ast.tokens) {
      componentTree.reduxConnect = this.checkForRedux(ast.tokens, imports);
    }

    // Recursively parse all child components
    if(maxDepth>0)
    componentTree.children.forEach((child) => this.parser(child,maxDepth-1));

    return componentTree;
  } 

 
  // Extracts Imports from current file
  // const Page1 = lazy(() => import('./page1')); -> is parsed as 'ImportDeclaration'
  // import Page2 from './page2'; -> is parsed as 'VariableDeclaration'
  private getImports(body: { [key: string]: any }[]): ImportObj {
    const bodyImports = body.filter(
      (item) => item.type === 'ImportDeclaration' || 'VariableDeclaration'
    );
    // console.log('bodyImports are: ', bodyImports);
    return bodyImports.reduce((accum, curr) => {
       
      if (curr.type === 'ImportDeclaration') {
        curr.specifiers.forEach(
          (i: {
            local: { name: string | number };
            imported: { name: any };
          }) => {
            accum[i.local.name] = {
              importPath: curr.source.value,
              importName: i.imported ? i.imported.name : i.local.name,
            };
          }
        );
      }
      // Imports Inside Variable Declarations: // Not easy to deal with nested objects
      if (curr.type === 'VariableDeclaration') {
        const importPath = this.findVarDecImports(curr.declarations[0]);
        if (importPath) {
          const importName = curr.declarations[0].id.name;
          accum[curr.declarations[0].id.name] = {
            importPath,
            importName,
          };
        }
      }
      return accum;
    }, {});
  }

  // Recursive helper method to find import path in Variable Declaration
  private findVarDecImports(ast: { [key: string]: any }): string | boolean {
    // Base Case, find import path in variable declaration and return it,
    if (ast.hasOwnProperty('callee') && ast.callee.type === 'Import') {
      return ast.arguments[0].value;
    }

    // Otherwise look for imports in any other non null/undefined objects in the tree:
    for (let key in ast) {
      if (ast.hasOwnProperty(key) && typeof ast[key] === 'object' && ast[key]) {
        const importPath = this.findVarDecImports(ast[key]);
        if (importPath) {
          return importPath;
        }
      }
    }

    return false;
  }

 
  // Extracts prop names from a JSX element
 
  // Checks if current Node is connected to React-Redux Store
  private checkForRedux(astTokens: any[], importsObj: ImportObj): boolean {
    // Check that react-redux is imported in this file (and we have a connect method or otherwise)
    let reduxImported = false;
    let connectAlias;
    Object.keys(importsObj).forEach((key) => {
      if (
        importsObj[key].importPath === 'react-redux' &&
        importsObj[key].importName === 'connect'
      ) { 

        reduxImported = true;
        connectAlias = key;
      }
    });

    if (!reduxImported) {
      return false;
    }

    // Check that connect method is invoked and exported in the file
    for (let i = 0; i < astTokens.length; i += 1) {
      if (
        astTokens[i].type.label === 'export' &&
        astTokens[i + 1].type.label === 'default' &&
        astTokens[i + 2].value === connectAlias
      ) {
        return true;
      }
    }
    return false;
  }
}




