'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { VippsButton } from '@eventuras/ratio-ui/core/Button';

import { useCart } from '@/lib/cart';
import { formatPrice } from '@/lib/format-price';
import type { Product } from '@/payload-types';

import { getCartProducts } from './actions';
import { createVippsExpressPayment } from './vippsActions';

interface CheckoutPageClientProps {
  locale: string;
}

interface CheckoutFormData {
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  addressLine1: string;
  addressLine2?: string;
  postalCode: string;
  city: string;
  country: string;
}

export function CheckoutPageClient({ locale }: CheckoutPageClientProps) {
  const router = useRouter();
  const { items } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<CheckoutFormData>({
    email: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    addressLine1: '',
    addressLine2: '',
    postalCode: '',
    city: '',
    country: 'NO',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof CheckoutFormData, string>>>({});

  // Load products
  useEffect(() => {
    async function loadProducts() {
      if (items.length === 0) {
        setProducts([]);
        setLoading(false);
        return;
      }

      const result = await getCartProducts(items.map((item) => item.productId));

      if (result.success) {
        setProducts(result.data);
      }
      setLoading(false);
    }

    loadProducts();
  }, [items]);

  // Redirect if cart is empty
  useEffect(() => {
    if (!loading && items.length === 0) {
      router.push(`/${locale}/cart`);
    }
  }, [loading, items.length, locale, router]);

  const cartWithProducts = items.map((item) => ({
    ...item,
    product: products.find((p) => p.id === item.productId),
  }));

  // Calculate total - price.amount is in NOK, convert to øre for Vipps
  const totalInCents = cartWithProducts.reduce((sum, item) => {
    const price = item.product?.price?.amount || 0;
    return sum + price * item.quantity * 100;
  }, 0);

  const handleInputChange = (field: keyof CheckoutFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof CheckoutFormData, string>> = {};

    if (!formData.email.trim()) {
      newErrors.email = 'E-post er påkrevd';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Ugyldig e-postadresse';
    }

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Fornavn er påkrevd';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Etternavn er påkrevd';
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Telefonnummer er påkrevd';
    } else if (!/^\+?[0-9\s-]{8,}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Ugyldig telefonnummer';
    }

    if (!formData.addressLine1.trim()) {
      newErrors.addressLine1 = 'Adresse er påkrevd';
    }

    if (!formData.postalCode.trim()) {
      newErrors.postalCode = 'Postnummer er påkrevd';
    } else if (!/^\d{4}$/.test(formData.postalCode)) {
      newErrors.postalCode = 'Ugyldig postnummer (4 siffer)';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'Poststed er påkrevd';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);

    try {
      const result = await createVippsExpressPayment({
        amount: totalInCents,
        currency: 'NOK',
        items: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
        products,
        userLanguage: locale,
      });

      if (!result.success) {
        alert(`Betalingsfeil: ${result.error.message}`);
        setSubmitting(false);
        return;
      }

      // Redirect to Vipps
      if (result.data.redirectUrl) {
        window.location.assign(result.data.redirectUrl);
      } else {
        alert('Ingen redirect URL mottatt');
        setSubmitting(false);
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('En uventet feil oppstod');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto max-w-6xl px-4 py-8">
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
          <span className="ml-3 text-gray-600">Laster...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold text-gray-900 dark:text-white">Kasse</h1>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left column - Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Contact Information */}
            <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
              <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
                Kontaktinformasjon
              </h2>

              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    E-post *
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={`w-full rounded-md border px-4 py-2 ${
                      errors.email
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
                    } bg-white dark:bg-gray-900 text-gray-900 dark:text-white`}
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email}</p>
                  )}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="firstName"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      Fornavn *
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      className={`w-full rounded-md border px-4 py-2 ${
                        errors.firstName
                          ? 'border-red-500 focus:ring-red-500'
                          : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
                      } bg-white dark:bg-gray-900 text-gray-900 dark:text-white`}
                    />
                    {errors.firstName && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                        {errors.firstName}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="lastName"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      Etternavn *
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      className={`w-full rounded-md border px-4 py-2 ${
                        errors.lastName
                          ? 'border-red-500 focus:ring-red-500'
                          : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
                      } bg-white dark:bg-gray-900 text-gray-900 dark:text-white`}
                    />
                    {errors.lastName && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                        {errors.lastName}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="phoneNumber"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Telefonnummer *
                  </label>
                  <input
                    type="tel"
                    id="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                    placeholder="+47 123 45 678"
                    className={`w-full rounded-md border px-4 py-2 ${
                      errors.phoneNumber
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
                    } bg-white dark:bg-gray-900 text-gray-900 dark:text-white`}
                  />
                  {errors.phoneNumber && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {errors.phoneNumber}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Delivery Address */}
            <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
              <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
                Leveringsadresse
              </h2>

              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="addressLine1"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Adresse *
                  </label>
                  <input
                    type="text"
                    id="addressLine1"
                    value={formData.addressLine1}
                    onChange={(e) => handleInputChange('addressLine1', e.target.value)}
                    className={`w-full rounded-md border px-4 py-2 ${
                      errors.addressLine1
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
                    } bg-white dark:bg-gray-900 text-gray-900 dark:text-white`}
                  />
                  {errors.addressLine1 && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {errors.addressLine1}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="addressLine2"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Adressetillegg (valgfritt)
                  </label>
                  <input
                    type="text"
                    id="addressLine2"
                    value={formData.addressLine2}
                    onChange={(e) => handleInputChange('addressLine2', e.target.value)}
                    className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-4 py-2 focus:ring-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="postalCode"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      Postnummer *
                    </label>
                    <input
                      type="text"
                      id="postalCode"
                      value={formData.postalCode}
                      onChange={(e) => handleInputChange('postalCode', e.target.value)}
                      maxLength={4}
                      className={`w-full rounded-md border px-4 py-2 ${
                        errors.postalCode
                          ? 'border-red-500 focus:ring-red-500'
                          : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
                      } bg-white dark:bg-gray-900 text-gray-900 dark:text-white`}
                    />
                    {errors.postalCode && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                        {errors.postalCode}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="city"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      Poststed *
                    </label>
                    <input
                      type="text"
                      id="city"
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      className={`w-full rounded-md border px-4 py-2 ${
                        errors.city
                          ? 'border-red-500 focus:ring-red-500'
                          : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
                      } bg-white dark:bg-gray-900 text-gray-900 dark:text-white`}
                    />
                    {errors.city && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.city}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="country"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Land *
                  </label>
                  <select
                    id="country"
                    value={formData.country}
                    onChange={(e) => handleInputChange('country', e.target.value)}
                    className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-4 py-2 focus:ring-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                  >
                    <option value="NO">Norge</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
              <VippsButton
                type="submit"
                loading={submitting}
                locale={locale}
                block
                testId="checkout-submit"
                ariaLabel="Gå til betaling med Vipps"
              />
            </div>
          </form>
        </div>

        {/* Right column - Order Summary */}
        <div className="lg:col-span-1">
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 sticky top-4">
            <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
              Ordresammendrag
            </h2>

            <div className="space-y-3 border-b border-gray-200 dark:border-gray-700 pb-4 mb-4">
              {cartWithProducts.map((item) => {
                const product = item.product;
                if (!product) return null;

                const price = product.price?.amount || 0;
                const total = price * item.quantity;

                return (
                  <div key={item.productId} className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white">{product.title}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Antall: {item.quantity}
                      </p>
                    </div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {formatPrice(total, 'NOK', locale)}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="space-y-2 border-b border-gray-200 dark:border-gray-700 pb-4 mb-4">
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Delsum</span>
                <span>{formatPrice(totalInCents / 100, 'NOK', locale)}</span>
              </div>
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Frakt</span>
                <span>Velges i neste steg</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold text-gray-900 dark:text-white">Totalt</span>
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatPrice(totalInCents / 100, 'NOK', locale)} +
              </span>
            </div>

            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              Frakt og totalpris beregnes i Vipps basert på leveringsvalg
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
