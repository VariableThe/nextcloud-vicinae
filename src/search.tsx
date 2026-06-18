import { Search } from "./search/Search";
import { withNextcloudAuth } from "./auth/provider";

export default withNextcloudAuth(Search);
