import { ImportObj } from './types/ImportObj';

export const checkForRedux = (astTokens: any[], importsObj: ImportObj): boolean => {
  // Check that react-redux is imported in this file (and we have a connect method or otherwise)
  let reduxImported = false;
  let connectAlias;
  Object.keys(importsObj).forEach((key) => {
    if (importsObj[key].importPath === 'react-redux' &&
      importsObj[key].importName === 'connect') {

      reduxImported = true;
      connectAlias = key;
    }
  });

  if (!reduxImported) {
    return false;
  }

  // Check that connect method is invoked and exported in the file
  for (let i = 0; i < astTokens.length; i += 1) {
    if (astTokens[i].type.label === 'export' &&
      astTokens[i + 1].type.label === 'default' &&
      astTokens[i + 2].value === connectAlias) {
      return true;
    }
  }
  return false;
};
