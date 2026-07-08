import Dexie, { type Table } from 'dexie'
import type { Dataset, LearningItem, Insight } from '@/types/learning'
import bundledDataset from '@/data/current/items.json'

export class VocabDatabase extends Dexie {
  items!: Table<LearningItem, string>
  insights!: Table<Insight, string>
  meta!: Table<{ key: string; value: string }, string>

  constructor() {
    super('vocab-chunk-trainer')
    this.version(1).stores({
      items: 'id, cefr_level, category, surface',
      insights: 'id, target_id',
      meta: 'key',
    })
  }
}

export const db = new VocabDatabase()

export async function ensureDatasetLoaded(): Promise<Dataset> {
  const count = await db.items.count()
  if (count === 0 && bundledDataset.items?.length) {
    await db.items.bulkPut(bundledDataset.items as LearningItem[])
    if (bundledDataset.insights?.length) {
      await db.insights.bulkPut(bundledDataset.insights as Insight[])
    }
    await db.meta.put({
      key: 'schema_version',
      value: bundledDataset.schema_version ?? '1.0.0',
    })
  }

  const items = await db.items.toArray()
  const insights = await db.insights.toArray()
  const schema = await db.meta.get('schema_version')

  return {
    schema_version: schema?.value ?? bundledDataset.schema_version ?? '1.0.0',
    items,
    insights,
    total_items: items.length,
  }
}

export async function countByCefr(): Promise<Record<string, number>> {
  const items = await db.items.toArray()
  return items.reduce<Record<string, number>>((acc, item) => {
    acc[item.cefr_level] = (acc[item.cefr_level] ?? 0) + 1
    return acc
  }, {})
}
