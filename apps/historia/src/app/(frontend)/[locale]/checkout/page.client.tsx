'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { VippsButton } from '@eventuras/ratio-ui/core/Button';
import { Input, Select } from '@eventuras/ratio-ui/forms';

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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto max-w-7xl px-4 py-8">
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
            <span className="ml-3 text-gray-600 dark:text-gray-400">Laster...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
      <div className="container mx-auto max-w-7xl px-4 py-6 sm:py-8">
        {/* Header with progress */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Kasse
          </h1>

          {/* Progress steps */}
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white text-sm font-medium">
                1
              </div>
              <span className="text-sm font-medium text-gray-900 dark:text-white hidden sm:inline">
                Leveringsinformasjon
              </span>
            </div>
            <div className="h-px flex-1 bg-gray-300 dark:bg-gray-700"></div>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-300 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-sm font-medium">
                2
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400 hidden sm:inline">
                Betaling
              </span>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:gap-8 lg:grid-cols-3">
          {/* Left column - Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              {/* Vipps Express CTA */}
              <div className="rounded-xl bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 p-4 sm:p-6 border border-orange-200 dark:border-orange-800">
                <div className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M13.5 2C11.567 2 10 3.567 10 5.5c0 1.933 1.567 3.5 3.5 3.5S17 7.433 17 5.5 15.433 2 13.5 2zm-3 7.5C8.567 9.5 7 11.067 7 13s1.567 3.5 3.5 3.5S14 14.933 14 13s-1.567-3.5-3.5-3.5zM7 17.5C5.067 17.5 3.5 19.067 3.5 21s1.567 3.5 3.5 3.5 3.5-1.567 3.5-3.5-1.567-3.5-3.5-3.5z"/>
                  </svg>
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-orange-900 dark:text-orange-100 mb-1">
                      Vil du slippe å fylle ut skjema?
                    </h3>
                    <p className="text-xs text-orange-800 dark:text-orange-200 mb-3">
                      Med Vipps Hurtigutsjekk får du automatisk utfylt kontaktinfo og adresse fra din Vipps-profil.
                    </p>
                    <VippsButton
                      type="button"
                      onClick={async () => {
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

                          if (result.success && result.data.redirectUrl) {
                            window.location.assign(result.data.redirectUrl);
                          } else {
                            alert('Kunne ikke opprette betaling');
                            setSubmitting(false);
                          }
                        } catch (error) {
                          console.error('Express checkout error:', error);
                          alert('En uventet feil oppstod');
                          setSubmitting(false);
                        }
                      }}
                      loading={submitting}
                      locale={locale}
                      testId="express-checkout-button"
                      ariaLabel="Betal med Vipps Hurtigutsjekk"
                    />
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300 dark:border-gray-700"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400">
                    eller fyll ut manuelt
                  </span>
                </div>
              </div>

              {/* Contact Information */}
              <div className="rounded-xl bg-white dark:bg-gray-800 p-4 sm:p-6 shadow-sm">
                <h2 className="mb-4 sm:mb-6 text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                  Kontaktinformasjon
                </h2>

                <div className="space-y-4">
                  <Input
                    name="email"
                    type="email"
                    label="E-post"
                    placeholder="din@epost.no"
                    value={formData.email}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handleInputChange('email', e.target.value)
                    }
                    errors={errors}
                    noMargin
                  />

                  <div className="grid gap-4 sm:grid-cols-2">
                    <Input
                      name="firstName"
                      type="text"
                      label="Fornavn"
                      value={formData.firstName}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleInputChange('firstName', e.target.value)
                      }
                      errors={errors}
                      noMargin
                    />

                    <Input
                      name="lastName"
                      type="text"
                      label="Etternavn"
                      value={formData.lastName}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleInputChange('lastName', e.target.value)
                      }
                      errors={errors}
                      noMargin
                    />
                  </div>

                  <Input
                    name="phoneNumber"
                    type="tel"
                    label="Telefonnummer"
                    placeholder="+47 123 45 678"
                    value={formData.phoneNumber}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handleInputChange('phoneNumber', e.target.value)
                    }
                    errors={errors}
                    noMargin
                  />
                </div>
            </div>

            {/* Delivery Address */}
            <div className="rounded-xl bg-white dark:bg-gray-800 p-4 sm:p-6 shadow-sm">
              <h2 className="mb-4 sm:mb-6 text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                Leveringsadresse
              </h2>

              <div className="space-y-4">
                <Input
                  name="addressLine1"
                  type="text"
                  label="Gateadresse"
                  placeholder="Eksempel: Storgata 1"
                  value={formData.addressLine1}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleInputChange('addressLine1', e.target.value)
                  }
                  errors={errors}
                  noMargin
                />

                <Input
                  name="addressLine2"
                  type="text"
                  label="Adressetillegg"
                  description="Leilighet, etasje, osv. (valgfritt)"
                  placeholder="Leilighet, etasje, osv."
                  value={formData.addressLine2}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleInputChange('addressLine2', e.target.value)
                  }
                  noMargin
                />

                <div className="grid gap-4 sm:grid-cols-2">
                  <Input
                    name="postalCode"
                    type="text"
                    label="Postnummer"
                    placeholder="0000"
                    maxLength={4}
                    value={formData.postalCode}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handleInputChange('postalCode', e.target.value)
                    }
                    errors={errors}
                    noMargin
                  />

                  <Input
                    name="city"
                    type="text"
                    label="Poststed"
                    placeholder="Oslo"
                    value={formData.city}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handleInputChange('city', e.target.value)
                    }
                    errors={errors}
                    noMargin
                  />
                </div>

                <Select
                  label="Land"
                  value={formData.country}
                  onSelectionChange={(value) => handleInputChange('country', value)}
                  options={[{ value: 'NO', label: 'Norge' }]}
                />
              </div>
            </div>

            {/* Submit Button - Mobile Sticky */}
            <div className="lg:hidden">
              <div className="rounded-xl bg-white dark:bg-gray-800 p-4 shadow-sm">
                <div className="mb-3 flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Total</span>
                  <span className="text-xl font-bold text-gray-900 dark:text-white">
                    {formatPrice(totalInCents / 100, 'NOK', locale)}
                  </span>
                </div>
                <VippsButton
                  type="submit"
                  loading={submitting}
                  locale={locale}
                  block
                  testId="checkout-submit"
                  ariaLabel="Gå til betaling med Vipps"
                />
              </div>
            </div>

            {/* Submit Button - Desktop */}
            <div className="hidden lg:block">
              <div className="rounded-xl bg-white dark:bg-gray-800 p-4 sm:p-6 shadow-sm">
                <VippsButton
                  type="submit"
                  loading={submitting}
                  locale={locale}
                  block
                  testId="checkout-submit"
                  ariaLabel="Gå til betaling med Vipps"
                />
              </div>
            </div>
          </form>
        </div>

        {/* Right column - Order Summary */}
        <div className="lg:col-span-1">
          <div className="rounded-xl bg-white dark:bg-gray-800 p-4 sm:p-6 shadow-sm lg:sticky lg:top-4">
            <h2 className="mb-4 sm:mb-6 text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
              Ordresammendrag
            </h2>

            {/* Products */}
            <div className="space-y-3 mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
              {cartWithProducts.map((item) => {
                const product = item.product;
                if (!product) return null;

                const price = product.price?.amount || 0;
                const total = price * item.quantity;

                return (
                  <div key={item.productId} className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {product.title}
                      </p>
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        {item.quantity} × {formatPrice(price, 'NOK', locale)}
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white whitespace-nowrap">
                      {formatPrice(total, 'NOK', locale)}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Price breakdown */}
            <div className="space-y-3 mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Delsum (ekskl. mva)</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {formatPrice((totalInCents / 100) / 1.25, 'NOK', locale)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">MVA (25%)</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {formatPrice((totalInCents / 100) - (totalInCents / 100) / 1.25, 'NOK', locale)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Frakt</span>
                <span className="text-gray-600 dark:text-gray-400">Beregnes senere</span>
              </div>
            </div>

            {/* Total */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-base font-semibold text-gray-900 dark:text-white">Total</span>
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatPrice(totalInCents / 100, 'NOK', locale)}
              </span>
            </div>

            {/* Info text */}
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Du vil bli sendt til Vipps for å fullføre betalingen. Frakt beregnes basert på leveringsvalg.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
