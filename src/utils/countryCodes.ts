export interface CountryCodeConfig {
  code: string;
  short: string;
  country: string;
  placeholder: string;
  maxLength: number;
}

export const COUNTRY_CODES: CountryCodeConfig[] = [
  { code: "+93", short: "AF", country: "Afghanistan", placeholder: "70XXXXXXX", maxLength: 9 },
  { code: "+355", short: "AL", country: "Albania", placeholder: "6XXXXXXXX", maxLength: 9 },
  { code: "+213", short: "DZ", country: "Algeria", placeholder: "5XXXXXXXX", maxLength: 9 },
  { code: "+54", short: "AR", country: "Argentina", placeholder: "911XXXXXXX", maxLength: 10 },
  { code: "+61", short: "AU", country: "Australia", placeholder: "04XX-XXX-XXX", maxLength: 10 },
  { code: "+43", short: "AT", country: "Austria", placeholder: "6XXXXXXXX", maxLength: 10 },
  { code: "+973", short: "BH", country: "Bahrain", placeholder: "3XXXXXXX", maxLength: 8 },
  { code: "+880", short: "BD", country: "Bangladesh", placeholder: "01XXX-XXXXXX", maxLength: 11 },
  { code: "+32", short: "BE", country: "Belgium", placeholder: "4XXXXXXXX", maxLength: 9 },
  { code: "+975", short: "BT", country: "Bhutan", placeholder: "17XXXXXX", maxLength: 8 },
  { code: "+55", short: "BR", country: "Brazil", placeholder: "119XXXXXXXX", maxLength: 11 },
  { code: "+1", short: "CA", country: "Canada", placeholder: "XXX-XXX-XXXX", maxLength: 10 },
  { code: "+86", short: "CN", country: "China", placeholder: "13XXXXXXXXX", maxLength: 11 },
  { code: "+357", short: "CY", country: "Cyprus", placeholder: "99XXXXXX", maxLength: 8 },
  { code: "+45", short: "DK", country: "Denmark", placeholder: "2XXXXXXX", maxLength: 8 },
  { code: "+20", short: "EG", country: "Egypt", placeholder: "10XXXXXXXX", maxLength: 10 },
  { code: "+358", short: "FI", country: "Finland", placeholder: "4XXXXXXXX", maxLength: 9 },
  { code: "+33", short: "FR", country: "France", placeholder: "6XXXXXXXX", maxLength: 9 },
  { code: "+49", short: "DE", country: "Germany", placeholder: "01XX-XXXXXXX", maxLength: 12 },
  { code: "+233", short: "GH", country: "Ghana", placeholder: "24XXXXXXX", maxLength: 9 },
  { code: "+30", short: "GR", country: "Greece", placeholder: "69XXXXXXXX", maxLength: 10 },
  { code: "+852", short: "HK", country: "Hong Kong", placeholder: "9XXXXXXX", maxLength: 8 },
  { code: "+91", short: "IN", country: "India", placeholder: "XXXXX-XXXXX", maxLength: 10 },
  { code: "+62", short: "ID", country: "Indonesia", placeholder: "812XXXXXXXX", maxLength: 11 },
  { code: "+353", short: "IE", country: "Ireland", placeholder: "8XXXXXXXX", maxLength: 9 },
  { code: "+39", short: "IT", country: "Italy", placeholder: "3XXXXXXXXX", maxLength: 10 },
  { code: "+81", short: "JP", country: "Japan", placeholder: "90XXXXXXXX", maxLength: 10 },
  { code: "+962", short: "JO", country: "Jordan", placeholder: "79XXXXXXX", maxLength: 9 },
  { code: "+254", short: "KE", country: "Kenya", placeholder: "7XXXXXXXX", maxLength: 9 },
  { code: "+965", short: "KW", country: "Kuwait", placeholder: "9XXXXXXX", maxLength: 8 },
  { code: "+60", short: "MY", country: "Malaysia", placeholder: "01X-XXXXXXX", maxLength: 11 },
  { code: "+960", short: "MV", country: "Maldives", placeholder: "7XXXXXX", maxLength: 7 },
  { code: "+977", short: "NP", country: "Nepal", placeholder: "98XXXXXXXX", maxLength: 10 },
  { code: "+31", short: "NL", country: "Netherlands", placeholder: "6XXXXXXXX", maxLength: 9 },
  { code: "+64", short: "NZ", country: "New Zealand", placeholder: "21XXXXXXX", maxLength: 9 },
  { code: "+234", short: "NG", country: "Nigeria", placeholder: "80XXXXXXXX", maxLength: 10 },
  { code: "+47", short: "NO", country: "Norway", placeholder: "4XXXXXXX", maxLength: 8 },
  { code: "+968", short: "OM", country: "Oman", placeholder: "9XXXXXXX", maxLength: 8 },
  { code: "+92", short: "PK", country: "Pakistan", placeholder: "30XXXXXXXX", maxLength: 10 },
  { code: "+63", short: "PH", country: "Philippines", placeholder: "9XXXXXXXXX", maxLength: 10 },
  { code: "+48", short: "PL", country: "Poland", placeholder: "5XXXXXXXX", maxLength: 9 },
  { code: "+351", short: "PT", country: "Portugal", placeholder: "9XXXXXXXX", maxLength: 9 },
  { code: "+974", short: "QA", country: "Qatar", placeholder: "3XXXXXXX", maxLength: 8 },
  { code: "+966", short: "SA", country: "Saudi Arabia", placeholder: "05X-XXXXXXX", maxLength: 10 },
  { code: "+65", short: "SG", country: "Singapore", placeholder: "9XXXXXXX", maxLength: 8 },
  { code: "+27", short: "ZA", country: "South Africa", placeholder: "82XXXXXXX", maxLength: 9 },
  { code: "+82", short: "KR", country: "South Korea", placeholder: "10XXXXXXXX", maxLength: 10 },
  { code: "+34", short: "ES", country: "Spain", placeholder: "6XXXXXXXX", maxLength: 9 },
  { code: "+94", short: "LK", country: "Sri Lanka", placeholder: "77XXXXXXX", maxLength: 9 },
  { code: "+46", short: "SE", country: "Sweden", placeholder: "70XXXXXXX", maxLength: 9 },
  { code: "+41", short: "CH", country: "Switzerland", placeholder: "79XXXXXXX", maxLength: 9 },
  { code: "+90", short: "TR", country: "Turkey", placeholder: "5XXXXXXXXX", maxLength: 10 },
  { code: "+971", short: "AE", country: "UAE", placeholder: "05X-XXXXXXX", maxLength: 10 },
  { code: "+44", short: "UK", country: "United Kingdom", placeholder: "07XXX-XXXXXX", maxLength: 11 },
  { code: "+1", short: "US", country: "United States", placeholder: "XXX-XXX-XXXX", maxLength: 10 },
  { code: "+84", short: "VN", country: "Vietnam", placeholder: "9XXXXXXXX", maxLength: 9 },
];

