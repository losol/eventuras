'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

import { type ServerActionResult } from '@eventuras/core-nextjs/actions';
import { Logger } from '@eventuras/logger';
import { Button, ButtonGroup } from '@eventuras/ratio-ui/core/Button';
import { Heading } from '@eventuras/ratio-ui/core/Heading';
import { Text } from '@eventuras/ratio-ui/core/Text';
import { Checkbox, CheckBoxLabel, Form, TextField } from '@eventuras/ratio-ui/forms';
import { Dialog } from '@eventuras/ratio-ui/layout/Dialog';
import { useToast } from '@eventuras/ratio-ui/toast';
import { MarkdownInput } from '@eventuras/scribo';

import '@eventuras/scribo/style.css';

const logger = Logger.create({ namespace: 'web:components:notificator' });

export enum NotificationType {
  EMAIL = 'EMAIL',
  SMS = 'SMS',
}

export type FilterOption = {
  id: string;
  label: string;
  defaultChecked?: boolean;
};

export type FilterGroup = {
  name: string;
  label: string;
  options: FilterOption[];
};

/** Who a filled-in notification would actually reach, for the confirmation step. */
export type NotificatorConfirmation = {
  /** The audience in words, e.g. the event title and its dates. */
  audience: string;
  recipients: { id: string; name: string; contact: string }[];
};

export type NotificatorProps<T = unknown> = {
  title: string;
  notificationType: NotificationType;
  filterGroups: FilterGroup[];
  transformFormData: (formData: Record<string, unknown>) => T;
  sendNotification: (dto: T) => Promise<ServerActionResult<void>>;
  /**
   * Resolves the real audience for a filled-in form. When given, sending goes
   * through a confirmation step that names the recipients — the send itself is
   * irreversible and no later step can tell a right audience from a wrong one.
   */
  resolveConfirmation?: (dto: T) => Promise<ServerActionResult<NotificatorConfirmation>>;
  onClose: () => void;
};

// An SMS has no subject, so its body stands in for one in the confirmation heading.
const HEADLINE_MAX = 90;
const headline = (value: string) =>
  value.length > HEADLINE_MAX ? `${value.slice(0, HEADLINE_MAX).trimEnd()}…` : value;

/**
 * Generic Notificator Component
 *
 * A reusable component for sending email or SMS notifications with customizable filters.
 */
