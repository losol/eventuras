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
  const [saving, setSaving] = useState<string | null>(null);

  const handleChange = async (code: string, allowed: boolean) => {
    const previous = items;
    // Optimistic: the switch moves at once, and moves back if saving fails.
    setItems(current =>
      current.map(item => (item.purpose?.code === code ? { ...item, mayProcess: allowed } : item))
    );
    setSaving(code);
    try {
      const result = await setPurposeDecision(code, allowed);
      if (!result.success) {
        setItems(previous);
        toast.error(t('user.privacy.saveFailed'));
        return;
      }
      setItems(current => current.map(item => (item.purpose?.code === code ? result.data : item)));
      toast.success(t('user.privacy.saved'));
    } catch {
      // The action itself failed (network, server error): same as a refused save.
      setItems(previous);
      toast.error(t('user.privacy.saveFailed'));
    } finally {
      setSaving(null);
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
            isDisabled={saving === code}
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
