export const typeOf = function (input: unknown): string {
    const stringTag: string = Object.prototype.toString.call(input);
    return stringTag.match(/(?<=\[\D+ )[A-Za-z]+/)?.shift() ?? 'Unknown';
  };  