# Bundle & Save - Feature Walkthrough

## 🎯 Feature Overview
Combine multiple QIC insurance products into bundles and save up to **45% total** with stacked discounts!

---

## 📍 Location
**Page:** Rewards → Bundle & Save Section  
**Navigation:** Bottom Nav → Rewards (Gift icon)

---

## 💰 Discount Breakdown

### 1. Bundle Discount (10-25%)
Based on number of products selected:
- 2 products → 10% off
- 3 products → 15% off
- 4 products → 20% off
- 5+ products → 25% off

**Combo Bonuses:**
- Motor + Travel → +2%
- Health + Home → +2%
- All 4 categories → +3%
- **Max:** 25% bundle discount

### 2. Protection Points Discount (0-20%)
Based on your Protection Score:
- **Formula:** 1% per 10 points
- **Examples:**
  - 50 PP = 5% discount
  - 100 PP = 10% discount
  - 200+ PP = 20% discount (maximum)
- **Applied AFTER bundle discount** (stacked savings!)

### 3. Maximum Total Savings
- Bundle: 25%
- PP: 20%
- **Total: 45% off original price!**

---

## 🛒 Available Products

### 🚗 Motor Insurance
- Motor TPL - 500 QAR/year
- Motor Comprehensive - 1,500 QAR/year

### ✈️ Travel Insurance
- Travel Schengen - 300 QAR
- Travel Umrah/Hajj - 250 QAR

### 🏥 Health Insurance
- Health Basic - 2,000 QAR/year

### 🏠 Home Insurance
- Home Contents - 800 QAR/year

---

## 📊 Example Calculation

**Scenario:** User selects Motor Comprehensive + Travel Schengen + Health Basic  
**User's Protection Score:** 150 PP

### Step 1: Calculate Original Price
- Motor Comprehensive: 1,500 QAR
- Travel Schengen: 300 QAR
- Health Basic: 2,000 QAR
- **Original Price:** 3,800 QAR

### Step 2: Apply Bundle Discount
- 3 products = 15% base discount
- No combo bonuses apply
- **Bundle Discount:** 15% = 570 QAR off
- **Price after bundle:** 3,230 QAR

### Step 3: Apply PP Discount
- 150 PP = 15% discount (150 ÷ 10 = 15%)
- 15% of 3,230 = 484.50 QAR off
- **PP Points Used:** 150 points (10 per 1%)
- **Price after PP:** 2,745.50 QAR

### Final Result
- Original: 3,800 QAR
- Final: 2,745.50 QAR
- **Total Savings: 1,054.50 QAR (27.75%)**
- **PP Deducted: 150 points**

---

## 🎮 How to Use

### Option 1: Get Quote (Free, No PP Deduction)
1. Check boxes next to desired insurance products
2. See real-time quote in right sidebar
3. Click **"Download Quote (CSV)"**
4. CSV downloads with full pricing breakdown
5. No bundle saved, no PP deducted

**Use Case:** Compare options, share with family, budget planning

### Option 2: Save Bundle (Deducts PP)
1. Check boxes next to desired insurance products
2. See real-time quote in right sidebar
3. Enter a bundle name (e.g., "Family Protection 2025")
4. Click **"Save Bundle"**
5. Confirm PP deduction in dialog
6. Bundle saved to your account
7. PP deducted from your score

**Use Case:** Lock in your insurance plan, track your coverage

---

## 🔔 Important Notes

### Protection Points
- **PP only deducted when you SAVE the bundle**
- Getting a quote or downloading CSV does NOT deduct PP
- Deduction is permanent (no refunds after save)
- You need **10 PP per 1% discount** (max 200 PP)

### Confirmation Dialog
Before saving, you'll see:
```
This will deduct 150 Protection Points from your account.

Current PP: 300
After Save: 150

Continue?
```

### Insufficient PP Error
If you don't have enough PP:
```
Insufficient Protection Points.
You need 200 points but only have 150.
```

### Saved Bundles
- View all saved bundles below the calculator
- See pricing breakdown, products, and PP used
- Bundles remain in "active" status until purchased
- Track your insurance coverage history

---

## 📋 CSV Export Format

When you download a quote, the CSV includes:

```csv
Bundle & Save Quote - LifeQuest by QIC

Selected Products
Product Name,Category,Price (QAR)
Motor Comprehensive,motor,1500.00
Travel Schengen,travel,300.00
Health Basic,health,2000.00

Pricing Breakdown
Description,Amount (QAR)
Original Price,3800.00
Bundle Discount,-570.00 (15%)
Price After Bundle Discount,3230.00
Protection Points Discount,-484.50 (15%)
Protection Points Used,150
Final Price,2745.50

Your Protection Score,300

Generated on 11/4/2025, 3:30:00 PM
```

---

## 🎨 Visual Features

### Color Coding
- **Motor:** Blue theme 🚗
- **Travel:** Green theme ✈️
- **Health:** Red theme 🏥
- **Home:** Purple theme 🏠

### Quote Sidebar
- Real-time calculation
- Product count
- Original price (strikethrough)
- Bundle discount (green)
- PP discount (purple)
- Final price (large, bold, purple)
- Savings percentage
- PP points to be used (warning alert)

### Product Selection
- Grouped by category
- Checkboxes with product cards
- Selected products highlighted in purple
- Category icons and badges
- Product descriptions

### Saved Bundles Display
- Gradient purple-blue background
- Bundle name and date
- Status badge (active/purchased/cancelled)
- Product chips with category icons
- Collapsible pricing breakdown
- PP used indicator

---

## 🚀 Pro Tips

1. **Maximize Savings:**
   - Select products from all 4 categories for +3% bonus
   - Combine Motor + Travel for +2%
   - Combine Health + Home for +2%
   - Earn more PP to unlock higher discounts

2. **Strategic Timing:**
   - Build up PP before creating bundles
   - Download quotes first to compare options
   - Save bundles when you have optimal PP score

3. **Bundle Naming:**
   - Use descriptive names: "Family Annual 2025"
   - Track renewal dates: "Travel Bundle - Summer"
   - Organize by purpose: "Business Coverage"

4. **PP Management:**
   - Check current PP in sidebar before saving
   - Each 10 PP = 1% discount
   - Max discount at 200 PP (20% off)
   - Complete challenges/missions to earn more PP

---

## ❓ FAQ

**Q: Can I edit a saved bundle?**  
A: Not in MVP. Future update will allow bundle editing.

**Q: Will my PP be refunded if I delete a bundle?**  
A: Not in MVP. Treat bundle saves as final decisions.

**Q: Can I purchase insurance through LifeQuest?**  
A: Currently, bundles are for tracking and quotes. Future integration with QIC payment system planned.

**Q: How often can I create bundles?**  
A: Unlimited! Create as many bundles as you want (if you have PP).

**Q: Do bundle discounts expire?**  
A: No expiration in MVP. Your saved bundles remain accessible.

**Q: Can I share my bundle with others?**  
A: Not in MVP. Future feature for bundle sharing via link/email.

---

## 📞 Support

For questions or issues:
- Check your Protection Score in the sidebar
- Ensure you have sufficient PP before saving
- Contact QIC support for actual insurance purchases
- Report bugs via the app feedback system

---

**Happy Bundling! Save smarter with LifeQuest by QIC** 🎁
