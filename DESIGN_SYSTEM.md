# UniqPlace Design System

## 🎨 Color Palette

### Brand Colors (Primary)
- **Brand 50**: `#fefce8` - Very light gold
- **Brand 100**: `#fef9c3` - Light gold
- **Brand 200**: `#fef08a` - Soft gold
- **Brand 300**: `#fde047` - Medium gold
- **Brand 400**: `#facc15` - Bright gold
- **Brand 500**: `#d4a01f` - Primary brand gold ⭐
- **Brand 600**: `#c48a1b` - Darker brand gold ⭐
- **Brand 700**: `#a16207` - Deep gold
- **Brand 800**: `#854d0e` - Very deep gold
- **Brand 900**: `#713f12` - Darkest gold

### Accent Colors (Warm Gold/Amber)
- **Accent 50**: `#fffbeb` - Very light amber
- **Accent 100**: `#fef3c7` - Light amber
- **Accent 200**: `#fde68a` - Soft amber
- **Accent 300**: `#fcd34d` - Medium amber
- **Accent 400**: `#fbbf24` - Bright amber
- **Accent 500**: `#d4a01f` - Primary amber ⭐
- **Accent 600**: `#c48a1b` - Darker amber ⭐
- **Accent 700**: `#a16207` - Deep amber
- **Accent 800**: `#854d0e` - Very deep amber
- **Accent 900**: `#713f12` - Darkest amber

### Primary Colors (Deep Blue - Secondary)
- **Primary 50**: `#eff6ff` - Very light blue
- **Primary 100**: `#dbeafe` - Light blue
- **Primary 200**: `#bfdbfe` - Soft blue
- **Primary 300**: `#93c5fd` - Medium blue
- **Primary 400**: `#60a5fa` - Bright blue
- **Primary 500**: `#3b82f6` - Primary blue
- **Primary 600**: `#2563eb` - Darker blue
- **Primary 700**: `#1d4ed8` - Deep blue
- **Primary 800**: `#1e40af` - Very deep blue
- **Primary 900**: `#1e3a8a` - Darkest blue

### Neutral Colors
- **Neutral 50**: `#f8f9fa` - Very light gray
- **Neutral 100**: `#f1f3f4` - Light gray
- **Neutral 200**: `#e8eaed` - Soft gray
- **Neutral 300**: `#dadce0` - Medium gray
- **Neutral 400**: `#bdc1c6` - Gray
- **Neutral 500**: `#9aa0a6` - Medium dark gray
- **Neutral 600**: `#6b7280` - Dark gray ⭐
- **Neutral 700**: `#5f6368` - Very dark gray
- **Neutral 800**: `#3c4043` - Almost black
- **Neutral 900**: `#1c1c28` - Dark navy ⭐

### Success Colors
- **Success 50**: `#f0fdf4` - Very light green
- **Success 100**: `#dcfce7` - Light green
- **Success 200**: `#bbf7d0` - Soft green
- **Success 300**: `#86efac` - Medium green
- **Success 400**: `#4ade80` - Bright green
- **Success 500**: `#22c55e` - Primary green
- **Success 600**: `#16a34a` - Darker green ⭐
- **Success 700**: `#15803d` - Deep green
- **Success 800**: `#166534` - Very deep green
- **Success 900**: `#14532d` - Darkest green

### Warning Colors
- **Warning 50**: `#fffbeb` - Very light yellow
- **Warning 100**: `#fef3c7` - Light yellow
- **Warning 200**: `#fde68a` - Soft yellow
- **Warning 300**: `#fcd34d` - Medium yellow
- **Warning 400**: `#fbbf24` - Bright yellow
- **Warning 500**: `#f59e0b` - Primary yellow
- **Warning 600**: `#d97706` - Darker yellow
- **Warning 700**: `#b45309` - Deep yellow
- **Warning 800**: `#92400e` - Very deep yellow
- **Warning 900**: `#78350f` - Darkest yellow

### Error Colors
- **Error 50**: `#fef2f2` - Very light red
- **Error 100**: `#fee2e2` - Light red
- **Error 200**: `#fecaca` - Soft red
- **Error 300**: `#fca5a5` - Medium red
- **Error 400**: `#f87171` - Bright red
- **Error 500**: `#ef4444` - Primary red
- **Error 600**: `#dc2626` - Darker red
- **Error 700**: `#b91c1c` - Deep red
- **Error 800**: `#991b1b` - Very deep red
- **Error 900**: `#7f1d1d` - Darkest red

