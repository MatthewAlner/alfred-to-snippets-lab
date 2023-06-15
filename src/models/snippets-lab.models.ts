export interface SnippetsLabCollection {
  contents: Contents;
}
export interface Contents {
  folders?: ISnipLabFolder[];
  snippets?: ISnipLabSnippet[];
  smartGroups?: ISnipLabSmartGroup[];
  tags?: ISnipLabTag[];
}
export interface ISnipLabFolder {
  title?: string;
  uuid: string;
  children?: ISnipLabFolder[];
}
export interface ISnipLabTag {
  title?: string;
  uuid: string;
}
export interface ISnipLabSnippet {
  title: string;
  folder?: string;
  fragments: ISnipLabFragment[];
  tags?: string[];
  dateCreated?: string;
  dateModified?: string;
  uuid?: string;
}
export interface ISnipLabFragment {
  title?: string;
  language?: string;
  note?: string;
  content: string;
  dateCreated?: string;
  dateModified?: string;
  uuid?: string;
}
export interface ISnipLabSmartGroup {
  title?: string;
  predicate: string;
  uuid: string;
}
