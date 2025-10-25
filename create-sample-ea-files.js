#!/usr/bin/env node

/**
 * Create Sample EA Files Script
 * This script creates sample EA files and uploads them to Supabase storage
 * to enable working downloads
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL || 'https://ncikobfahncdgwvkfivz.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY not found');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createSampleEAFiles() {
  console.log('🔧 Creating sample EA files for downloads...');
  
  try {
    // Create sample EA file content
    const sampleEAContent = `// Sample EA File
// This is a sample Expert Advisor file for testing downloads
// Generated on: ${new Date().toISOString()}

// EA Properties
#property copyright "Sample EA"
#property version "1.0"
#property description "Sample EA for testing download functionality"

// Include files
#include <Trade\Trade.mqh>

// Global variables
CTrade trade;

//+------------------------------------------------------------------+
//| Expert initialization function                                   |
//+------------------------------------------------------------------+
int OnInit()
{
    Print("Sample EA initialized successfully!");
    return(INIT_SUCCEEDED);
}

//+------------------------------------------------------------------+
//| Expert deinitialization function                                |
//+------------------------------------------------------------------+
void OnDeinit(const int reason)
{
    Print("Sample EA deinitialized. Reason: ", reason);
}

//+------------------------------------------------------------------+
//| Expert tick function                                             |
//+------------------------------------------------------------------+
void OnTick()
{
    // Sample trading logic
    if(IsNewBar())
    {
        Print("New bar detected - Sample EA is working!");
    }
}

//+------------------------------------------------------------------+
//| Check for new bar                                                |
//+------------------------------------------------------------------+
bool IsNewBar()
{
    static datetime lastBarTime = 0;
    datetime currentBarTime = iTime(_Symbol, PERIOD_CURRENT, 0);
    
    if(currentBarTime != lastBarTime)
    {
        lastBarTime = currentBarTime;
        return true;
    }
    return false;
}`;

    // Create sample settings file content
    const sampleSetContent = `; Sample EA Settings File
; Generated on: ${new Date().toISOString()}

; EA Parameters
MagicNumber=12345
RiskPercent=2.0
MaxSpread=30
StopLoss=50
TakeProfit=100
MaxTrades=5
UseTrailingStop=true
TrailingStop=20
TrailingStep=10

; Time Settings
StartHour=8
EndHour=18
UseTimeFilter=true

; Currency Pairs
AllowedPairs=EURUSD,GBPUSD,USDJPY,AUDUSD

; Risk Management
MaxDailyLoss=100.0
MaxDrawdown=500.0
UseMoneyManagement=true`;

    // Create sample manual content
    const sampleManualContent = `# Sample EA Manual

## Overview
This is a sample Expert Advisor (EA) created for testing download functionality.

## Installation Instructions

1. **Download the EA file** (.ex4 or .mq5)
2. **Download the settings file** (.set)
3. **Copy files to your MetaTrader directory**
   - EA file: MQL4/Experts/ or MQL5/Experts/
   - Settings file: MQL4/Profiles/Templates/ or MQL5/Profiles/Templates/

## Configuration

1. **Open MetaTrader**
2. **Go to Tools → Options → Expert Advisors**
3. **Enable "Allow automated trading"**
4. **Enable "Allow DLL imports"**
5. **Apply the settings file**

## Usage

1. **Attach the EA to a chart**
2. **Configure parameters using the settings file**
3. **Enable the EA**
4. **Monitor performance**

## Parameters

- **Magic Number**: 12345
- **Risk Percent**: 2.0%
- **Max Spread**: 30 points
- **Stop Loss**: 50 points
- **Take Profit**: 100 points

## Support

For support, contact the EA provider.

---
*Generated on: ${new Date().toISOString()}*`;

    // Upload files to Supabase storage
    console.log('📤 Uploading sample files to Supabase storage...');
    
    // Upload EA file
    const eaFileName = `sample-ea-${Date.now()}.mq5`;
    const { data: eaUpload, error: eaError } = await supabase.storage
      .from('ea-files')
      .upload(eaFileName, Buffer.from(sampleEAContent), {
        contentType: 'text/plain',
        cacheControl: '3600'
      });

    if (eaError) {
      console.error('❌ Error uploading EA file:', eaError);
    } else {
      const { data: { publicUrl: eaUrl } } = supabase.storage
        .from('ea-files')
        .getPublicUrl(eaFileName);
      console.log('✅ EA file uploaded:', eaUrl);
    }

    // Upload settings file
    const setFileName = `sample-settings-${Date.now()}.set`;
    const { data: setUpload, error: setError } = await supabase.storage
      .from('ea-files')
      .upload(setFileName, Buffer.from(sampleSetContent), {
        contentType: 'text/plain',
        cacheControl: '3600'
      });

    if (setError) {
      console.error('❌ Error uploading settings file:', setError);
    } else {
      const { data: { publicUrl: setUrl } } = supabase.storage
        .from('ea-files')
        .getPublicUrl(setFileName);
      console.log('✅ Settings file uploaded:', setUrl);
    }

    // Upload manual file
    const manualFileName = `sample-manual-${Date.now()}.pdf`;
    const { data: manualUpload, error: manualError } = await supabase.storage
      .from('ea-files')
      .upload(manualFileName, Buffer.from(sampleManualContent), {
        contentType: 'application/pdf',
        cacheControl: '3600'
      });

    if (manualError) {
      console.error('❌ Error uploading manual file:', manualError);
    } else {
      const { data: { publicUrl: manualUrl } } = supabase.storage
        .from('ea-files')
        .getPublicUrl(manualFileName);
      console.log('✅ Manual file uploaded:', manualUrl);
    }

    // Update database with file URLs
    console.log('\n🔄 Updating database with file URLs...');
    
    const { data: eas } = await supabase
      .from('expert_advisors')
      .select('id, name')
      .order('id');

    if (eas && eas.length > 0) {
      const ea = eas[0]; // Update the first EA
      
      const { error: updateError } = await supabase
        .from('expert_advisors')
        .update({
          ea_file_path: eaUpload ? `https://ncikobfahncdgwvkfivz.supabase.co/storage/v1/object/public/ea-files/${eaFileName}` : null,
          set_file_path: setUpload ? `https://ncikobfahncdgwvkfivz.supabase.co/storage/v1/object/public/ea-files/${setFileName}` : null,
          manual_file_path: manualUpload ? `https://ncikobfahncdgwvkfivz.supabase.co/storage/v1/object/public/ea-files/${manualFileName}` : null
        })
        .eq('id', ea.id);

      if (updateError) {
        console.error('❌ Error updating database:', updateError);
      } else {
        console.log(`✅ Updated EA ${ea.id} (${ea.name}) with file URLs`);
      }
    }

    console.log('\n🎉 Sample files created successfully!');
    console.log('📋 Files available for download:');
    console.log('   - EA File (.mq5)');
    console.log('   - Settings File (.set)');
    console.log('   - Manual (PDF)');

  } catch (error) {
    console.error('❌ Error creating sample files:', error);
  }
}

// Run the script
createSampleEAFiles()
  .then(() => {
    console.log('\n✨ Sample EA files creation completed');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
