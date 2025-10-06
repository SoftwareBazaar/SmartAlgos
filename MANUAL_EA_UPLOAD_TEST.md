# 📋 Manual EA Upload Test Guide

## ✅ What We Fixed
1. **Price field validation error** - Stripped dollar signs from price values
2. **Server 500 error** - Removed localStorage call from Node.js backend
3. **Database column error** - Mapped `price` field to `price_monthly` and `price_yearly` columns

---

## 🧪 How to Test

### Test 1: Edit EA with Price Field ✅
1. **Navigate to Admin Dashboard**
   - Open browser: `http://localhost:3000/admin`
   - Login with admin credentials

2. **Go to EAs Tab**
   - Click on "EAs" tab in the admin panel
   
3. **Edit an EA**
   - Click "Edit" button on "Gold Scalper Pro v2.0" (or any EA with a price like "$299")
   
4. **Check Price Field**
   - ✅ **EXPECTED**: Price field shows "299" (without dollar sign)
   - ✅ **EXPECTED**: No browser console error
   - ❌ **BEFORE FIX**: Would show error "The specified value '$299' cannot be parsed"

---

### Test 2: Update EA with Image Upload ✅
1. **In the EA Editor Modal**
   - Make sure you're editing an EA (from Test 1)
   
2. **Upload a New Image**
   - Click on "Choose File" under "EA Image"
   - Select any image file (PNG, JPG, GIF, etc.)
   - You should see the image preview update

3. **Save the EA**
   - Click "Update EA" button
   
4. **Check Results**
   - ✅ **EXPECTED**: Success! EA updated
   - ✅ **EXPECTED**: No 500 error
   - ✅ **EXPECTED**: Image appears in the EA list
   - ❌ **BEFORE FIX**: Would get 500 server error

5. **Check Console Logs** (F12 → Console tab)
   ```
   ✅ EXPECTED:
   [EAContext] 🔄 Updating EA: 1
   [EAContext] 📸 Appending image file: [filename]
   [EAContext] ✅ EA updated with data: {...}
   
   ❌ BEFORE FIX:
   [API Error 500] /api/eas/1
   Error: localStorage is not defined
   ```

---

### Test 3: Update EA with EA File Upload ✅
1. **Edit an EA Again**
   - Click "Edit" on any EA
   
2. **Upload an EA File**
   - Click on "Choose File" under "EA File"
   - Select a file with extension: `.ex4`, `.mq4`, `.mq5`, or `.ex5`
   - If you don't have one, create a dummy file with notepad and save as `test.ex4`

3. **Save the EA**
   - Click "Update EA" button
   
4. **Check Results**
   - ✅ **EXPECTED**: Success! EA file uploaded
   - ✅ **EXPECTED**: File path shown in console logs
   - ✅ **EXPECTED**: No errors

---

### Test 4: Update EA with BOTH Image and File ✅
1. **Edit an EA**
   
2. **Upload Both Files**
   - Select an image file
   - Select an EA file
   - Change some text fields (name, description, etc.)
   
3. **Save**
   - Click "Update EA"
   
4. **Check Results**
   - ✅ **EXPECTED**: All changes saved successfully
   - ✅ **EXPECTED**: Both files uploaded
   - ✅ **EXPECTED**: No errors

---

### Test 5: Update EA Without Files ✅
1. **Edit an EA**
   
2. **Change Only Text Fields**
   - Change name: "Gold Scalper Pro v2.0 (Test)"
   - Change description
   - Change price: "349"
   - Don't upload any files
   
3. **Save**
   - Click "Update EA"
   
4. **Check Results**
   - ✅ **EXPECTED**: Text changes saved
   - ✅ **EXPECTED**: No file upload errors
   - ✅ **EXPECTED**: Existing images preserved

---

## 🔍 What to Look For

### ✅ SUCCESS INDICATORS:
- No console errors about "$299" not being parsed
- No 500 server errors
- Image preview updates immediately
- EA list shows updated image
- Server logs show successful uploads
- All form fields work correctly

### ❌ FAILURE INDICATORS (If these happen, the fix didn't work):
- Browser console error: "The specified value '$299' cannot be parsed"
- Server responds with 500 error
- Console shows: "localStorage is not defined"
- Image upload fails
- EA doesn't save changes

---

## 📊 Test Results Checklist

- [ ] Price field displays without dollar sign ✅
- [ ] No HTML validation errors ✅
- [ ] Image upload works ✅
- [ ] EA file upload works ✅
- [ ] Combined upload works ✅
- [ ] Text-only update works ✅
- [ ] No 500 server errors ✅
- [ ] Console logs show success messages ✅

---

## 🐛 If Something Fails

### Check Browser Console (F12)
Look for errors like:
- "The specified value '$299' cannot be parsed"
- "[API Error 500]"
- "Request failed with status code 500"

### Check Server Console
Look for errors like:
- "localStorage is not defined"
- "ReferenceError: localStorage is not defined"
- Any 500 error logs

### Verify the Fixes Were Applied
1. Check `client/src/pages/Admin/AdminDashboard.js` line 1539-1554
   - Should have `cleanPrice()` function
   
2. Check `routes/eas.js` line 719-720
   - Should NOT have `localStorage.getItem()`
   - Should use `mockAuthStore.mockEAs` instead

---

## 💡 Pro Tips

1. **Clear Browser Cache** - If issues persist, clear cache and reload
2. **Check Network Tab** - F12 → Network → See the actual API responses
3. **Test with Different File Types** - Try PNG, JPG, SVG for images
4. **Check File Sizes** - Images should be < 10MB, EA files < 50MB

---

## ✅ Expected Behavior Summary

| Action | Before Fix | After Fix |
|--------|------------|-----------|
| Edit EA with price "$299" | ❌ Validation error | ✅ Shows "299" |
| Upload image | ❌ 500 error | ✅ Success |
| Upload EA file | ❌ 500 error | ✅ Success |
| Upload both | ❌ 500 error | ✅ Success |
| Update text only | ✅ Works | ✅ Works |

---

**All tests should PASS with the fixes applied! 🎉**

