/**
 * The site_settings columns a VISITOR may read. `updated_by` is deliberately absent (database column grants refuse it).
 * Adding a column to site_settings? Add it here AND grant it to anon in the migration. The security test fails if the two drift apart.
 */
export const PUBLIC_SETTINGS_COLUMNS = [
  "id", "company_name", "tagline", "location_label", "site_url", "seo_title", "seo_description", "og_image_path", "indexable",
  "contact_email", "contact_phone", "contact_address", "contact_extra",
  "whatsapp_enabled", "whatsapp_country_code", "whatsapp_number", "whatsapp_message",
  "instagram_enabled", "instagram_url", "logo_primary_path", "logo_secondary_path", "favicon_path",
  "footer_note", "footer_marquee", "footer_show_contact", "frx_label", "frx_url",
  "default_theme", "theme_switcher_enabled", "content_seeded", "updated_at",
].join(",");
