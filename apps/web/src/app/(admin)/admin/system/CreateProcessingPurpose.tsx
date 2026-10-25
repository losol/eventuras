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
  const t = useTranslations('admin.system.purposes');
  const router = useRouter();
  const toast = useToast();

  // Closed, open, or open with a save in flight; the drawer cannot close while saving.
  const [status, setStatus] = useState<'closed' | 'open' | 'saving'>('closed');
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const isSaving = status === 'saving';

  const reset = () => {
    setForm(emptyForm);
    setError(null);
    setStatus('closed');
  };

  const set = (patch: Partial<Form>) => {
    setForm(prev => ({ ...prev, ...patch }));
    setError(null);
  };

  const codeIsValid = CODE_PATTERN.test(form.code.trim());
  const canSave = codeIsValid && form.name.trim() !== '' && form.text.trim() !== '';

  const handleSave = async () => {
    if (!canSave) return;
    setStatus('saving');
    setError(null);
    try {
      const result = await createProcessingPurpose(form);
      if (result.success) {
        toast.success(t('create.success'));
        reset();
        router.refresh();
        return;
      }
      setError(result.error.message || t('create.error'));
    } catch (err) {
      logger.error({ error: err, code: form.code }, 'Failed to create processing purpose');
      setError(t('create.error'));
    }
    setStatus('open');
  };

  return (
    <>
      <Button onClick={() => setStatus('open')}>{t('create.button')}</Button>

      <Drawer isOpen={status !== 'closed'} onClose={() => !isSaving && reset()}>
        <Drawer.Header as="h2">{t('create.title')}</Drawer.Header>
        <Drawer.Body>
          <div className="space-y-4">
            <TextField
              name="code"
              label={t('create.code')}
              placeholder="marketing.newsletter"
              value={form.code}
              onChange={e => set({ code: e.target.value })}
              disabled={isSaving}
              autoFocus
              required
            />
            {form.code.trim() !== '' && !codeIsValid && (
              <p className="text-sm" role="alert">
                {t('create.codeInvalid')}
              </p>
            )}
            <TextField
              name="name"
              label={t('create.name')}
              value={form.name}
              onChange={e => set({ name: e.target.value })}
              disabled={isSaving}
              required
            />
            <TextField
              name="text"
              label={t('create.text')}
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
              description={t('create.specialCategoryHelp')}
            >
              {t('create.specialCategory')}
            </Switch>
            <RadioGroup<PurposeKind>
              name="kind"
              label={t('create.kind')}
              value={form.kind}
              onChange={kind => set({ kind })}
              disabled={isSaving}
              options={[
                {
                  value: PurposeKind.RESERVATION,
                  label: t('kind.reservation'),
                  description: t('create.reservationHelp'),
                  disabled: form.hasSpecialCategoryData,
                },
                {
                  value: PurposeKind.CONSENT,
                  label: t('kind.consent'),
                  description: t('create.consentHelp'),
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
            <Button variant="secondary" onClick={reset} disabled={isSaving}>
              {t('create.cancel')}
            </Button>
            <Button onClick={handleSave} disabled={isSaving || !canSave}>
              {isSaving ? t('create.submitting') : t('create.submit')}
            </Button>
          </div>
        </Drawer.Footer>
      </Drawer>
    </>
  );
};
