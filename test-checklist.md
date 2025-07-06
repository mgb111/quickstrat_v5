# 🧪 LeadGen Machine - Complete Test Checklist

## **Prerequisites**
- ✅ App running on http://localhost:5176/
- ✅ Database migration completed
- ✅ OpenAI API key configured in .env file

---

## **Test 1: Campaign Creation Flow**

### Step 1: Form Submission
1. Go to http://localhost:5176/
2. Fill out the form with test data:
   - **Brand Name**: "Test Company"
   - **Customer Profile**: "Small business owners"
   - **Problem Statement**: "Struggling to get more customers online"
   - **Desired Outcome**: "Increase online sales by 50%"
3. Click "Generate Campaign"
4. **Expected**: Should show loading spinner, then generate concepts

### Step 2: Concept Selection
1. Review the 6 generated concepts
2. Select one concept that looks good
3. Click "Generate Content Outline"
4. **Expected**: Should generate content outline

### Step 3: Outline Review
1. Review the generated outline
2. Click "Generate Final Campaign"
3. **Expected**: Should generate complete campaign with PDF, landing page, and social posts

---

## **Test 2: PDF Download Functionality**

### Step 1: Email Capture
1. On the results page, enter an email: `test@example.com`
2. Click "Submit Email"
3. **Expected**: Should show "Email submitted successfully"

### Step 2: PDF Download
1. PDF download button should appear
2. **Hover over the button** - cursor should change to pointer
3. **Click "Download PDF"**
4. **Expected**: Should download a PDF file to your downloads folder

---

## **Test 3: Campaign Dashboard**

### Step 1: Create Campaign
1. Click "Create Campaign & Go to Dashboard"
2. **Expected**: Should redirect to dashboard without errors

### Step 2: Dashboard Loading
1. Dashboard should load
2. **Expected**: Should see your campaign in the list
3. **Expected**: No "Failed to load campaigns" error

### Step 3: Campaign Details
1. Click on your campaign in the list
2. **Expected**: Should show campaign details, leads, and stats

---

## **Test 4: Landing Page Functionality**

### Step 1: Get Landing Page URL
1. In dashboard, click the copy icon next to your campaign
2. **Expected**: Landing page URL copied to clipboard

### Step 2: Test Landing Page
1. Open the landing page URL in a new tab
2. **Expected**: Should see a professional landing page
3. Enter a test email: `landing-test@example.com`
4. Click "Get Your Free Guide"
5. **Expected**: Should capture lead and show PDF download

---

## **Test 5: Lead Management**

### Step 1: View Leads
1. Go back to dashboard
2. Select your campaign
3. **Expected**: Should see captured leads in the list

### Step 2: Export Leads
1. Click "Export Leads CSV"
2. **Expected**: Should download a CSV file with lead data

---

## **Test 6: Error Handling**

### Test 1: Invalid Form Data
1. Try submitting form with empty fields
2. **Expected**: Should show validation errors

### Test 2: Network Issues
1. Temporarily disconnect internet
2. Try generating campaign
3. **Expected**: Should show appropriate error message

---

## **Expected Results Summary**

✅ **Campaign Creation**: No "Failed to create campaign" errors
✅ **PDF Downloads**: Button works with proper cursor behavior
✅ **Dashboard**: Campaigns load without errors
✅ **Landing Pages**: Public lead capture works
✅ **Lead Management**: CSV export works
✅ **Error Handling**: Graceful error messages

---

## **If You Encounter Issues**

### Common Issues & Solutions:

1. **"Failed to create campaign"**
   - Make sure you ran the SQL migration
   - Check browser console for detailed errors

2. **PDF download not working**
   - Check if popup blockers are enabled
   - Verify @react-pdf/renderer is installed

3. **Dashboard not loading**
   - Check Supabase connection
   - Verify environment variables

4. **OpenAI errors**
   - Check VITE_OPENAI_API_KEY in .env
   - Verify API key is valid and has credits

---

## **Success Criteria**

🎯 **All tests pass** = System is 100% functional
🎯 **PDF downloads work** = Lead magnet delivery ready
🎯 **Dashboard works** = Campaign management ready
🎯 **Landing pages work** = Public lead capture ready

**Report any failures with:**
- Test step number
- Exact error message
- Browser console errors
- Expected vs actual behavior 