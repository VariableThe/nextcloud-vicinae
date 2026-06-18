import { Notes } from "./notes/components/Notes";

import { withNextcloudAuth } from "./auth/provider";

export default withNextcloudAuth(Notes);