## 📝 Typography

### Font Families
- **Primary**: `'Inter', system-ui, sans-serif` - Body text
- **Display**: `'Poppins', 'Inter', system-ui, sans-serif` - Headings
- **Body**: `'Inter', system-ui, sans-serif` - General text

### Font Hierarchy
- **H1**: `text-4xl font-bold` - Main page titles
- **H2**: `text-2xl font-semibold` - Section headers
- **H3**: `text-lg font-semibold` - Subsection headers
- **H4**: `text-base font-medium` - Card titles
- **Body**: `text-base` - Regular text
- **Small**: `text-sm` - Supporting text
- **Caption**: `text-xs` - Labels, metadata

### Text Colors
- **Text Primary**: `text-neutral-900` - Main text
- **Text Secondary**: `text-neutral-600` - Supporting text
- **Text Muted**: `text-neutral-500` - Disabled/placeholder text
- **Text Brand**: `text-brand-600` - Brand accent text
- **Text Success**: `text-success-600` - Success states

## 🧩 Component System

### Buttons

#### Primary Button
```css
.btn-primary {
  @apply bg-brand-500 hover:bg-brand-600 text-white font-medium py-3 px-6 rounded-xl transition-all duration-200 hover:shadow-medium hover:scale-105 focus:outline-none focus:ring-4 focus:ring-brand-100 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none;
}
```

#### Secondary Button
```css
.btn-secondary {
  @apply bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-medium py-3 px-6 rounded-xl transition-all duration-200 hover:shadow-medium hover:scale-105 focus:outline-none focus:ring-4 focus:ring-neutral-100 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none;
}
```

#### Outline Button
```css
.btn-outline {
  @apply border-2 border-brand-500 text-brand-500 hover:bg-brand-500 hover:text-white font-medium py-3 px-6 rounded-xl transition-all duration-200 hover:shadow-medium hover:scale-105 focus:outline-none focus:ring-4 focus:ring-brand-100 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none;
}
```

#### Ghost Button
```css
.btn-ghost {
  @apply text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 font-medium py-3 px-6 rounded-xl transition-all duration-200 hover:shadow-soft focus:outline-none focus:ring-4 focus:ring-neutral-100 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none;
}
```

### Cards

#### Luxury Card
```css
.luxury-card {
  @apply bg-white rounded-2xl shadow-soft border border-neutral-200/50 backdrop-blur-sm;
}
```

#### Elevated Card
```css
@apply bg-white rounded-2xl shadow-large border-0;
```

#### Outlined Card
```css
@apply bg-white rounded-2xl border-2 border-neutral-200 shadow-soft;
```

#### Glass Card
```css
@apply bg-white/80 backdrop-blur-md rounded-2xl border border-white/20 shadow-medium;
```

### Forms

#### Form Input
```css
.form-input {
  @apply w-full px-4 py-3 border border-neutral-300 rounded-xl focus:border-brand-500 focus:ring-4 focus:ring-brand-100 transition-all duration-200 placeholder-neutral-400;
}
```

#### Form Label
```css
.form-label {
  @apply block text-sm font-medium text-neutral-700 mb-2;
}
```

#### Form Error
```css
.form-error {
  @apply text-error-500 text-sm mt-1;
}
```

### Navigation

#### Nav Link
```css
.nav-link {
  @apply text-neutral-600 hover:text-brand-500 font-medium transition-colors duration-200;
}
```

#### Nav Link Active
```css
.nav-link-active {
  @apply text-brand-500 font-semibold;
}
```

### Badges

#### Badge Base
```css
.badge {
  @apply inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium;
}
```

#### Brand Badge
```css
.badge-brand {
  @apply bg-brand-100 text-brand-600;
}
```

#### Success Badge
```css
.badge-success {
  @apply bg-success-100 text-success-600;
}
```

#### Warning Badge
```css
.badge-warning {
  @apply bg-warning-100 text-warning-600;
}
```

#### Error Badge
```css
.badge-error {
  @apply bg-error-100 text-error-600;
}
```

