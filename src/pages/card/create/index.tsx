import { withHatch } from 'framework';

import * as model from './model';
import * as page from './page';

export const CardCreatePage = withHatch(model.hatch, page.CardCreatePage);
