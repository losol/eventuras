type EnumType = { [s: number]: string };

export const mapEnum = (enumerable: EnumType, fn: (m: any, i: number) => void): any[] => {
  // get all the members of the enum
  const enumMembers: any[] = Object.keys(enumerable).map((key: any) => enumerable[key]);
  // now map through the enum values
  return enumMembers.map((m, i) => fn(m, i));
};