### Sidebar Components

#### Sidebar Item
```css
.sidebar-item {
  @apply w-full flex items-center gap-x-3 px-4 py-3 text-left rounded-xl transition-all duration-200;
}
```

#### Sidebar Item Active
```css
.sidebar-item-active {
  @apply bg-gradient-to-r from-brand-500 to-brand-600 text-white shadow-medium border-l-4 border-white;
}
```

#### Sidebar Item Inactive
```css
.sidebar-item-inactive {
  @apply text-neutral-700 hover:bg-brand-100/50 hover:shadow-soft;
}
```

#### Sidebar Icon
```css
.sidebar-icon {
  @apply text-lg;
}
```

#### Sidebar Icon Active
```css
.sidebar-icon-active {
  @apply text-white;
}
```

#### Sidebar Icon Inactive
```css
.sidebar-icon-inactive {
  @apply text-brand-500;
}
```

## 🎯 Utility Classes

### Gradients
```css
.gradient-brand {
  @apply bg-gradient-to-br from-brand-500 to-brand-600;
}

.gradient-accent {
  @apply bg-gradient-to-br from-accent-500 to-accent-600;
}

.gradient-neutral {
  @apply bg-gradient-to-br from-neutral-50 to-neutral-100;
}
```

### Text Gradients
```css
.text-gradient {
  @apply bg-gradient-to-r from-brand-500 to-accent-500 bg-clip-text text-transparent;
}
```

### Animations
```css
.animate-fade-in {
  @apply animate-[fadeIn_0.5s_ease-in-out];
}

.animate-slide-up {
  @apply animate-[slideUp_0.5s_ease-out];
}

.animate-scale-in {
  @apply animate-[scaleIn_0.3s_ease-out];
}

.animate-bounce-soft {
  @apply animate-[bounceSoft_0.6s_ease-in-out];
}
```

### Shadows
```css
.shadow-soft {
  @apply shadow-[0_2px_8px_-2px_rgba(0,0,0,0.1)];
}

.shadow-medium {
  @apply shadow-[0_4px_16px_-4px_rgba(0,0,0,0.15)];
}

.shadow-large {
  @apply shadow-[0_8px_32px_-8px_rgba(0,0,0,0.2)];
}

.shadow-luxury {
  @apply shadow-[0_12px_48px_-12px_rgba(0,0,0,0.25)];
}
```

### Glass Effects
```css
.glass {
  @apply bg-white/80 backdrop-blur-md border border-white/20;
}
```

## 📱 Responsive Design

### Breakpoints
- **Mobile**: `< 640px` - `sm:`
- **Tablet**: `640px - 1024px` - `md:` and `lg:`
- **Desktop**: `> 1024px` - `xl:` and `2xl:`

### Container Classes
```css
.container-responsive {
  @apply max-w-7xl mx-auto px-4 sm:px-6 lg:px-8;
}

.section-padding {
  @apply py-8 lg:py-12;
}
```

## 🎨 Product Details Screen Design

### Layout Structure
- **Desktop**: Two-column layout (Left: Images, Right: Product Details)
- **Mobile**: Stacked vertical layout with proper spacing

### Key Elements

#### Price Display
```css
.price-large {
  @apply text-3xl lg:text-4xl font-bold text-success-600;
}
```

#### Status Badge
```css
.status-badge {
  @apply px-3 py-1.5 rounded-full text-sm font-medium bg-success-100 text-success-700 border border-success-200;
}
```

#### Product Attributes Grid
```css
.attribute-item {
  @apply flex items-center gap-3 p-3 bg-neutral-50 rounded-xl;
}

.attribute-icon {
  @apply text-brand-500 text-lg;
}

.attribute-label {
  @apply font-medium text-neutral-900 text-sm;
}

.attribute-value {
  @apply text-neutral-600 text-sm;
}
```

#### Action Buttons
```css
.primary-action {
  @apply w-full text-lg py-4 shadow-medium hover:shadow-large transition-all duration-200;
}

.secondary-action {
  @apply w-full text-base py-3 border-brand-300 text-brand-600 hover:bg-brand-50;
}
```

## 📋 Usage Examples

