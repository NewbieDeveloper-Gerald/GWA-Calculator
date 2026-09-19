
# 🎓 PDM GWA & CGPA Calculator

A fast, interactive, and modern **General Weighted Average (GWA)** and **Cumulative Grade Point Average (CGPA)** calculator designed specifically for the grading scale and academic standards of **Pambayang Dalubhasaan ng Marilao (PDM)**. 

This tool helps students easily compute their current semester grades, track their overall academic standing across multiple semesters, and instantly check their eligibility for Latin Honors.

## ✨ Key Features

* **Current Semester GWA Calculation:** Easily add your current subjects, units, and grades. The app instantly computes your GWA using the standard formula: `Σ (Grade × Units) ÷ Σ Units`.
* **Cumulative GPA (CGPA) Tracker:** A dedicated section to log past semesters (up to a maximum of 8 semesters for a 4-year course). It calculates your overall CGPA completely independently from your current semester sandbox.
* **Smart Latin Honors Detection:** Automatically determines your academic standing based on official PDM criteria, reacting dynamically to your overall CGPA:
  * 🥇 **Summa Cum Laude:** 1.00 – 1.25 (No grade lower than 1.75)
  * 🥈 **Magna Cum Laude:** 1.26 – 1.50 (No grade lower than 2.00)
  * 🥉 **Cum Laude:** 1.51 – 1.75 (No grade lower than 2.25)
* **Quick Insights & Stats:** Identifies your "Best Grade" and the subject that "Needs Work" so you know exactly where to focus.
* **Inline Editing:** Made a typo? Just click any entered grade, unit, or subject name to edit it directly in the table. 
* **Auto-Save (Local Storage):** All your inputted data is automatically saved locally in your browser. You will never lose your progress if you accidentally refresh or close the tab, but your data remains 100% private.
* **One-Click Reset:** Dedicated "Clear All" buttons allow a new user to instantly wipe the current subjects or past semesters to start fresh.

## 🛠️ Tech Stack

This project is built with lightweight, vanilla web technologies for maximum speed and zero dependencies:
* **HTML5** - Semantic structure
* **CSS3** - Custom styling, flexbox/grid layouts, and smooth animations
* **Vanilla JavaScript** - DOM manipulation, math logic, and local storage integration

## 🚀 Live Demo

The project is deployed and live on Vercel:
👉 **[https://gwa-calculator-gerald23.vercel.app/](https://gwa-calculator-gerald23.vercel.app/)**

## 💡 How to Use

1. **Current Semester:** Use the "Add Subject" form to input your current classes. The top banner will immediately display your calculated GWA.
2. **Overall Standing:** Scroll down to the "Add Past Semester GWA" section. Add your previous semesters (up to 8). 
3. **Check Honors:** As you add your past semesters, the Honor Cards will dynamically light up if you qualify for Summa, Magna, or Cum Laude!
```
