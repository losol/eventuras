'use client';

import React, { useEffect } from 'react';
import { RelationshipField, useField } from '@payloadcms/ui';
import type { RelationshipFieldClientComponent } from 'payload';

export const ProductFieldWithPricePopulation: RelationshipFieldClientComponent = (props) => {
  const { path } = props;

  // Use useField to monitor the product value and update other fields
  const { value: productValue } = useField({ path });

  // Get the form field updaters for price fields
  const priceAmountPath = path.replace('product', 'price.amountExVat');
  const priceCurrencyPath = path.replace('product', 'price.currency');
  const priceVatRatePath = path.replace('product', 'price.vatRate');

  const priceAmount = useField({ path: priceAmountPath });
  const priceCurrency = useField({ path: priceCurrencyPath });
  const priceVatRate = useField({ path: priceVatRatePath });

  // Watch for changes to the product field and populate price
  useEffect(() => {
    const populatePrice = async () => {
      // If a product was selected and price is not already set
      if (productValue && !priceAmount?.value) {
        try {
          const productId =
            typeof productValue === 'object' && 'value' in productValue
              ? productValue.value
              : productValue;

          console.log('Fetching product:', productId);

          // Fetch product details from Payload API
          const response = await fetch(`/api/products/${productId}?depth=0`, {
            credentials: 'include',
          });

          if (response.ok) {
            const product = await response.json();

            console.log('Product data:', product);
            console.log('Product price:', product.price);

            // Update price fields if product has price data
            if (product.price?.amountExVat && priceAmount?.setValue) {
              console.log('Setting amountExVat:', product.price.amountExVat);
              priceAmount.setValue(product.price.amountExVat);
            }
            if (product.price?.currency && priceCurrency?.setValue) {
              console.log('Setting currency:', product.price.currency);
              priceCurrency.setValue(product.price.currency);
            }
            if (product.price?.vatRate !== undefined && priceVatRate?.setValue) {
              console.log('Setting vatRate:', product.price.vatRate);
              priceVatRate.setValue(product.price.vatRate);
            } else if (priceVatRate?.setValue && !priceVatRate.value) {
              // Default to 25% if not set
              console.log('Setting default vatRate: 25');
              priceVatRate.setValue(25);
            }
          } else {
            console.error('Failed to fetch product:', response.status);
          }
        } catch (error) {
          console.error('Failed to fetch product data:', error);
        }
      }
    };

    populatePrice();
  }, [productValue, priceAmount, priceCurrency, priceVatRate]);

  return <RelationshipField {...props} />;
};