export function detectUserCountry(): { code: string; short: string } {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
    if (tz.includes("Dhaka")) return { code: "+880", short: "BD" };
    if (tz.includes("London")) return { code: "+44", short: "UK" };
    if (tz.includes("New_York") || tz.includes("Chicago") || tz.includes("Los_Angeles")) return { code: "+1", short: "US" };
    if (tz.includes("Toronto") || tz.includes("Vancouver")) return { code: "+1", short: "CA" };
    if (tz.includes("Kolkata") || tz.includes("Calcutta")) return { code: "+91", short: "IN" };
    if (tz.includes("Kathmandu")) return { code: "+977", short: "NP" };
    if (tz.includes("Karachi")) return { code: "+92", short: "PK" };
    if (tz.includes("Dubai")) return { code: "+971", short: "AE" };
    if (tz.includes("Riyadh")) return { code: "+966", short: "SA" };
    if (tz.includes("Nicosia") || tz.includes("Famagusta")) return { code: "+357", short: "CY" };
    if (tz.includes("Sydney") || tz.includes("Melbourne") || tz.includes("Brisbane")) return { code: "+61", short: "AU" };
    if (tz.includes("Berlin") || tz.includes("Frankfurt")) return { code: "+49", short: "DE" };
    if (tz.includes("Kuala_Lumpur")) return { code: "+60", short: "MY" };
    if (tz.includes("Singapore")) return { code: "+65", short: "SG" };
    if (tz.includes("Tokyo")) return { code: "+81", short: "JP" };
    if (tz.includes("Seoul")) return { code: "+82", short: "KR" };
    if (tz.includes("Paris")) return { code: "+33", short: "FR" };
    if (tz.includes("Rome")) return { code: "+39", short: "IT" };
  } catch {
    // fallback
  }
  return { code: "+880", short: "BD" };
}
