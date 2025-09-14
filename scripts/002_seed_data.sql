-- Seed initial data for the compliance checker system

-- Insert default categories with compliance rules
INSERT INTO public.categories (name, description, compliance_rules) VALUES
(
  'Electronics',
  'Electronic devices and accessories',
  '{
    "weight_declaration": {"required": true, "unit": "grams"},
    "dimensions": {"required": true, "format": "LxWxH"},
    "warranty": {"required": true, "minimum_months": 6},
    "energy_rating": {"required": false},
    "safety_certification": {"required": true}
  }'::jsonb
),
(
  'Textiles',
  'Clothing, fabrics, and textile products',
  '{
    "fabric_composition": {"required": true, "percentage_breakdown": true},
    "care_instructions": {"required": true},
    "size_chart": {"required": true},
    "country_of_origin": {"required": true},
    "weight_per_unit": {"required": true}
  }'::jsonb
),
(
  'Food & Beverages',
  'Packaged food items and beverages',
  '{
    "net_weight": {"required": true, "unit": "grams_or_ml"},
    "ingredients_list": {"required": true, "order": "descending_by_weight"},
    "nutritional_info": {"required": true},
    "expiry_date": {"required": true},
    "manufacturing_date": {"required": true},
    "fssai_license": {"required": true}
  }'::jsonb
),
(
  'Cosmetics',
  'Beauty and personal care products',
  '{
    "net_quantity": {"required": true, "unit": "ml_or_grams"},
    "ingredients_list": {"required": true},
    "manufacturing_date": {"required": true},
    "expiry_date": {"required": true},
    "batch_number": {"required": true},
    "manufacturer_details": {"required": true}
  }'::jsonb
);

-- Insert sample e-commerce platforms
INSERT INTO public.platforms (name, domain, scraping_config, is_active) VALUES
(
  'Amazon India',
  'amazon.in',
  '{
    "product_selector": ".s-result-item",
    "name_selector": "h2 a span",
    "price_selector": ".a-price-whole",
    "image_selector": ".s-image",
    "details_page_selector": "h2 a"
  }'::jsonb,
  true
),
(
  'Flipkart',
  'flipkart.com',
  '{
    "product_selector": "._1AtVbE",
    "name_selector": "._4rR01T",
    "price_selector": "._30jeq3",
    "image_selector": "._396cs4",
    "details_page_selector": "._1fQZEK"
  }'::jsonb,
  true
),
(
  'Myntra',
  'myntra.com',
  '{
    "product_selector": ".product-base",
    "name_selector": ".product-brand",
    "price_selector": ".product-discountedPrice",
    "image_selector": ".product-imageSlider img",
    "details_page_selector": ".product-base a"
  }'::jsonb,
  true
);
