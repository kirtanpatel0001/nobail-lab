// types/product.ts

export interface Product {
  // ─── Core identifiers ──────────────────────────────────────
  id?:                   number;
  name:                  string;
  category:              string;
  sku:                   string;

  // ─── Pricing & availability ────────────────────────────────
  price:                 string;
  stock:                 number;
  in_stock?:             boolean;   // derived: stock > 0, also stored separately

  // ─── Status ────────────────────────────────────────────────
  status:                "active" | "inactive" | "draft";

  // ─── Clinical / packaging ──────────────────────────────────
  dosage_form?:          string;    // e.g. "Eye Drops", "Tablet", "Topical Cream"
  composition?:          string;    // Active APIs, e.g. "Timolol Maleate 0.5% w/v"
  packaging?:            string;    // e.g. "Bottle", "Blister", "Tube"
  unit_measure?:         string;    // e.g. "5 mL", "30 g", "24 tabs"
  prescription_required?: boolean;  // Rx flag

  // ─── Content / copy ────────────────────────────────────────
  short_description?:    string;    // One-line summary shown on cards
  description?:          string;    // Full pharmacological detail (Pharmacology tab)
  benefits?:             string;    // Clinical Benefits tab
  usage_instructions?:   string;    // Usage & Admin tab

  // ─── Media ─────────────────────────────────────────────────
  image_id?:             string | null;  // Cloudinary public_id for primary image
  gallery_images?:       string[];       // Array of Cloudinary public_ids

  // ─── Timestamps ────────────────────────────────────────────
  created_at?:           string;
  updated_at?:           string;
}