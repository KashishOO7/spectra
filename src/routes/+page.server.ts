import type { PageServerLoad } from './$types.js';
import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

export const load: PageServerLoad = () => {
  const itemsDir = path.join(process.cwd(), 'content/items');
  const files = fs.readdirSync(itemsDir).filter(f => f.endsWith('.yaml'));

  let latestDate = '';
  for (const file of files) {
    const raw = yaml.load(fs.readFileSync(path.join(itemsDir, file), 'utf8')) as any;
    const d: string = raw?.last_verified ?? '';
    if (d > latestDate) latestDate = d;
  }

  const resourcesPath = path.join(process.cwd(), 'content/resources/tools.yaml');
  const resourcesRaw = yaml.load(fs.readFileSync(resourcesPath, 'utf8')) as any;
  const resourceCount: number = Array.isArray(resourcesRaw) ? resourcesRaw.length : 0;

  const contentUpdated = latestDate
    ? new Date(latestDate).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })
    : '';

  return {
    itemCount: files.length,
    resourceCount,
    contentUpdated,
  };
};