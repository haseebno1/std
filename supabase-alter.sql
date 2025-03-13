-- Add missing columns to the templates table
ALTER TABLE templates ADD COLUMN IF NOT EXISTS "clientId" uuid;
ALTER TABLE templates ADD COLUMN IF NOT EXISTS "brandId" uuid;
ALTER TABLE templates ADD COLUMN IF NOT EXISTS "frontImage" text;
ALTER TABLE templates ADD COLUMN IF NOT EXISTS "backImage" text;
ALTER TABLE templates ADD COLUMN IF NOT EXISTS "customFields" jsonb;

-- Create a function to keep both versions in sync
CREATE OR REPLACE FUNCTION sync_template_fields()
RETURNS TRIGGER AS $$
BEGIN
  -- Snake case to camel case sync
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    NEW."clientId" := NEW.client_id;
    NEW."brandId" := NEW.brand_id;
    NEW."frontImage" := NEW.front_image;
    NEW."backImage" := NEW.back_image;
    NEW."customFields" := NEW.custom_fields;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to automatically sync the fields
CREATE TRIGGER template_fields_sync
BEFORE INSERT OR UPDATE ON templates
FOR EACH ROW
EXECUTE FUNCTION sync_template_fields();

-- Update existing records to add camelCase variants
UPDATE templates SET
  "clientId" = client_id,
  "brandId" = brand_id,
  "frontImage" = front_image,
  "backImage" = back_image,
  "customFields" = custom_fields;
