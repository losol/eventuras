'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

import { type ServerActionResult } from '@eventuras/core-nextjs/actions';
import { Logger } from '@eventuras/logger';
import { Button, ButtonGroup } from '@eventuras/ratio-ui/core/Button';
import { Heading } from '@eventuras/ratio-ui/core/Heading';
import { Checkbox, CheckBoxLabel, Form, TextField } from '@eventuras/ratio-ui/forms';
import { MarkdownInput } from '@eventuras/scribo';
import { useToast } from '@eventuras/toast';

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

export type NotificatorProps<T = unknown> = {
  title: string;
  notificationType: NotificationType;
  filterGroups: FilterGroup[];
  transformFormData: (formData: Record<string, unknown>) => T;
  sendNotification: (dto: T) => Promise<ServerActionResult<void>>;
  onClose: () => void;
};

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
  onClose,
}: NotificatorProps<T>) {
  const t = useTranslations();
  const toast = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmitForm = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
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

  return (
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
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? t('common.buttons.sending') : t('common.buttons.send')}
        </Button>
      </ButtonGroup>
    </Form>
  );
}