### Login Page
```tsx
<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-white to-brand-50 p-4">
  <div className="luxury-card backdrop-blur-sm bg-white/95 border-0 shadow-luxury">
    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-brand-500 to-brand-600 rounded-2xl mb-6 shadow-medium">
      <i className="pi pi-user text-2xl text-white"></i>
    </div>
    <h1 className="text-3xl font-bold text-gradient mb-2">Welcome Back</h1>
    <Button label="Sign In" icon="pi pi-sign-in" className="w-full btn-primary text-lg py-4" />
  </div>
</div>
```

### Marketplace Page
```tsx
<div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-amber-50">
  <div className="bg-gradient-to-r from-brand-500 to-brand-600 text-white">
    <h1 className="text-4xl font-bold mb-4">Marketplace</h1>
    <p className="text-xl text-brand-100 mb-8">Explore our curated marketplace</p>
  </div>
  <div className="container-responsive section-padding">
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {/* Product Cards */}
    </div>
  </div>
</div>
```

### Product Cards
```tsx
<div className="group luxury-card hover:shadow-large transition-all duration-300 cursor-pointer overflow-hidden">
  <div className="relative overflow-hidden rounded-t-2xl">
    <img className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105" />
    <div className="absolute top-4 right-4">
      <span className="text-lg font-bold text-brand-600">$299.99</span>
    </div>
  </div>
  <div className="p-6">
    <h3 className="text-xl font-semibold text-neutral-900 mb-2 group-hover:text-brand-600 transition-colors duration-200">
      Product Title
    </h3>
  </div>
</div>
```

### Sidebar
```tsx
<div className="fixed top-0 left-0 h-full bg-gradient-to-b from-amber-50 to-amber-100 shadow-xl z-40">
  <nav className="flex-1 px-4 py-6">
    <ul className="space-y-2">
      <li>
        <button className="sidebar-item sidebar-item-active">
          <i className="sidebar-icon sidebar-icon-active pi pi-home"></i>
          <span className="font-medium text-white">Dashboard</span>
        </button>
      </li>
      <li>
        <button className="sidebar-item sidebar-item-inactive">
          <i className="sidebar-icon sidebar-icon-inactive pi pi-shopping-bag"></i>
          <span className="font-medium text-neutral-700">Marketplace</span>
        </button>
      </li>
    </ul>
  </nav>
</div>
```

### Product Details Screen
```tsx
<div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-amber-50">
  <div className="container-responsive section-padding">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
      {/* Left Column: Images */}
      <div className="order-1 lg:order-1">
        <ImageGallery images={product.images} productTitle={product.title} />
      </div>

      {/* Right Column: Product Details */}
      <div className="order-2 lg:order-2 space-y-6">
        {/* Title and Price */}
        <div className="space-y-4">
          <h1 className="text-3xl lg:text-4xl font-bold text-neutral-900 leading-tight">
            {product.title}
          </h1>
          <div className="flex items-center gap-3">
            <span className="text-3xl lg:text-4xl font-bold text-success-600">
              ${product.price}
            </span>
            <span className="status-badge">PUBLISHED</span>
          </div>
        </div>

        {/* Product Attributes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="attribute-item">
            <i className="attribute-icon pi pi-star"></i>
            <div>
              <h4 className="attribute-label">Condition</h4>
              <span className="badge badge-success">Like New</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4 pt-6">
          <Button variant="primary" size="large" className="primary-action">
            Buy Now - $299.99
          </Button>
          <Button variant="outline" size="medium" className="secondary-action">
            Simulate Bid
          </Button>
        </div>
      </div>
    </div>
  </div>
</div>
```

## ✅ Design Checklist

- [x] All icons are aligned and sized consistently
- [x] Sidebar buttons have equal height and spacing
- [x] Top nav icons are centered
- [x] Product details follow clear visual hierarchy
- [x] Buttons feel modern and responsive
- [x] All spacing is uniform (`padding`, `margin`, `gap`)
- [x] Color contrast meets AA minimum standards
- [x] Typography hierarchy is clear and consistent
- [x] Responsive design works on all screen sizes
- [x] Brand gold color is used consistently
- [x] Glassmorphism effects are subtle and elegant
- [x] Micro-animations enhance user experience
- [x] Loading states are well-designed
- [x] Error states are clear and actionable 