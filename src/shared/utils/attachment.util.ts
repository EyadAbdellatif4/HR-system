import { Op, Sequelize } from 'sequelize';
import { Attachment } from '../database/entities/attachment.entity';

/**
 * Fetch attachments for an entity (polymorphic relationship)
 * Time Complexity: O(1) - indexed lookup on entity_id and entity_type
 * @param entityId - The ID of the entity (UUID string)
 * @param entityType - The type of entity ('assets' | 'users')
 * @returns Promise<Attachment[]> - Array of active attachments
 */
export async function getEntityAttachments(
  entityId: string,
  entityType: 'assets' | 'users'
): Promise<Attachment[]> {
  return await Attachment.findAll({
    where: {
      entity_id: entityId, // entity_id is VARCHAR, entityId is UUID string - PostgreSQL handles conversion
      entity_type: entityType,
      is_active: true,
      [Op.and]: [
        Sequelize.literal('deleted_at IS NULL'),
      ],
    } as any,
    attributes: ['id', 'path_URL', 'name', 'type', 'extension', 'entity_type', 'created_at'],
    order: [['created_at', 'DESC']],
    paranoid: false, // We're handling deleted_at manually
  });
}

/**
 * Fetch attachments for multiple entities in batch (optimized for findAll operations)
 * Time Complexity: O(1) - single query with IN clause, indexed lookup
 * @param entityIds - Array of entity IDs
 * @param entityType - The type of entity ('assets' | 'users')
 * @returns Promise<Attachment[]> - Array of active attachments for all entities
 */
export async function getBatchEntityAttachments(
  entityIds: string[],
  entityType: 'assets' | 'users'
): Promise<Attachment[]> {
  if (entityIds.length === 0) {
    return [];
  }

  return await Attachment.findAll({
    where: {
      entity_id: { [Op.in]: entityIds },
      entity_type: entityType,
      is_active: true,
      [Op.and]: [
        Sequelize.literal('deleted_at IS NULL'),
      ],
    } as any,
    attributes: ['id', 'path_URL', 'name', 'type', 'extension', 'entity_type', 'created_at', 'entity_id'],
    order: [['created_at', 'DESC']],
    paranoid: false, // We're handling deleted_at manually
  });
}

