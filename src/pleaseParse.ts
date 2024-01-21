import * as babelParser from '@babel/parser';
import * as path from 'path';
import * as fs from 'fs';
import { Tree } from './types/Tree';
import { File } from '@babel/types';
import {
  extractExportsAndImportsFromAST,
  getFileName, getJSXChildren, checkForRedux, getImports
} from './helper';

export function pleaseParse(componentTree: Tree, maxDepth: any = 100): Tree | undefined {
  // If import is a node module, do not parse any deeper
  if (!['\\', '/', '.'].includes(componentTree.importPath[0])) {
    componentTree.thirdParty = true;
    if (componentTree.fileName === 'react-router-dom' ||
      componentTree.fileName === 'react-router') {
      componentTree.reactRouter = true;
    }
    return;
  }

  // Check that file has valid fileName/Path, if not found, add error to node and halt
  const fileName = getFileName(componentTree);
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
  const { fileExports, fileImports } = extractExportsAndImportsFromAST(ast);
  componentTree.mainExports = fileExports;
  componentTree.fileImports = fileImports;
  // Find imports in the current file, then find child components in the current file
  const imports = getImports(ast.program.body);

  // Get any JSX Children of current file:
  if (ast.tokens) {
    componentTree.children = getJSXChildren(
      ast.tokens,
      imports,
      componentTree
    );
  }

  // Check if current node is connected to the Redux store
  if (ast.tokens) {
    componentTree.reduxConnect = checkForRedux(ast.tokens, imports);
  }
  // Recursively parse all child components
  if (maxDepth > 0)
    componentTree.children.forEach((child) => pleaseParse(child, maxDepth - 1));
  return componentTree;
}
