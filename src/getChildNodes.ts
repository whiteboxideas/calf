import * as path from 'path';
import { getNonce } from './getNonce';
import { Tree } from './types/Tree';
import { ImportObj } from './types/ImportObj';

export const getChildNodes = (
  imports: ImportObj,
  astToken: { [key: string]: any; },
  props: { [key: string]: boolean; },
  parent: Tree,
  children: { [key: string]: Tree; }
): { [key: string]: Tree; } => {
  if (children[astToken.value]) {
    children[astToken.value].count += 1;
    children[astToken.value].props = {
      ...children[astToken.value].props,
      ...props,
    };
  } else {
    // Add tree node to childNodes if one does not exist
    children[astToken.value] = {
      id: getNonce(),
      name: imports[astToken.value]['importName'],
      fileName: path.basename(imports[astToken.value]['importPath']),
      filePath: path.resolve(
        path.dirname(parent.filePath),
        imports[astToken.value]['importPath']
      ),
      importPath: imports[astToken.value]['importPath'],
      expanded: false,
      depth: parent.depth + 1,
      thirdParty: false,
      reactRouter: false,
      reduxConnect: false,
      count: 1,
      props: props,
      children: [],
      parentList: [parent.filePath].concat(parent.parentList),
      error: '',

      parents:[], 
      mainExports: [],
      fileImports: [],
      parentsAst:[],
      parentsParsed:[],
    };
  }

  return children;
};
