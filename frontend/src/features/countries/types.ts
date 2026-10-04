export type CountryTextNode = {
  type: "text";
  value: string;
};

export type CountryElementNode = {
  type: "element";
  tag: string;
  attributes: Record<string, string>;
  children: CountryNode[];
};

export type CountryNode = CountryTextNode | CountryElementNode;

export type CountryPageData = {
  title: string;
  description: string;
  tree: CountryElementNode;
};
