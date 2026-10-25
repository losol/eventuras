'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { Logger } from '@eventuras/logger';
import { Button } from '@eventuras/ratio-ui/core/Button';
import { RadioGroup, Switch, TextField } from '@eventuras/ratio-ui/forms';
import { Drawer } from '@eventuras/ratio-ui/layout/Drawer';
import { useToast } from '@eventuras/ratio-ui/toast';

import { PurposeKind } from '@/lib/eventuras-types';

import { createProcessingPurpose } from './actions';

const logger = Logger.create({
  namespace: 'web:admin:system',
  context: { component: 'CreateProcessingPurpose' },
});

/** Same rule as the API: lowercase words joined by dots or hyphens. */
const CODE_PATTERN = /^[a-z0-9]+([.-][a-z0-9]+)*$/;

type Form = {
  code: string;
  name: string;
  text: string;
  kind: PurposeKind;
  hasSpecialCategoryData: boolean;
};

const emptyForm: Form = {
  code: '',
  name: '',
  text: '',
  kind: PurposeKind.RESERVATION,
  hasSpecialCategoryData: false,
};

/** Button + drawer to create a processing purpose (SystemAdmin only). */
export const CreateProcessingPurpose = () => {
  const t = useTranslations();
  const router = useRouter();
  const toast = useToast();

  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const closeDrawer = () => {
    setForm(emptyForm);
    setError(null);
    setIsSaving(false);
    setIsOpen(false);
  };

  // Blocked while saving, so a request in flight cannot report into a closed drawer.
  const requestClose = () => {
    if (isSaving) return;
    closeDrawer();
  };

  const set = (patch: Partial<Form>) => {
    setForm(prev => ({ ...prev, ...patch }));
    if (error) setError(null);
  };

  const codeIsValid = CODE_PATTERN.test(form.code.trim());
  const canSave = codeIsValid && form.name.trim() !== '' && form.text.trim() !== '';

  const handleSave = async () => {
    if (!canSave) return;
    setIsSaving(true);
    setError(null);
    try {
      const result = await createProcessingPurpose(form);
      if (!result.success) {
        setError(result.error.message || t('admin.system.purposes.create.error'));
        return;
      }
      toast.success(t('admin.system.purposes.create.success'));
      closeDrawer();
      router.refresh();
    } catch (err) {
      logger.error({ error: err, code: form.code }, 'Failed to create processing purpose');
      setError(t('admin.system.purposes.create.error'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>{t('admin.system.purposes.create.button')}</Button>

      <Drawer isOpen={isOpen} onClose={requestClose}>
        <Drawer.Header as="h2">{t('admin.system.purposes.create.title')}</Drawer.Header>
        <Drawer.Body>
          <div className="space-y-4">
            <TextField
              name="code"
              label={t('admin.system.purposes.create.code')}
              placeholder="marketing.newsletter"
              value={form.code}
              onChange={e => set({ code: e.target.value })}
              disabled={isSaving}
              autoFocus
              required
            />
            {form.code.trim() !== '' && !codeIsValid && (
              <p className="text-sm" role="alert">
                {t('admin.system.purposes.create.codeInvalid')}
              </p>
            )}
            <TextField
              name="name"
              label={t('admin.system.purposes.create.name')}
              value={form.name}
              onChange={e => set({ name: e.target.value })}
              disabled={isSaving}
              required
            />
            <TextField
              name="text"
              label={t('admin.system.purposes.create.text')}
              value={form.text}
              onChange={e => set({ text: e.target.value })}
              disabled={isSaving}
              multiline
              rows={3}
              required
            />
            <Switch
              isSelected={form.hasSpecialCategoryData}
              isDisabled={isSaving}
              onChange={special =>
                // Special category data may only be processed with consent.
                set(
                  special
                    ? { hasSpecialCategoryData: true, kind: PurposeKind.CONSENT }
                    : { hasSpecialCategoryData: false }
                )
              }
              description={t('admin.system.purposes.create.specialCategoryHelp')}
            >
              {t('admin.system.purposes.create.specialCategory')}
            </Switch>
            <RadioGroup<PurposeKind>
              name="kind"
              label={t('admin.system.purposes.create.kind')}
              value={form.kind}
              onChange={kind => set({ kind })}
              disabled={isSaving}
              options={[
                {
                  value: PurposeKind.RESERVATION,
                  label: t('admin.system.purposes.kind.reservation'),
                  description: t('admin.system.purposes.create.reservationHelp'),
                  disabled: form.hasSpecialCategoryData,
                },
                {
                  value: PurposeKind.CONSENT,
                  label: t('admin.system.purposes.kind.consent'),
                  description: t('admin.system.purposes.create.consentHelp'),
                },
              ]}
            />
            {error && (
              <p className="text-red-600 text-sm" role="alert">
                {error}
              </p>
            )}
          </div>
        </Drawer.Body>
        <Drawer.Footer>
          <div className="flex gap-2 justify-end">
            <Button variant="secondary" onClick={requestClose} disabled={isSaving}>
              {t('admin.system.purposes.create.cancel')}
            </Button>
            <Button onClick={handleSave} disabled={isSaving || !canSave}>
              {isSaving
                ? t('admin.system.purposes.create.submitting')
                : t('admin.system.purposes.create.submit')}
            </Button>
          </div>
        </Drawer.Footer>
      </Drawer>
    </>
  );
};
