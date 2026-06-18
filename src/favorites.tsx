import { Favorites } from "./favorites/Favorites";

import { withNextcloudAuth } from "./auth/provider";

export default withNextcloudAuth(Favorites);
