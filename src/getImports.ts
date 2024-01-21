import { ImportObj } from './types/ImportObj';
import { findVarDecImports } from './findVarDecImports';

export const getImports = (body: { [key: string]: any; }[]): ImportObj => {
  const bodyImports = body.filter(
    (item) => item.type === 'ImportDeclaration' || 'VariableDeclaration'
  );
  // console.log('bodyImports are: ', bodyImports);
  return bodyImports.reduce((accum, curr) => {

    if (curr.type === 'ImportDeclaration') {
      curr.specifiers.forEach(
        (i: {
          local: { name: string | number; };
          imported: { name: any; };
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
      const importPath = findVarDecImports(curr.declarations[0]);
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
};
