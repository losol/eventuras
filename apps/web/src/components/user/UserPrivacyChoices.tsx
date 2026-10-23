'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

import { Heading } from '@eventuras/ratio-ui/core/Heading';
import { Text } from '@eventuras/ratio-ui/core/Text';
import { Switch } from '@eventuras/ratio-ui/forms';
import { useToast } from '@eventuras/ratio-ui/toast';

import { MyPurposeDto } from '@/lib/eventuras-sdk';

import { setPurposeDecision } from './privacyActions';

export type UserPrivacyChoicesProps = {
  purposes: MyPurposeDto[];
};

/**
 * The organization's processing purposes, each as a switch the user flips to allow
 * or refuse it. On means the organization may process for the purpose: an
 * unanswered reservation (such as marketing to existing customers) starts on, an
 * unanswered consent starts off.
 */
const UserPrivacyChoices = ({ purposes }: UserPrivacyChoicesProps) => {
  const t = useTranslations();
  const toast = useToast();
  const [items, setItems] = useState(purposes);
  // Every switch with a save in flight, so a second toggle cannot re-enable the first.
  const [saving, setSaving] = useState<ReadonlySet<string>>(new Set());

  const replace = (code: string, update: (item: MyPurposeDto) => MyPurposeDto) =>
    setItems(current => current.map(item => (item.purpose?.code === code ? update(item) : item)));

  const handleChange = async (code: string, allowed: boolean) => {
    const before = items.find(item => item.purpose?.code === code);
    // Only this switch is rolled back on failure, so a toggle on another switch made
    // while this one was saving is not undone with it.
    const revert = () => {
      if (before) replace(code, () => before);
    };

    // Optimistic: the switch moves at once, and moves back if saving fails.
    replace(code, item => ({ ...item, mayProcess: allowed }));
    setSaving(current => new Set(current).add(code));
    try {
      const result = await setPurposeDecision(code, allowed);
      if (!result.success) {
        revert();
        toast.error(t('user.privacy.saveFailed'));
        return;
      }
      replace(code, () => result.data);
      toast.success(t('user.privacy.saved'));
    } catch {
      // The action itself failed (network, server error): same as a refused save.
      revert();
      toast.error(t('user.privacy.saveFailed'));
    } finally {
      setSaving(current => {
        const next = new Set(current);
        next.delete(code);
        return next;
      });
    }
  };

  return (
    <section data-testid="user-privacy-choices">
      <Heading as="h2">{t('user.privacy.heading')}</Heading>
      <Text marginY="xs">{t('user.privacy.intro')}</Text>
      {items.map(item => {
        const code = item.purpose?.code ?? '';
        return (
          <Switch
            key={code}
            isSelected={item.mayProcess ?? false}
            isDisabled={saving.has(code)}
            onChange={allowed => handleChange(code, allowed)}
            description={item.purpose?.text}
            className="my-3"
            testId={`purpose-switch-${code}`}
          >
            {item.purpose?.name}
          </Switch>
        );
      })}
    </section>
  );
};

export default UserPrivacyChoices;
