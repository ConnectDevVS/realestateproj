# Razorpay Payment Integration - Homesy Mobile

**Project:** Homesy Mobile Application  
**Payment Gateway:** Razorpay  
**Platform:** iOS & Android (React Native)  
**Date:** April 17, 2026

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Installation](#installation)
4. [Configuration](#configuration)
5. [Backend Implementation](#backend-implementation)
6. [Mobile Implementation](#mobile-implementation)
7. [Payment Flows](#payment-flows)
8. [Testing](#testing)
9. [Security](#security)
10. [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

### **What We're Building:**

Integrate Razorpay payment gateway to handle:
- Transaction payments (advance, regular, additional)
- Invoice payments
- Subscription payments (future)
- Refunds
- Payment verification
- Payment receipts

### **Payment Flow:**

```
User initiates payment
      ↓
Create order on backend (Razorpay Order API)
      ↓
Open Razorpay checkout in mobile app
      ↓
User completes payment
      ↓
Razorpay processes payment
      ↓
Webhook notification to backend
      ↓
Verify payment signature
      ↓
Update transaction status
      ↓
Show success/failure to user
```

---

## 📦 Prerequisites

### **1. Razorpay Account Setup**

```bash
# 1. Sign up for Razorpay account
# Visit: https://dashboard.razorpay.com/signup

# 2. Complete KYC verification
# Required for live payments

# 3. Get API credentials
# Dashboard → Settings → API Keys
# - Key ID (public, can be in mobile app)
# - Key Secret (private, ONLY on backend)
```

### **2. Required Information**

- [ ] Razorpay Account Email
- [ ] Business/Company Name
- [ ] Business PAN
- [ ] Bank Account Details
- [ ] Key ID (Test & Live)
- [ ] Key Secret (Test & Live)

---

## 🔧 Installation

### **Step 1: Install Razorpay React Native SDK**

```bash
cd ~/Projects/HomesyMobile

# Install Razorpay SDK
npm install react-native-razorpay

# For iOS, install pods
cd ios
pod install
cd ..
```

### **Step 2: Install Additional Dependencies**

```bash
# For payment verification and utilities
npm install crypto-js
```

### **Step 3: Update AndroidManifest.xml (Android)**

**File:** `android/app/src/main/AndroidManifest.xml`

Add these permissions:

```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    
    <!-- Add these permissions -->
    <uses-permission android:name="android.permission.INTERNET"/>
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE"/>
    
    <application
        android:name=".MainApplication"
        android:label="@string/app_name"
        android:icon="@mipmap/ic_launcher"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:allowBackup="false"
        android:theme="@style/AppTheme">
        
        <!-- Add Razorpay activity -->
        <activity
            android:name="com.razorpay.CheckoutActivity"
            android:exported="true">
        </activity>
        
        <!-- Rest of your configuration -->
    </application>
</manifest>
```

### **Step 4: Update Info.plist (iOS)**

**File:** `ios/HomesyMobile/Info.plist`

Add URL scheme:

```xml
<key>CFBundleURLTypes</key>
<array>
    <dict>
        <key>CFBundleURLSchemes</key>
        <array>
            <string>homesymobile</string>
        </array>
    </dict>
</array>
```

### **Step 5: Link Dependencies (if using React Native < 0.60)**

```bash
# For RN >= 0.60, auto-linking works
# For RN < 0.60, run:
react-native link react-native-razorpay
```

---

## ⚙️ Configuration

### **Step 1: Create Environment Variables**

**File:** `.env.development`

```bash
# Razorpay Test Credentials
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxx

# Backend API
API_BASE_URL=http://localhost:3000/api
```

**File:** `.env.production`

```bash
# Razorpay Live Credentials
RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxx

# Backend API
API_BASE_URL=https://api.homesy.com
```

### **Step 2: Update package.json**

Add environment variable support:

```json
{
  "dependencies": {
    "react-native-config": "^1.5.1"
  }
}
```

```bash
npm install react-native-config
cd ios && pod install && cd ..
```

---

## 🖥️ Backend Implementation

### **Step 1: Install Backend Dependencies**

```bash
# In your backend project
cd backend
npm install razorpay crypto
```

### **Step 2: Create Razorpay Service**

**File:** `backend/services/razorpay.service.js`

```javascript
const Razorpay = require('razorpay');
const crypto = require('crypto');
const config = require('../config');

class RazorpayService {
  constructor() {
    this.instance = new Razorpay({
      key_id: config.razorpay.keyId,
      key_secret: config.razorpay.keySecret
    });
  }

  /**
   * Create a Razorpay order
   * @param {number} amount - Amount in rupees (will be converted to paise)
   * @param {string} currency - Currency code (default: INR)
   * @param {object} metadata - Additional order metadata
   */
  async createOrder(amount, currency = 'INR', metadata = {}) {
    try {
      const options = {
        amount: Math.round(amount * 100), // Convert to paise
        currency,
        receipt: `receipt_${Date.now()}`,
        notes: metadata
      };

      const order = await this.instance.orders.create(options);
      return order;
    } catch (error) {
      throw new Error(`Failed to create Razorpay order: ${error.message}`);
    }
  }

  /**
   * Verify payment signature
   * @param {string} orderId - Razorpay order ID
   * @param {string} paymentId - Razorpay payment ID
   * @param {string} signature - Razorpay signature
   */
  verifyPaymentSignature(orderId, paymentId, signature) {
    try {
      const text = `${orderId}|${paymentId}`;
      const generatedSignature = crypto
        .createHmac('sha256', config.razorpay.keySecret)
        .update(text)
        .digest('hex');

      return generatedSignature === signature;
    } catch (error) {
      throw new Error(`Failed to verify signature: ${error.message}`);
    }
  }

  /**
   * Fetch payment details
   * @param {string} paymentId - Razorpay payment ID
   */
  async fetchPayment(paymentId) {
    try {
      const payment = await this.instance.payments.fetch(paymentId);
      return payment;
    } catch (error) {
      throw new Error(`Failed to fetch payment: ${error.message}`);
    }
  }

  /**
   * Capture payment (for authorized payments)
   * @param {string} paymentId - Razorpay payment ID
   * @param {number} amount - Amount to capture in paise
   */
  async capturePayment(paymentId, amount) {
    try {
      const payment = await this.instance.payments.capture(
        paymentId,
        amount,
        'INR'
      );
      return payment;
    } catch (error) {
      throw new Error(`Failed to capture payment: ${error.message}`);
    }
  }

  /**
   * Refund payment
   * @param {string} paymentId - Razorpay payment ID
   * @param {number} amount - Amount to refund (optional, full refund if not provided)
   */
  async refundPayment(paymentId, amount = null) {
    try {
      const options = amount ? { amount: Math.round(amount * 100) } : {};
      const refund = await this.instance.payments.refund(paymentId, options);
      return refund;
    } catch (error) {
      throw new Error(`Failed to refund payment: ${error.message}`);
    }
  }

  /**
   * Fetch all refunds for a payment
   * @param {string} paymentId - Razorpay payment ID
   */
  async fetchRefunds(paymentId) {
    try {
      const refunds = await this.instance.payments.fetchMultipleRefund(paymentId);
      return refunds;
    } catch (error) {
      throw new Error(`Failed to fetch refunds: ${error.message}`);
    }
  }
}

module.exports = new RazorpayService();
```

### **Step 3: Create Payment Routes**

**File:** `backend/routes/payment.routes.js`

```javascript
const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const auth = require('../middleware/auth');

// Create order
router.post('/create-order', auth, paymentController.createOrder);

// Verify payment
router.post('/verify', auth, paymentController.verifyPayment);

// Webhook endpoint (for payment notifications)
router.post('/webhook', paymentController.webhook);

// Refund payment
router.post('/refund', auth, paymentController.refundPayment);

// Get payment details
router.get('/details/:paymentId', auth, paymentController.getPaymentDetails);

module.exports = router;
```

### **Step 4: Create Payment Controller**

**File:** `backend/controllers/payment.controller.js`

```javascript
const razorpayService = require('../services/razorpay.service');
const Transaction = require('../models/transaction.model');

exports.createOrder = async (req, res) => {
  try {
    const { amount, transactionId, metadata } = req.body;

    // Validate amount
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    // Create Razorpay order
    const order = await razorpayService.createOrder(amount, 'INR', {
      transactionId,
      userId: req.user.id,
      tenantId: req.user.tenantId,
      ...metadata
    });

    // Store order in database
    await Transaction.findByIdAndUpdate(transactionId, {
      razorpayOrderId: order.id,
      paymentStatus: 'INPROGRESS'
    });

    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const { 
      orderId, 
      paymentId, 
      signature,
      transactionId 
    } = req.body;

    // Verify signature
    const isValid = razorpayService.verifyPaymentSignature(
      orderId,
      paymentId,
      signature
    );

    if (!isValid) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid payment signature' 
      });
    }

    // Fetch payment details from Razorpay
    const payment = await razorpayService.fetchPayment(paymentId);

    // Update transaction in database
    await Transaction.findByIdAndUpdate(transactionId, {
      razorpayPaymentId: paymentId,
      razorpaySignature: signature,
      paymentStatus: 'SUCCESS',
      paymentMode: 'ONLINE',
      paidAt: new Date(),
      paymentDetails: {
        method: payment.method,
        email: payment.email,
        contact: payment.contact,
        cardId: payment.card_id,
        bank: payment.bank
      }
    });

    res.json({ 
      success: true, 
      message: 'Payment verified successfully',
      paymentId
    });
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

exports.webhook = async (req, res) => {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = req.headers['x-razorpay-signature'];

    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(JSON.stringify(req.body))
      .digest('hex');

    if (signature !== expectedSignature) {
      return res.status(400).json({ error: 'Invalid signature' });
    }

    const event = req.body.event;
    const payload = req.body.payload.payment.entity;

    // Handle different webhook events
    switch (event) {
      case 'payment.captured':
        await handlePaymentCaptured(payload);
        break;
      case 'payment.failed':
        await handlePaymentFailed(payload);
        break;
      case 'refund.created':
        await handleRefundCreated(payload);
        break;
      default:
        console.log('Unhandled webhook event:', event);
    }

    res.json({ status: 'ok' });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.refundPayment = async (req, res) => {
  try {
    const { paymentId, amount, transactionId } = req.body;

    // Create refund
    const refund = await razorpayService.refundPayment(paymentId, amount);

    // Update transaction in database
    await Transaction.findByIdAndUpdate(transactionId, {
      refundId: refund.id,
      refundStatus: 'PENDING',
      refundAmount: amount || refund.amount / 100,
      refundedAt: new Date()
    });

    res.json({ 
      success: true, 
      refund 
    });
  } catch (error) {
    console.error('Refund error:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getPaymentDetails = async (req, res) => {
  try {
    const { paymentId } = req.params;

    const payment = await razorpayService.fetchPayment(paymentId);

    res.json({ payment });
  } catch (error) {
    console.error('Get payment details error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Helper functions
async function handlePaymentCaptured(payload) {
  const transaction = await Transaction.findOne({ 
    razorpayPaymentId: payload.id 
  });
  
  if (transaction) {
    transaction.paymentStatus = 'SUCCESS';
    transaction.paidAt = new Date(payload.created_at * 1000);
    await transaction.save();
  }
}

async function handlePaymentFailed(payload) {
  const transaction = await Transaction.findOne({ 
    razorpayOrderId: payload.order_id 
  });
  
  if (transaction) {
    transaction.paymentStatus = 'FAILED';
    transaction.failureReason = payload.error_description;
    await transaction.save();
  }
}

async function handleRefundCreated(payload) {
  const transaction = await Transaction.findOne({ 
    razorpayPaymentId: payload.payment_id 
  });
  
  if (transaction) {
    transaction.refundStatus = 'PROCESSED';
    transaction.refundedAt = new Date(payload.created_at * 1000);
    await transaction.save();
  }
}
```

---

## 📱 Mobile Implementation

### **Step 1: Create Razorpay Service**

**File:** `src/services/razorpay.service.js`

```javascript
import RazorpayCheckout from 'react-native-razorpay';
import Config from 'react-native-config';

class RazorpayService {
  constructor() {
    this.keyId = Config.RAZORPAY_KEY_ID;
  }

  /**
   * Open Razorpay checkout
   * @param {object} options - Payment options
   */
  async openCheckout(options) {
    try {
      const checkoutOptions = {
        key: this.keyId,
        amount: options.amount, // Amount in paise
        currency: options.currency || 'INR',
        name: 'Homesy',
        description: options.description || 'Payment for transaction',
        image: 'https://your-logo-url.com/logo.png', // Your logo URL
        order_id: options.orderId,
        prefill: {
          name: options.customerName || '',
          email: options.customerEmail || '',
          contact: options.customerPhone || ''
        },
        theme: {
          color: '#FF6B35' // Homesy primary color
        },
        notes: options.notes || {},
        retry: {
          enabled: true,
          max_count: 3
        },
        timeout: 300, // 5 minutes
        modal: {
          ondismiss: () => {
            console.log('Payment modal dismissed');
          }
        }
      };

      const response = await RazorpayCheckout.open(checkoutOptions);
      return {
        success: true,
        paymentId: response.razorpay_payment_id,
        orderId: response.razorpay_order_id,
        signature: response.razorpay_signature
      };
    } catch (error) {
      if (error.code === RazorpayCheckout.PAYMENT_CANCELLED) {
        return {
          success: false,
          cancelled: true,
          error: 'Payment cancelled by user'
        };
      } else if (error.code === RazorpayCheckout.NETWORK_ERROR) {
        return {
          success: false,
          error: 'Network error. Please check your internet connection.'
        };
      } else {
        return {
          success: false,
          error: error.description || 'Payment failed'
        };
      }
    }
  }

  /**
   * Format amount to paise
   * @param {number} amount - Amount in rupees
   */
  formatAmount(amount) {
    return Math.round(amount * 100);
  }

  /**
   * Format amount to rupees
   * @param {number} amount - Amount in paise
   */
  formatAmountToRupees(amount) {
    return amount / 100;
  }
}

export const razorpayService = new RazorpayService();
```

### **Step 2: Create Payment API Endpoints**

**File:** `src/api/endpoints/payment.js`

```javascript
import { apiClient } from '../client';

export const paymentApi = {
  /**
   * Create Razorpay order
   */
  createOrder: async (amount, transactionId, metadata = {}) => {
    const { data } = await apiClient.post('/payment/create-order', {
      amount,
      transactionId,
      metadata
    });
    return data;
  },

  /**
   * Verify payment
   */
  verifyPayment: async (paymentData) => {
    const { data } = await apiClient.post('/payment/verify', paymentData);
    return data;
  },

  /**
   * Refund payment
   */
  refundPayment: async (paymentId, amount, transactionId) => {
    const { data } = await apiClient.post('/payment/refund', {
      paymentId,
      amount,
      transactionId
    });
    return data;
  },

  /**
   * Get payment details
   */
  getPaymentDetails: async (paymentId) => {
    const { data } = await apiClient.get(`/payment/details/${paymentId}`);
    return data;
  }
};
```

### **Step 3: Create Payment Hook**

**File:** `src/hooks/useRazorpay.js`

```javascript
import { useState } from 'react';
import { razorpayService } from '../services/razorpay.service';
import { paymentApi } from '../api/endpoints/payment';
import { useToast } from '@gluestack-ui/themed';

export const useRazorpay = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const toast = useToast();

  const makePayment = async (transaction) => {
    setLoading(true);
    setError(null);

    try {
      // Step 1: Create order on backend
      const order = await paymentApi.createOrder(
        transaction.amount,
        transaction.id,
        {
          projectId: transaction.projectId,
          customerId: transaction.customerId
        }
      );

      // Step 2: Open Razorpay checkout
      const paymentResult = await razorpayService.openCheckout({
        orderId: order.orderId,
        amount: order.amount,
        description: transaction.description || 'Payment for project',
        customerName: transaction.customerName,
        customerEmail: transaction.customerEmail,
        customerPhone: transaction.customerPhone,
        notes: {
          projectId: transaction.projectId,
          transactionId: transaction.id
        }
      });

      // Step 3: Handle payment result
      if (paymentResult.success) {
        // Verify payment on backend
        const verification = await paymentApi.verifyPayment({
          orderId: paymentResult.orderId,
          paymentId: paymentResult.paymentId,
          signature: paymentResult.signature,
          transactionId: transaction.id
        });

        if (verification.success) {
          toast.show({
            title: 'Success',
            description: 'Payment completed successfully!',
            status: 'success'
          });

          setLoading(false);
          return { success: true, paymentId: paymentResult.paymentId };
        } else {
          throw new Error('Payment verification failed');
        }
      } else if (paymentResult.cancelled) {
        toast.show({
          title: 'Cancelled',
          description: 'Payment was cancelled',
          status: 'warning'
        });

        setLoading(false);
        return { success: false, cancelled: true };
      } else {
        throw new Error(paymentResult.error);
      }
    } catch (err) {
      console.error('Payment error:', err);
      setError(err.message);
      
      toast.show({
        title: 'Payment Failed',
        description: err.message || 'Something went wrong',
        status: 'error'
      });

      setLoading(false);
      return { success: false, error: err.message };
    }
  };

  const refundPayment = async (paymentId, amount, transactionId) => {
    setLoading(true);
    setError(null);

    try {
      const result = await paymentApi.refundPayment(
        paymentId,
        amount,
        transactionId
      );

      toast.show({
        title: 'Refund Initiated',
        description: 'Refund will be processed within 5-7 business days',
        status: 'success'
      });

      setLoading(false);
      return { success: true, refund: result.refund };
    } catch (err) {
      console.error('Refund error:', err);
      setError(err.message);
      
      toast.show({
        title: 'Refund Failed',
        description: err.message || 'Failed to process refund',
        status: 'error'
      });

      setLoading(false);
      return { success: false, error: err.message };
    }
  };

  return {
    makePayment,
    refundPayment,
    loading,
    error
  };
};
```

### **Step 4: Update Transaction Screen**

**File:** `src/screens/Projects/TransactionDetailScreen.js`

```javascript
import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Card, Title, Paragraph, Button, Chip } from 'react-native-paper';
import { useRazorpay } from '../../hooks/useRazorpay';

export default function TransactionDetailScreen({ route, navigation }) {
  const { transaction } = route.params;
  const { makePayment, refundPayment, loading } = useRazorpay();

  const handlePayNow = async () => {
    const result = await makePayment(transaction);
    
    if (result.success) {
      // Refresh transaction data
      navigation.goBack();
    }
  };

  const handleRefund = async () => {
    const result = await refundPayment(
      transaction.razorpayPaymentId,
      transaction.amount,
      transaction.id
    );
    
    if (result.success) {
      // Refresh transaction data
      navigation.goBack();
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title>Transaction Details</Title>
          <Paragraph>Amount: ₹{transaction.amount}</Paragraph>
          <Paragraph>Type: {transaction.type}</Paragraph>
          <Paragraph>Status: {transaction.paymentStatus}</Paragraph>
          
          {transaction.paymentStatus === 'PENDING' && (
            <Button
              mode="contained"
              onPress={handlePayNow}
              loading={loading}
              disabled={loading}
              style={styles.button}
            >
              Pay Now
            </Button>
          )}
          
          {transaction.paymentStatus === 'SUCCESS' && (
            <Button
              mode="outlined"
              onPress={handleRefund}
              loading={loading}
              disabled={loading}
              style={styles.button}
            >
              Request Refund
            </Button>
          )}
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5'
  },
  card: {
    margin: 16
  },
  button: {
    marginTop: 16
  }
});
```

### **Step 5: Add Pay Button to Transaction Creation**

**File:** `src/screens/Projects/CreateTransactionScreen.js`

```javascript
import React, { useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { TextInput, Button, Switch, Text } from 'react-native-paper';
import { useRazorpay } from '../../hooks/useRazorpay';
import { projectsApi } from '../../api/endpoints/projects';

export default function CreateTransactionScreen({ route, navigation }) {
  const { projectId } = route.params;
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [payNow, setPayNow] = useState(false);
  const [loading, setLoading] = useState(false);
  const { makePayment } = useRazorpay();

  const handleSubmit = async () => {
    setLoading(true);
    
    try {
      // Create transaction
      const transaction = await projectsApi.createTransaction(projectId, {
        amount: parseFloat(amount),
        description,
        type: 'REGULAR',
        paymentStatus: payNow ? 'PENDING' : 'SUCCESS'
      });

      // If "Pay Now" is enabled, initiate payment
      if (payNow) {
        const paymentResult = await makePayment(transaction);
        
        if (paymentResult.success) {
          navigation.goBack();
        }
      } else {
        navigation.goBack();
      }
    } catch (error) {
      console.error('Create transaction error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <TextInput
          label="Amount (₹)"
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
          mode="outlined"
          style={styles.input}
        />
        
        <TextInput
          label="Description"
          value={description}
          onChangeText={setDescription}
          mode="outlined"
          multiline
          numberOfLines={3}
          style={styles.input}
        />
        
        <View style={styles.switchContainer}>
          <Text>Pay Now via Razorpay</Text>
          <Switch value={payNow} onValueChange={setPayNow} />
        </View>
        
        <Button
          mode="contained"
          onPress={handleSubmit}
          loading={loading}
          disabled={loading || !amount}
          style={styles.button}
        >
          {payNow ? 'Create & Pay Now' : 'Create Transaction'}
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5'
  },
  content: {
    padding: 16
  },
  input: {
    marginBottom: 16
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    padding: 16,
    backgroundColor: '#FFF',
    borderRadius: 8
  },
  button: {
    marginTop: 8
  }
});
```

---

## 🔄 Payment Flows

### **Flow 1: Direct Payment**

```
1. User creates transaction with "Pay Now" enabled
2. Transaction created with status PENDING
3. Razorpay checkout opens
4. User completes payment
5. Payment verified on backend
6. Transaction status updated to SUCCESS
```

### **Flow 2: Pay Later**

```
1. User creates transaction with "Pay Now" disabled
2. Transaction created with status SUCCESS
3. User can pay later from transaction detail
4. Click "Pay Now" button
5. Razorpay checkout opens
6. Continue as Flow 1
```

### **Flow 3: Invoice Payment**

```
1. Generate invoice for transaction
2. Send invoice to customer
3. Customer clicks "Pay Invoice" link
4. Deep link opens app
5. Razorpay checkout opens
6. Payment completion
```

---

## 🧪 Testing

### **Test Mode Configuration**

Use test credentials:
```
Key ID: rzp_test_xxxxxxxxxxxxxxxx
Key Secret: xxxxxxxxxxxxxxxxx
```

### **Test Cards**

```javascript
// Success
Card Number: 4111 1111 1111 1111
CVV: Any 3 digits
Expiry: Any future date

// Failure
Card Number: 4111 1111 1111 1234
CVV: Any 3 digits
Expiry: Any future date

// Network Error
Card Number: 5104 0600 0000 0008
CVV: Any 3 digits
Expiry: Any future date
```

### **Test UPI**

```
UPI ID: success@razorpay
Status: Success

UPI ID: failure@razorpay
Status: Failure
```

### **Test Netbanking**

```
Select any bank
Enter any credentials
Payment will succeed
```

---

## 🔐 Security Best Practices

### **1. Never Store Sensitive Data in Mobile**

```javascript
// ❌ WRONG - Never do this
const KEY_SECRET = 'your_key_secret_here';

// ✅ CORRECT - Only store Key ID (public)
const KEY_ID = Config.RAZORPAY_KEY_ID;
```

### **2. Always Verify on Backend**

```javascript
// Never trust mobile app responses
// Always verify payment signature on backend

// Mobile sends:
// - orderId
// - paymentId
// - signature

// Backend verifies:
const isValid = verifySignature(orderId, paymentId, signature);
```

### **3. Use Webhooks**

```javascript
// Set up webhook URL in Razorpay Dashboard
// Webhook URL: https://api.homesy.com/payment/webhook

// Handle events:
// - payment.captured
// - payment.failed
// - refund.created
```

### **4. Implement Idempotency**

```javascript
// Prevent duplicate payments
// Check if payment already exists for order
const existingPayment = await Transaction.findOne({
  razorpayOrderId: orderId
});

if (existingPayment && existingPayment.paymentStatus === 'SUCCESS') {
  return { error: 'Payment already completed' };
}
```

---

## 🐛 Troubleshooting

### **Issue 1: "Razorpay is not defined"**

**Solution:**
```bash
# Reinstall package
npm uninstall react-native-razorpay
npm install react-native-razorpay

# iOS
cd ios && pod install && cd ..

# Android
cd android && ./gradlew clean && cd ..
```

---

### **Issue 2: Android Build Fails**

**Solution:**

**File:** `android/app/build.gradle`

```gradle
android {
    defaultConfig {
        minSdkVersion 21  // Make sure this is at least 21
    }
}
```

---

### **Issue 3: iOS Checkout Not Opening**

**Solution:**

Ensure URL scheme is added in Info.plist:

```xml
<key>CFBundleURLTypes</key>
<array>
    <dict>
        <key>CFBundleURLSchemes</key>
        <array>
            <string>homesymobile</string>
        </array>
    </dict>
</array>
```

---

### **Issue 4: Payment Verification Fails**

**Solution:**

Check signature generation:

```javascript
// Backend must use exact same logic
const text = `${orderId}|${paymentId}`;
const signature = crypto
  .createHmac('sha256', keySecret)
  .update(text)
  .digest('hex');

// Compare with signature from mobile
return signature === receivedSignature;
```

---

## 📋 Implementation Checklist

### **Backend Setup**
- [ ] Install razorpay package
- [ ] Create Razorpay service
- [ ] Create payment routes
- [ ] Create payment controller
- [ ] Set up webhooks
- [ ] Test with Razorpay dashboard

### **Mobile Setup**
- [ ] Install react-native-razorpay
- [ ] Update AndroidManifest.xml
- [ ] Update Info.plist
- [ ] Create Razorpay service
- [ ] Create payment API endpoints
- [ ] Create useRazorpay hook
- [ ] Update transaction screens

### **Testing**
- [ ] Test successful payment
- [ ] Test failed payment
- [ ] Test cancelled payment
- [ ] Test refund
- [ ] Test webhook events
- [ ] Test with different payment methods

### **Production**
- [ ] Switch to live credentials
- [ ] Complete KYC verification
- [ ] Set up webhook URL
- [ ] Update privacy policy
- [ ] Submit for app review

---

## 🎯 Summary

You now have:
- ✅ Complete Razorpay integration
- ✅ Backend order creation and verification
- ✅ Mobile checkout implementation
- ✅ Payment hooks for easy usage
- ✅ Refund functionality
- ✅ Webhook handling
- ✅ Security best practices
- ✅ Testing guide

**Ready to accept payments in Homesy Mobile! 💰**

---

## 📚 Additional Resources

- Razorpay Docs: https://razorpay.com/docs/
- React Native SDK: https://razorpay.com/docs/payments/payment-gateway/react-native-integration/
- API Reference: https://razorpay.com/docs/api/
- Webhooks: https://razorpay.com/docs/webhooks/

---

**Document Version:** 1.0  
**Last Updated:** April 17, 2026
