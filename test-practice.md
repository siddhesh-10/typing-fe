# Practice Component Test Guide

## Testing the Practice Component

### 1. Frontend Test (Default Texts Fallback)

**Expected Behavior:**
- ✅ Practice component loads with settings interface
- ✅ User can select difficulty, category, and time limit
- ✅ Clicking "Start Practice" loads a text (from default JSON if API fails)
- ✅ Real-time typing with visual feedback
- ✅ WPM, accuracy, and error tracking
- ✅ Session completion and results display

**Test Steps:**
1. Navigate to `/practice` route
2. Select difficulty: "Medium"
3. Select category: "Technology"
4. Click "Start Practice"
5. Type the displayed text
6. Verify real-time statistics update
7. Complete the text and check results

### 2. API Integration Test

**Expected Behavior:**
- ✅ If backend is running: Loads text from API
- ✅ If backend fails: Falls back to default texts
- ✅ Error message displayed when using fallback
- ✅ Practice continues normally with fallback texts

**Test Steps:**
1. Start backend: `cd typing-practice-be && npm run dev`
2. Test API: `curl -X GET "http://localhost:3000/dev/texts/random?difficulty=medium&category=technology"`
3. If API works: Practice component uses API data
4. If API fails: Practice component uses default texts

### 3. Default Texts Verification

**Available Default Texts:**
- **Easy**: 5 texts (general, nature, education, animals)
- **Medium**: 5 texts (technology, literature, science, quotes)
- **Hard**: 5 texts (technology, science, quotes, environment)
- **Expert**: 3 texts (technology, science, philosophy)

**Categories Available:**
- general, technology, literature, news, quotes, code, nature, education, animals, science, environment, philosophy

### 4. Error Handling Test

**Test Scenarios:**
1. **Network Error**: Disconnect internet, verify fallback works
2. **API Error**: Stop backend server, verify fallback works
3. **Invalid Parameters**: Test with invalid difficulty/category
4. **Empty Response**: API returns null/empty, verify fallback

### 5. Performance Test

**Expected Performance:**
- ✅ Component loads in < 2 seconds
- ✅ Typing response time < 100ms
- ✅ Real-time stats update smoothly
- ✅ No memory leaks during typing sessions

### 6. Responsive Design Test

**Test on Different Screen Sizes:**
- ✅ Desktop (1200px+): Full layout
- ✅ Tablet (768px-1199px): Responsive grid
- ✅ Mobile (320px-767px): Stacked layout

### 7. Accessibility Test

**Keyboard Navigation:**
- ✅ Tab navigation works
- ✅ Enter/Space to select options
- ✅ Escape to pause session
- ✅ F1 to restart session

**Screen Reader:**
- ✅ All elements have proper labels
- ✅ Error messages are announced
- ✅ Progress updates are announced

## Quick Test Commands

```bash
# Test backend API
curl -X GET "http://localhost:3000/dev/texts/random?difficulty=medium&category=technology"

# Start backend (if needed)
cd typing-practice-be && npm run dev

# Start frontend
cd typing-practice && npm start

# Test with different parameters
curl -X GET "http://localhost:3000/dev/texts/random?difficulty=easy&category=general"
curl -X GET "http://localhost:3000/dev/texts/random?difficulty=hard&category=science"
```

## Expected Results

### When API Works:
```json
{
  "success": true,
  "data": {
    "id": "text_123",
    "text": "Programming is the art...",
    "words": ["Programming", "is", "the", "art", ...],
    "category": "technology",
    "difficulty": "medium",
    "wordCount": 23,
    "estimatedTime": 2
  },
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

### When API Fails (Frontend Fallback):
- Error message: "Failed to load text from server. Using offline mode with default texts."
- Practice component loads with default text from JSON file
- All functionality works normally

### Default Text Example:
```json
{
  "id": "medium_001",
  "text": "Programming is the art of telling another human being what one wants the computer to do. It requires logical thinking and problem-solving skills.",
  "words": ["Programming", "is", "the", "art", "of", "telling", "another", "human", "being", "what", "one", "wants", "the", "computer", "to", "do", "It", "requires", "logical", "thinking", "and", "problem-solving", "skills"],
  "category": "technology",
  "difficulty": "medium",
  "language": "en",
  "source": "Programming wisdom",
  "wordCount": 23,
  "estimatedTime": 2
}
```

## Troubleshooting

### Common Issues:
1. **Backend won't start**: Check environment variables and TypeScript compilation
2. **API returns 404**: Verify serverless.yml configuration and function paths
3. **Frontend shows loading forever**: Check API endpoint and network connectivity
4. **Default texts not loading**: Verify JSON file path and import

### Debug Steps:
1. Check browser console for errors
2. Check backend logs for API errors
3. Verify environment variables are set
4. Test API endpoints directly with curl
5. Check network tab for failed requests 