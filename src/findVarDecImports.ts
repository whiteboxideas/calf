
export const findVarDecImports = (ast: { [key: string]: any; }): string | boolean => {
  // Base Case, find import path in variable declaration and return it,
  if (ast.hasOwnProperty('callee') && ast.callee.type === 'Import') {
    return ast.arguments[0].value;
  }

  // Otherwise look for imports in any other non null/undefined objects in the tree:
  for (let key in ast) {
    if (ast.hasOwnProperty(key) && typeof ast[key] === 'object' && ast[key]) {
      const importPath = findVarDecImports(ast[key]);
      if (importPath) {
        return importPath;
      }
    }
  }

  return false;
};
