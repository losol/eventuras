'use server';

import { revalidatePath } from 'next/cache';

import {
  actionError,
  actionSuccess,
  type ServerActionResult,
} from '@eventuras/core-nextjs/actions';
import { Logger } from '@eventuras/logger';

import { client } from '@/lib/eventuras-client';
import {
  deleteV3EventsByEventIdCollectionsByCollectionId,
  EventCollectionCreateDto,
  EventCollectionDto,
  EventCollectionDtoPageResponseDto,
  getV3Eventcollections,
  postV3Eventcollections,
  putV3EventcollectionsById,
  putV3EventsByEventIdCollectionsByCollectionId,
} from '@/lib/eventuras-sdk';
import { getOrganizationId } from '@/utils/organization';
import slugify from '@/utils/slugify';

const logger = Logger.create({
  namespace: 'web:admin:collections',
  context: { module: 'actions' },
});

export async function getCollections(page: number = 1, pageSize: number = 100) {
  try {
    const organizationId = getOrganizationId();

    const { data, error } = await getV3Eventcollections({
      client,
      headers: {
        'Eventuras-Org-Id': organizationId,
      },
      query: {
        Page: page,
        Count: pageSize,
      },
    });

    if (error) {
      console.error('Failed to fetch collections:', error);
      return {
        ok: false as const,
        error: String(error),
        data: null,
      };
    }

    // The data is already typed as EventCollectionDtoPageResponseDto
    return {
      ok: true as const,
      data: data as EventCollectionDtoPageResponseDto,
      error: null,
    };
  } catch (error) {
    console.error('Error fetching collections:', error);
    return {
      ok: false as const,
      error: error instanceof Error ? error.message : 'Unknown error',
      data: null,
    };
  }
}

/**
 * Create a new collection
 */
export async function createCollection(
  data: EventCollectionCreateDto
): Promise<ServerActionResult<{ collectionId: number }>> {
  logger.info('Creating collection...');

  try {
    const organizationId = getOrganizationId();

    // Generate slug from name
    const slug = slugify(data.name);
    data.slug = slug;

    const response = await postV3Eventcollections({
      headers: {
        'Eventuras-Org-Id': organizationId,
      },
      body: data,
    });

    if (!response.data?.id) {
      logger.error({ error: response.error }, 'Failed to create collection');
      return actionError('Failed to create collection');
    }

    logger.info({ collectionId: response.data.id }, 'Collection created successfully');
    revalidatePath('/admin/collections');

    return actionSuccess({ collectionId: response.data.id });
  } catch (error) {
    logger.error({ error }, 'Error creating collection');
    return actionError('An unexpected error occurred while creating the collection');
  }
}

/**
 * Update an existing collection
 */
export async function updateCollection(
  data: EventCollectionDto
): Promise<ServerActionResult<void>> {
  logger.info({ collectionId: data.id }, 'Updating collection...');

  try {
    if (!data.id) {
      return actionError('Collection ID is required');
    }

    // Generate slug from name and id
    const newSlug = slugify([data.name, data.id].filter(Boolean).join('-'));
    data.slug = newSlug;

    const response = await putV3EventcollectionsById({
      path: { id: data.id },
      body: data,
    });

    if (!response.data) {
      logger.error({ error: response.error }, 'Failed to update collection');
      return actionError('Failed to update collection');
    }

    logger.info({ collectionId: data.id }, 'Collection updated successfully');
    revalidatePath('/admin/collections');
    revalidatePath(`/admin/collections/${data.id}`);
    revalidatePath(`/collections/${data.id}/${data.slug}`);

    return actionSuccess(undefined, 'Collection successfully updated!');
  } catch (error) {
    logger.error({ error }, 'Error updating collection');
    return actionError('An unexpected error occurred while updating the collection');
  }
}

/**
 * Add an event to a collection
 */
export async function addEventToCollection(
  eventId: number,
  collectionId: number
): Promise<ServerActionResult<void>> {
  logger.info({ eventId, collectionId }, 'Adding event to collection...');

  try {
    const response = await putV3EventsByEventIdCollectionsByCollectionId({
      path: {
        eventId,
        collectionId,
      },
    });

    if (response.error) {
      logger.error({ error: response.error }, 'Failed to add event to collection');
      return actionError('Failed to add event to collection');
    }

    logger.info({ eventId, collectionId }, 'Event added to collection successfully');
    revalidatePath(`/admin/collections/${collectionId}`);

    return actionSuccess(undefined, 'Event successfully added to collection!');
  } catch (error) {
    logger.error({ error }, 'Error adding event to collection');
    return actionError('An unexpected error occurred while adding the event');
  }
}

/**
 * Remove an event from a collection
 */
export async function removeEventFromCollection(
  eventId: number,
  collectionId: number
): Promise<ServerActionResult<void>> {
  logger.info({ eventId, collectionId }, 'Removing event from collection...');

  try {
    const response = await deleteV3EventsByEventIdCollectionsByCollectionId({
      path: {
        eventId,
        collectionId,
      },
    });

    if (response.error) {
      logger.error({ error: response.error }, 'Failed to remove event from collection');
      return actionError('Failed to remove event from collection');
    }

    logger.info({ eventId, collectionId }, 'Event removed from collection successfully');
    revalidatePath(`/admin/collections/${collectionId}`);

    return actionSuccess(undefined, 'Event successfully removed from collection!');
  } catch (error) {
    logger.error({ error }, 'Error removing event from collection');
    return actionError('An unexpected error occurred while removing the event');
  }
}
