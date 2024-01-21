
export const filterReferencesUnique = (references: any, originalPath: string) => {
  const filteredReferences = references.reduce((acc, curr) => {
    // Exclude the one with the same fsPath as the input uri.fsPath
    if (curr.uri.fsPath === originalPath) {
      return acc;
    }

    // If the fsPath is already in the accumulator, update it 
    const existing = acc.find(ref => {
      return ref.uri.fsPath === curr.uri.fsPath;
    });

    if (existing) {
      const index = acc.indexOf(existing);
      acc[index] = curr;
    } else {
      acc.push(curr);
    }
    return acc;
  }, []);

  return filteredReferences;
};
