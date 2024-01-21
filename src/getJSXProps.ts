export const getJSXProps = (astTokens: { [key: string]: any; }[], j: number): { [key: string]: boolean; } => {
  const props: any = {};
  while (astTokens[j].type.label !== 'jsxTagEnd') {
    if (astTokens[j].type.label === 'jsxName' &&
      astTokens[j + 1].value === '=') {
      props[astTokens[j].value] = true;
    }
    j += 1;
  }
  return props;
};
