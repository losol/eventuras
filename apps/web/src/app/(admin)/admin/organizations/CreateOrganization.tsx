'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { Logger } from '@eventuras/logger';
import { Button } from '@eventuras/ratio-ui/core/Button';
import { TextField } from '@eventuras/ratio-ui/forms';
import { Drawer } from '@eventuras/ratio-ui/layout/Drawer';
import { useToast } from '@eventuras/ratio-ui/toast';

import { createOrganization } from './actions';

const logger = Logger.create({
  namespace: 'web:admin:organizations',
  context: { component: 'CreateOrganization' },
});

const emptyForm = { name: '', description: '', url: '', email: '', phone: '' };

/** Button + drawer to create a new organization (SystemAdmin only). */
export const CreateOrganization: React.FC = () => {
  const t = useTranslations();
  const router = useRouter();
  const toast = useToast();

  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Force-close: resets and closes regardless of in-flight state (success path).
  const closeDrawer = () => {
    setForm(emptyForm);
    setError(null);
    setIsSaving(false);
    setIsOpen(false);
  };

  // User-initiated close (drawer backdrop / Cancel): blocked while saving so an
  // in-flight request can't redirect or set an error after the user dismissed it.
  const requestClose = () => {
    if (isSaving) return;
    closeDrawer();
  };

  const update =
    (field: keyof typeof emptyForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm(prev => ({ ...prev, [field]: e.target.value }));
      if (error) setError(null);
    };

  const handleSave = async () => {
    if (!form.name.trim()) {
      setError(t('admin.organizations.create.nameRequired'));
      return;
    }
    setIsSaving(true);
    setError(null);
    try {
      const result = await createOrganization(form);
      if (!result.success) {
        setError(result.error.message || t('admin.organizations.create.error'));
        return;
      }
      toast.success(t('admin.organizations.create.success'));
      const id = result.data.organizationId;
      closeDrawer();
      // Land on the new org so the admin can add themselves as a member.
      router.push(`/admin/organizations/${id}`);
      router.refresh();
    } catch (err) {
      logger.error({ error: err, name: form.name }, 'Failed to create organization');
      setError(t('admin.organizations.create.error'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>{t('admin.organizations.create.button')}</Button>

      <Drawer isOpen={isOpen} onClose={requestClose}>
        <Drawer.Header as="h2">{t('admin.organizations.create.title')}</Drawer.Header>
        <Drawer.Body>
          <div className="space-y-4">
            <TextField
              name="name"
              label={t('admin.organizations.create.name')}
              value={form.name}
              onChange={update('name')}
              disabled={isSaving}
              autoFocus
              required
            />
            <TextField
              name="description"
              label={t('admin.organizations.create.description')}
              value={form.description}
              onChange={update('description')}
              disabled={isSaving}
              multiline
              rows={3}
            />
            <TextField
              name="url"
              type="url"
              label={t('admin.organizations.create.url')}
              value={form.url}
              onChange={update('url')}
              disabled={isSaving}
            />
            <TextField
              name="email"
              type="email"
              label={t('admin.organizations.create.email')}
              value={form.email}
              onChange={update('email')}
              disabled={isSaving}
            />
            <TextField
              name="phone"
              type="tel"
              label={t('admin.organizations.create.phone')}
              value={form.phone}
              onChange={update('phone')}
              disabled={isSaving}
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
              {t('admin.organizations.create.cancel')}
            </Button>
            <Button onClick={handleSave} disabled={isSaving || !form.name.trim()}>
              {isSaving
                ? t('admin.organizations.create.submitting')
                : t('admin.organizations.create.submit')}
            </Button>
          </div>
        </Drawer.Footer>
      </Drawer>
    </>
  );
};
