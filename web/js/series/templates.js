// All story templates in one place for the generator.
import { LONG_TEMPLATES as LONG } from './stories-long.js';
import { LONG_TEMPLATES_2 as LONG_2 } from './stories-long-2.js';
import { SHORT_TEMPLATES as SHORT } from './stories-short.js';
import { EVERYDAY_TEMPLATES, EVERYDAY_SHORTS } from './stories-everyday.js';
export const LONG_TEMPLATES = [...LONG, ...LONG_2, ...EVERYDAY_TEMPLATES];
export const SHORT_TEMPLATES = [...SHORT, ...EVERYDAY_SHORTS];
export { VLOG_TEMPLATES, VLOG_SHORT_TEMPLATES, VLOG_SEGMENTS } from './stories-vlog.js';
