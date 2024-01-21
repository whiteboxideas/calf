import * as path from 'path';
import * as fs from 'fs';
import { Tree } from './types/Tree';

// Finds files where import string does not include a file extension
export function getFileName(componentTree: Tree): string | undefined {
  const ext = path.extname(componentTree.filePath);
  let fileName: string | undefined = componentTree.fileName;

  if (!ext) {
    // Try and find file extension that exists in directory:
    const fileArray = fs.readdirSync(path.dirname(componentTree.filePath));
    const regEx = new RegExp(`${componentTree.fileName}.(j|t)sx?$`);
    fileName = fileArray.find((fileStr) => fileStr.match(regEx));
    fileName ? (componentTree.filePath += path.extname(fileName)) : null;
  }

  return fileName;
}
