// inspired by https://stackoverflow.com/a/17694737/4413516

const slugify = (str: string): string => {
  // Convert the string to lowercase
  str = str.toLowerCase();

  // Define character conversions using an object
  const conversions: { [key: string]: string } = {
    e: 'æ|ä',
    o: 'ø|ö',
    a: 'å',
  };

  // Loop through conversions and replace characters
  for (const i in conversions) {
    if (conversions.hasOwnProperty(i)) {
      const re = new RegExp(conversions[i], 'g');
      str = str.replace(re, i);
    }
  }

  return str
    .normalize('NFKD') // Normalize Unicode characters
    .replace(/\p{Diacritic}/gu, '') // Replace accented characters
    .replace(/[^a-z0-9 -]/g, '') // Replace everything not a-z or a number
    .replace(/\s+/g, '-'); // Replace spaces with hyphens
};

export default slugify;
