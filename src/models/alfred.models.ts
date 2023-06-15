export interface AlfredSnippet {
  snippet: string;
  uid: string;
  name: string;
  keyword: string;
}

export interface AlfredSnippetWrapper {
  alfredsnippet: AlfredSnippet;
}

export function isAlfredSnippet(arg: any): arg is AlfredSnippet {
  const hasSnippet = arg.snippet !== undefined;
  const hasUid = arg.uid !== undefined;
  const hasName = arg.name !== undefined;
  const HasKeyword = arg.keyword !== undefined;
  console.log({ arg, hasSnippet, hasUid, hasName, HasKeyword });
  return hasSnippet && hasUid && hasName && HasKeyword;
}
