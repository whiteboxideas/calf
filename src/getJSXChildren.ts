import { Tree } from './types/Tree';
import { ImportObj } from './types/ImportObj';
import { getChildNodes } from './getChildNodes';
import { getJSXProps } from './getJSXProps';

// Finds JSX React Components in current file
export const getJSXChildren = (astTokens: any[], importsObj: ImportObj, parentNode: Tree): Tree[] => {
  let childNodes: { [key: string]: Tree; } = {};
  let props: { [key: string]: boolean; } = {};
  let token: { [key: string]: any; };

  for (let i = 0; i < astTokens.length; i++) {
    // Case for finding JSX tags eg <App .../>
    if (astTokens[i].type.label === 'jsxTagStart' &&
      astTokens[i + 1].type.label === 'jsxName' &&
      importsObj[astTokens[i + 1].value]) {
      token = astTokens[i + 1];
      props = getJSXProps(astTokens, i + 2);
      childNodes = getChildNodes(
        importsObj,
        token,
        props,
        parentNode,
        childNodes
      );

      // Case for finding components passed in as props e.g. <Route component={App} />
    } else if (astTokens[i].type.label === 'jsxName' &&
      (astTokens[i].value === 'component' ||
        astTokens[i].value === 'children') &&
      importsObj[astTokens[i + 3].value]) {
      token = astTokens[i + 3];
      childNodes = getChildNodes(
        importsObj,
        token,
        props,
        parentNode,
        childNodes
      );
    }
  }

  return Object.values(childNodes);
};
