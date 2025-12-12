import { Meta, StoryFn } from '@storybook/react-vite';
import { ProductCard, ProductCardProps } from './ProductCard';
import { fn } from 'storybook/test';

const meta: Meta<typeof ProductCard> = {
  component: ProductCard,
  tags: ['autodocs'],
  args: {
    title: 'Product Name',
    href: '#',
    onAddToCart: fn(),
  },
  argTypes: {
    title: { control: 'text' },
    lead: { control: 'text' },
    price: { control: 'text' },
    buttonText: { control: 'text' },
  },
};

export default meta;

type ProductCardStory = StoryFn<ProductCardProps>;

export const Playground: ProductCardStory = args => <ProductCard {...args} />;

export const Basic: ProductCardStory = () => (
  <ProductCard
    title="Premium Widget"
    lead="A high-quality widget for your needs"
    price="kr 299,00"
    href="/products/premium-widget"
    onAddToCart={() => console.log('Added to cart')}
  />
);

export const WithImage: ProductCardStory = () => (
  <ProductCard
    title="Professional Tool"
    lead="Essential tool for professionals"
    price="kr 499,00"
    href="/products/pro-tool"
    onAddToCart={() => console.log('Added to cart')}
    image={
      <img
        src="https://via.placeholder.com/400x300"
        alt="Professional Tool"
        className="w-full h-48 object-cover"
      />
    }
  />
);

export const WithoutButton: ProductCardStory = () => (
  <ProductCard
    title="Information Only"
    lead="This product card has no add to cart button"
    price="kr 199,00"
    href="/products/info-only"
  />
);

export const CustomButtonText: ProductCardStory = () => (
  <ProductCard
    title="Special Product"
    lead="Product with custom button text"
    price="kr 399,00"
    href="/products/special"
    onAddToCart={() => console.log('Added to cart')}
    buttonText="Kjøp nå"
  />
);

export const LongDescription: ProductCardStory = () => (
  <ProductCard
    title="Product with Long Description"
    lead="This is a very long product description that demonstrates how the component handles text that exceeds the maximum number of lines. The text will be clamped to show only the first two lines with an ellipsis at the end."
    price="kr 599,00"
    href="/products/long-desc"
    onAddToCart={() => console.log('Added to cart')}
  />
);

export const Grid: ProductCardStory = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    <ProductCard
      title="Product One"
      lead="Description for product one"
      price="kr 199,00"
      href="/products/one"
      onAddToCart={() => console.log('Added product one')}
      image={
        <img
          src="https://via.placeholder.com/400x300/3b82f6/ffffff"
          alt="Product One"
          className="w-full h-48 object-cover"
        />
      }
    />
    <ProductCard
      title="Product Two"
      lead="Description for product two"
      price="kr 299,00"
      href="/products/two"
      onAddToCart={() => console.log('Added product two')}
      image={
        <img
          src="https://via.placeholder.com/400x300/10b981/ffffff"
          alt="Product Two"
          className="w-full h-48 object-cover"
        />
      }
    />
    <ProductCard
      title="Product Three"
      lead="Description for product three"
      price="kr 399,00"
      href="/products/three"
      onAddToCart={() => console.log('Added product three')}
      image={
        <img
          src="https://via.placeholder.com/400x300/f59e0b/ffffff"
          alt="Product Three"
          className="w-full h-48 object-cover"
        />
      }
    />
  </div>
);
