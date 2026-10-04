import { createElement, type HTMLAttributes } from "react";

import type { CountryNode } from "../types";

const attributeMap: Record<string, string> = {
  class: "className",
  for: "htmlFor",
  tabindex: "tabIndex",
  fetchpriority: "fetchPriority",
  crossorigin: "crossOrigin",
  referrerpolicy: "referrerPolicy",
  "stroke-width": "strokeWidth",
  "stroke-linecap": "strokeLinecap",
  "stroke-linejoin": "strokeLinejoin",
};

const voidElements = new Set([
  "area", "base", "br", "col", "embed", "hr", "img", "input",
  "link", "meta", "param", "source", "track", "wbr",
]);

function propsFrom(attributes: Record<string, string>) {
  return Object.fromEntries(
    Object.entries(attributes).map(([name, value]) => [attributeMap[name] ?? name, value]),
  ) as HTMLAttributes<HTMLElement>;
}

export function CountryNodeView({ node, nodeKey }: { node: CountryNode; nodeKey: string }) {
  if (node.type === "text") return node.value;

  if (voidElements.has(node.tag)) {
    return createElement(node.tag, { ...propsFrom(node.attributes), key: nodeKey });
  }

  return createElement(
    node.tag,
    { ...propsFrom(node.attributes), key: nodeKey },
    node.children.map((child, index) => (
      <CountryNodeView key={`${nodeKey}-${index}`} node={child} nodeKey={`${nodeKey}-${index}`} />
    )),
  );
}
