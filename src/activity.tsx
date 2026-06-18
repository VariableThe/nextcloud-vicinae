import { Activity } from "./activity/index";

import { withNextcloudAuth } from "./auth/provider";

export default withNextcloudAuth(Activity);
