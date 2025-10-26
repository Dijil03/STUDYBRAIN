# 💷 GBP Pricing Setup Guide

## 🎯 **Your New GBP Pricing Structure:**

### **📚 Study Pro (Premium Tier)**
- **Monthly**: £7.99/month
- **Yearly**: £79.99/year (2 months free - £6.67/month)
- **Savings**: £15.89/year with annual plan

### **👑 Study Master (Enterprise Tier)**
- **Monthly**: £9.99/month  
- **Yearly**: £99.99/year (2 months free - £8.33/month)
- **Savings**: £19.89/year with annual plan

## 🔧 **Stripe Setup Steps:**

### **1. Create Products in Stripe Dashboard:**

#### **Study Pro Product:**
- **Name**: "Study Pro"
- **Description**: "Advanced features for serious students"
- **Pricing**:
  - Monthly: £7.99/month
  - Yearly: £79.99/year

#### **Study Master Product:**
- **Name**: "Study Master"  
- **Description**: "Complete solution for power users"
- **Pricing**:
  - Monthly: £9.99/month
  - Yearly: £99.99/year

### **2. Get Price IDs:**
After creating products, copy the price IDs from Stripe dashboard:
- `price_study_pro_monthly_gbp`
- `price_study_pro_yearly_gbp`
- `price_study_master_monthly_gbp`
- `price_study_master_yearly_gbp`

### **3. Update Environment Variables:**
Add to your `.env` file:
```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here

# GBP Pricing
STUDY_PRO_MONTHLY_PRICE_ID=price_study_pro_monthly_gbp
STUDY_PRO_YEARLY_PRICE_ID=price_study_pro_yearly_gbp
STUDY_MASTER_MONTHLY_PRICE_ID=price_study_master_monthly_gbp
STUDY_MASTER_YEARLY_PRICE_ID=price_study_master_yearly_gbp
```

## 💰 **Revenue Projections:**

### **Monthly Revenue (100 users):**
- **Study Pro**: 70 users × £7.99 = £559.30
- **Study Master**: 30 users × £9.99 = £299.70
- **Total Monthly**: £859.00

### **Annual Revenue (100 users):**
- **Study Pro**: 70 users × £79.99 = £5,599.30
- **Study Master**: 30 users × £99.99 = £2,999.70
- **Total Annual**: £8,599.00

## 🎯 **Marketing Benefits:**

### **📚 Study Pro - "The Smart Student's Choice"**
- **Value**: "Less than a coffee per week"
- **Target**: University students, professionals
- **Features**: Everything needed to excel in studies

### **👑 Study Master - "The Academic Powerhouse"**
- **Value**: "Invest in your academic success"
- **Target**: Researchers, institutions, power users
- **Features**: Professional-grade study management

## 🚀 **Next Steps:**

### **1. Set Up Stripe:**
1. Create Stripe account
2. Create products with GBP pricing
3. Copy price IDs
4. Add to `.env` file

### **2. Test Payments:**
1. Use Stripe test cards
2. Test monthly and yearly subscriptions
3. Verify webhook handling
4. Test subscription management

### **3. Go Live:**
1. Switch to live Stripe keys
2. Update price IDs to live versions
3. Start accepting real payments
4. Monitor revenue dashboard

## 📊 **Success Metrics:**

### **Key Performance Indicators:**
- **Conversion Rate**: Free to paid users
- **Churn Rate**: Monthly subscription cancellations
- **ARPU**: Average revenue per user
- **LTV**: Customer lifetime value

### **Target Goals:**
- **5% conversion rate** from free to paid
- **<5% monthly churn rate**
- **£15+ ARPU** across all users
- **£200+ LTV** for annual subscribers

Your GBP pricing is now optimized for the UK market! 🇬🇧
