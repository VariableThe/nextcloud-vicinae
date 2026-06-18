import { Boards } from "./deck/components/Boards";

import { withNextcloudAuth } from "./auth/provider";

export default withNextcloudAuth(Boards);