export default function Notificator<T = unknown>({
  title,
  notificationType,
  filterGroups,
  transformFormData,
  sendNotification,
  resolveConfirmation,
  onClose,
}: Readonly<NotificatorProps<T>>) {
  const t = useTranslations();
  const toast = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  // The form stays mounted behind the dialog, but the dto is captured at submit
  // time so what gets confirmed is exactly what gets sent.
  const [pending, setPending] = useState<{ dto: T; subject: string } | null>(null);
  const [confirmation, setConfirmation] = useState<NotificatorConfirmation | null>(null);

  const send = async (dto: T) => {
    setIsSubmitting(true);
    try {
      logger.info({ notificationType }, 'Sending notification');
      const result = await sendNotification(dto);

      if (!result.success) {
        logger.error({ error: result.error, notificationType }, 'Failed to send notification');
        toast.error(result.error.message || t('admin.eventNotifier.form.error'));
        return;
      }

      toast.success(result.message || t('admin.eventNotifier.form.success'));
      onClose();
    } catch (error) {
      logger.error({ error, notificationType }, 'Failed to send notification');
      toast.error(t('admin.eventNotifier.form.error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSubmitForm = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    // Convert FormData to object with proper structure
    const data: Record<string, unknown> = {
      subject: formData.get('subject') as string,
      body: formData.get('body') as string,
    };

    // Process filter groups - checkboxes
    filterGroups.forEach(group => {
      const groupData: Record<string, boolean> = {};
      group.options.forEach(option => {
        const key = `${group.name}.${option.id}`;
        groupData[option.id] = formData.get(key) === 'on';
      });
      data[group.name] = groupData;
    });

    const dto = transformFormData(data);

    if (!resolveConfirmation) {
      await send(dto);
      return;
    }

    const subject = ((data.subject as string) || (data.body as string) || '').trim();
    setIsSubmitting(true);
    try {
      const result = await resolveConfirmation(dto);
      if (!result.success) {
        logger.error({ error: result.error, notificationType }, 'Failed to resolve audience');
        toast.error(result.error.message || t('admin.eventNotifier.confirm.resolveError'));
        return;
      }
      setPending({ dto, subject });
      setConfirmation(result.data);
    } catch (error) {
      logger.error({ error, notificationType }, 'Failed to resolve audience');
      toast.error(t('admin.eventNotifier.confirm.resolveError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeConfirmation = () => {
    setPending(null);
    setConfirmation(null);
  };

  const recipients = confirmation?.recipients ?? [];

  return (
    <>
      <Form onSubmit={onSubmitForm} className="text-black w-72">
        <div>
          <Heading as="h4">{title}</Heading>
        </div>

        {/* Filter groups */}
        {filterGroups.map(group => (
          <div key={group.name}>
            <p>{group.label}</p>
            {group.options.map(option => (
              <Checkbox
                key={option.id}
                id={`${group.name}-${option.id}`}
                name={`${group.name}.${option.id}`}
                defaultChecked={option.defaultChecked ?? false}
              >
                <CheckBoxLabel>{option.label}</CheckBoxLabel>
              </Checkbox>
            ))}
          </div>
        ))}

        {/* Subject field (email only) */}
        {notificationType === NotificationType.EMAIL && (
          <div>
            <TextField
              name="subject"
              label={t('admin.eventNotifier.form.subject.label')}
              placeholder={t('admin.eventNotifier.form.subject.label')}
            />
          </div>
        )}

        {/* Body field with markdown editor (email) or textarea (SMS) */}
        <div>
          {notificationType === NotificationType.EMAIL ? (
            <div id="bodyEditor">
              <MarkdownInput
                name="body"
                label={t('admin.eventNotifier.form.body.label')}
                placeholder={t('admin.eventNotifier.form.body.label')}
              />
            </div>
          ) : (
            <TextField
              name="body"
              multiline
              label={t('admin.eventNotifier.form.body.label')}
              placeholder={t('admin.eventNotifier.form.body.label')}
              rows={6}
            />
          )}
        </div>

        {/* Actions */}
        <ButtonGroup>
          <Button type="button" variant="outline" onClick={onClose}>
            {t('common.buttons.cancel')}
          </Button>
          <Button type="submit" disabled={isSubmitting} testId="notificator-submit">
            {isSubmitting ? t('common.buttons.sending') : t('common.buttons.send')}
          </Button>
        </ButtonGroup>
      </Form>

      <Dialog
        isOpen={!!confirmation}
        onClose={closeConfirmation}
        role="alertdialog"
        testId="notificator-confirm"
      >
        <Dialog.Header>
          <Dialog.Eyebrow>{t('admin.eventNotifier.confirm.eyebrow')}</Dialog.Eyebrow>
          <Dialog.Heading>
            {pending?.subject
              ? headline(pending.subject)
              : t('admin.eventNotifier.confirm.untitled')}
          </Dialog.Heading>
        </Dialog.Header>
        <Dialog.Content>
          <Text as="p" marginBottom="sm">
            {t('admin.eventNotifier.confirm.audience', {
              count: recipients.length,
              audience: confirmation?.audience ?? '',
            })}
          </Text>
          {recipients.length === 0 ? (
            <Text as="p" color="error" testId="notificator-confirm-empty">
              {t('admin.eventNotifier.confirm.noRecipients')}
            </Text>
          ) : (
            <ul
              className="max-h-64 overflow-y-auto overscroll-contain rounded border border-border-1 p-3 text-sm"
              data-testid="notificator-confirm-recipients"
            >
              {recipients.map(recipient => (
                <li key={recipient.id} className="flex flex-wrap gap-x-2 py-0.5">
                  <span>{recipient.name}</span>
                  <span className="font-mono text-xs text-(--text-muted)">{recipient.contact}</span>
                </li>
              ))}
            </ul>
          )}
        </Dialog.Content>
        <Dialog.Footer>
          <Button variant="outline" onClick={closeConfirmation} disabled={isSubmitting}>
            {t('common.buttons.cancel')}
          </Button>
          <Button
            onClick={async () => {
              if (!pending) return;
              const dto = pending.dto;
              closeConfirmation();
              await send(dto);
            }}
            disabled={isSubmitting || recipients.length === 0}
            testId="notificator-confirm-send"
          >
            {t('admin.eventNotifier.confirm.send', { count: recipients.length })}
          </Button>
        </Dialog.Footer>
      </Dialog>
    </>
  );
}
