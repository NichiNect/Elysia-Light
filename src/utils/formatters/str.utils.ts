export const Str = {
  snake(value: string, delimiter: string = "_"): string {
    return value
      .replace(/\.?([A-Z]+)/g, (x, y) => delimiter + y.toLowerCase())
      .replace(new RegExp("^" + delimiter), "");
  },

  slug(value: string, delimiter: string = "-"): string {
    return value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, delimiter)
      .replace(new RegExp(`${delimiter}+$`), "")
      .replace(new RegExp(`^${delimiter}+`), "");
  },

  pluralStudly(value: string): string {
    const studly = value
      .replace(/[-_]/g, " ")
      .replace(/\b\w/g, (l) => l.toUpperCase())
      .replace(/\s+/g, "");

    return studly.endsWith("s") ? studly : studly + "s";
  },

  camel(value: string): string {
    return value
      .replace(/[-_](.)/g, (_, group1) => group1.toUpperCase())
      .replace(/^(.)/, (match) => match.toLowerCase());
  },

  studly(value: string): string {
    return value
      .replace(/[-_]/g, " ")
      .replace(/\b\w/g, (l) => l.toUpperCase())
      .replace(/\s+/g, "");
  },

  pascal(str: string): string {
    return str
      .replace(/[_\- ]+/g, " ")     
      .split(" ")     
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join("");
}
};
