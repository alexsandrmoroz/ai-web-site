# Webflow CMS Structure

## Collections

### 1. Vacation Types (`vacation-types`)
ID: `69b98fe706a418735c5d76c2`

Fields:
- name (required)
- slug (required)
- short-description (PlainText)
- description (RichText)
- cover-image (Image)
- icon (Image)

### 2. Countries (`countries`)
ID: `69b990050a2d26ebc2bcb3ef`

Fields:
- name (required)
- slug (required)
- short-description (PlainText)
- description (RichText)
- cover-image (Image)
- flag (Image)
- climate (PlainText)
- vacation-types → **MultiReference** → Vacation Types

### 3. Tour Card Lists (`tour-card-list`)
ID: `65a539ffdc99a0a60b860d32`

Fields:
- name (required)
- slug (required)
- location, nights-of-stay, type-of-food, price, amount-of-tourist (PlainText)
- main-pic (Image)
- country → **Reference** → Countries
- vacation-type → **Reference** → Vacation Types

## Page Logic

| Page | Filters |
|------|---------|
| `/countries/{slug}` | Shows tours where `country = current` + shows linked vacation types |
| `/vacation-types/{slug}` | Shows tours where `vacation-type = current` |

## How to use in Webflow Designer

1. **Country template page** → Add Collection List bound to "Tour card lists", filter by: `Country = Current Country`
2. **Vacation Type template page** → Add Collection List bound to "Tour card lists", filter by: `Vacation Type = Current Vacation Type`
3. **Country page** → Also shows "Vacation Types" via the MultiReference field
