#!/bin/bash
API_KEY="AIzaSyYOUR_NEW_KEY_HERE"

for file in js/*.js; do
    [ -f "$file" ] || continue
    echo "Processing and fixing: $file..."
    
    # قراءة الكود وتجهيزه بشكل آمن
    CODE_CONTENT=$(cat "$file" | jq -aR .)
    
    # إرسال الطلب الصافي لجوجل جيميني برو
    RESPONSE=$(curl -s -X POST "https://googleapis.com" \
        -H "Content-Type: application/json" \
        -d "{\"contents\": [{\"parts\": [{\"text\": \"Fix all syntax errors and security vulnerabilities in this javascript code. Return ONLY the pure fixed code without markdown formatting or backticks: \"}, {\"text\": $CODE_CONTENT}]}]}")
    
    # استخراج الكود المصلح وحفظه فوق الملف القديم
    FIXED_CODE=$(echo "$RESPONSE" | jq -r '.candidates[0].content.parts[0].text' 2>/dev/null)
    
    if [ ! -z "$FIXED_CODE" ] && [ "$FIXED_CODE" != "null" ]; then
        echo "$FIXED_CODE" > "$file"
        echo "✅ $file fixed and updated successfully!"
    else
        echo "❌ Error updating $file"
    fi
    sleep 1 # استراحة ثانية لمنع ضغط السيرفر
done
