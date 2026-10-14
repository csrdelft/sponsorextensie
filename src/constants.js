export default class Constants {
  static BASE_API = "https://api.sponsorkliks.com/v1.0/";
  static API_CODE = "P4KA7JFA";
  static CLUB_ID = 3605;
  static URLS_KEY = "urls";
  static CLUBID_KEY = "club_id";
  static LASTCHECK_KEY = "lastcheck";
  static ALWAYS_REDIRECT_KEY = "always-redirect";
  static NOTIFICATION_ID = "sponsor-notification-";
  static UPDATE_CHECK_INTERVAL = 600;
  static CUSTOM_TARGETS = {
    "www.bol.com": {
      "name_short": "Bol.com",
      "shop_name": "bol.com",
      "link": "https://partner.bol.com/click/click?p=2&t=url&s=2379&f=TXL&url=https%3A%2F%2Fwww.bol.com%2Fnl%2Fnl%2F&name=sponsor"
    }
  };
}
