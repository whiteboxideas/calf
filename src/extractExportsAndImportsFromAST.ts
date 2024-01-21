import * as babelParser from '@babel/parser';
import { File, isVariableDeclaration, isIdentifier, ExportNamedDeclaration, ExportDefaultDeclaration, ImportDeclaration } from '@babel/types';
import { NodePath, traverse } from '@babel/core';

export const extractExportsAndImportsFromAST = (ast: babelParser.ParseResult<File>) => {
  let fileExports = [];
  let fileImports = [];

  traverse(ast, {
    ExportNamedDeclaration(path: NodePath<ExportNamedDeclaration>) {
      const declaration = path.node.declaration;

      if (isVariableDeclaration(declaration) && declaration.kind === 'const') {
        const variableDeclarator = declaration.declarations[0];
        if (isIdentifier(variableDeclarator.id)) {
          fileExports.push({
            ...variableDeclarator.id,
            isDefault: false,
          });
        }
      }
    },
    ExportDefaultDeclaration(path: NodePath<ExportDefaultDeclaration>) {
      const declaration = path.node.declaration;

      if (isIdentifier(declaration)) {
        fileExports.push({
          ...declaration,
          isDefault: true,
        });
      }
    },
    ImportDeclaration(path: NodePath<ImportDeclaration>) {
      const source = path.node.source.value;
      const isLibraryImport = !source.startsWith('.');
      fileImports.push({
        ...path.node,
        isLibraryImport: isLibraryImport,
      });
    },
  });

  return { fileExports, fileImports };
};
