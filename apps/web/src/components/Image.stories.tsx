/* eslint-disable jsx-a11y/alt-text */
import { Meta } from '@storybook/react';
import React from 'react';

import Image, { ImageProps } from './Image';

function getRandomImageUrl(): { url: string; width: number; height: number } {
  const width = Math.floor(Math.random() * 1000) + 200;
  const height = Math.floor(Math.random() * 600) + 200;
  const url = `https://picsum.photos/${width}/${height}`;

  return { url, width, height };
}

const meta: Meta<typeof Image> = {
  component: Image,
  tags: ['autodocs'],
  argTypes: {
    src: { control: 'text', description: 'Image URL' },
    alt: { control: 'text', description: 'Alternative text for the image' },
    caption: { control: 'text', description: 'Caption for the image' },
    imgClassName: { control: 'text', description: 'CSS classes for custom styling' },
    width: { control: 'number', description: 'Image width' },
    height: { control: 'number', description: 'Image height' },
  },
};
export default meta;

export const DefaultImage = (args: ImageProps) => <Image {...args} />;
const randomDefaultImage = getRandomImageUrl();
DefaultImage.args = {
  src: randomDefaultImage.url,
  alt: 'A beautiful landscape',
  caption: 'A breathtaking view of nature',
  width: randomDefaultImage.width,
  height: randomDefaultImage.height,
};

export const ImageWithoutCaption = (args: ImageProps) => <Image {...args} />;
const randomImageWithoutCaption = getRandomImageUrl();
ImageWithoutCaption.args = {
  src: randomImageWithoutCaption.url,
  alt: 'A cute animal',
  width: randomImageWithoutCaption.width,
  height: randomImageWithoutCaption.height,
};

export const ImageWithCustomDimensions = (args: ImageProps) => <Image {...args} />;
const randomImageWithCustomDimensions = getRandomImageUrl();
ImageWithCustomDimensions.args = {
  src: randomImageWithCustomDimensions.url,
  alt: 'An artistic masterpiece',
  caption: 'An inspiring work of art',
  width: randomImageWithCustomDimensions.width,
  height: randomImageWithCustomDimensions.height,
};

export const ImageWithCustomStyling = (args: ImageProps) => <Image {...args} />;
const randomImageWithCustomStyling = getRandomImageUrl();
ImageWithCustomStyling.args = {
  src: randomImageWithCustomStyling.url,
  alt: 'A stylish fashion shot',
  caption: 'A glimpse of the latest fashion trends',
  className: 'border-4 border-pink-500',
  width: randomImageWithCustomStyling.width,
  height: randomImageWithCustomStyling.height,
};
