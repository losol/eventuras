import React from 'react';

import Card from './Card';

export default {
  title: 'Components/Card',
  tags: ['autodocs'],
  component: Card,
};

export const Default = () => (
  <Card>
    <Card.Heading>Default Card</Card.Heading>
    <Card.Text>This is a default card with heading and text.</Card.Text>
  </Card>
);

export const WithImage = () => (
  <Card>
    <Card.Heading>Card with Image</Card.Heading>
    <Card.Text>This card includes an image.</Card.Text>
    <Card.Image
      src="https://placebeard.it/g/400/300"
      alt="An example image"
      width={400}
      height={300}
    />
  </Card>
);

export const MultipleTexts = () => (
  <Card>
    <Card.Heading>Card with Multiple Texts</Card.Heading>
    <Card.Text>Text 1: Short description.</Card.Text>
    <Card.Text>Text 2: Another short description.</Card.Text>
  </Card>
);

export const ComplexCard = () => (
  <Card>
    <Card.Heading>Complex Card</Card.Heading>
    <Card.Text>This card includes various elements.</Card.Text>
    <Card.Image
      src="https://placebeard.it/g/600/300"
      alt="An example image"
      width={600}
      height={200}
    />
    <Card.Text>Additional text below the image.</Card.Text>
  </Card>
);

export const CustomClasses = () => (
  <Card>
    <Card.Heading className="bg-teal-200">Custom Styling</Card.Heading>
    <Card.Text className="text-red-500">This card has custom styling applied.</Card.Text>
  </Card>
);
