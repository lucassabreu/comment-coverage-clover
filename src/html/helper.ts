interface Stringable {
  toString: () => string;
}

const tag =
  (name: string) =>
  (children: Stringable[], attr?: Record<string, Stringable>) =>
    `<${name}${
      (attr &&
        " ".concat(
          Object.keys(attr)
            .map((k) => k + "=" + JSON.stringify(attr[k]))
            .join(" ")
        )) ||
      ""
    }>${children.join("")}</${name}>`;

export const c =
  (name: string) =>
  (...children: Stringable[]) =>
    tag(name)(children);

export const details = c("details");
export const summary = c("summary");
export const table = c("table");
export const tbody = c("tbody");
export const thead = c("thead");
export const tr = c("tr");
export const th = c("th");
export const td = (content: Stringable, attr?: Record<string, Stringable>) =>
  tag("td")([content], attr);
export const b = c("b");
export const fragment = (...children: Stringable[]) => children.join("");
export const span = (content: Stringable, attr?: Record<string, Stringable>) =>
  tag("span")([content], attr);
export const a = (href: string, content: string) =>
  tag("a")([content], { href });
