import { Tree } from './types/Tree';

export const traverseTree = (
  callback: Function,
  node: Tree | undefined
): void => {
  if (!node) {
    return;
  }

  callback(node);

  node.children.forEach((childNode) => {
    traverseTree(callback, childNode);
  });
};
