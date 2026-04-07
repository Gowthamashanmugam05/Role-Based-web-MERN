const Groq = require('groq-sdk');
const pdfParse = require('pdf-parse');
const { getResumeAnalysis } = require('../utils/rag');

const analyzeResume = async (req, res) => {
    try {
        const { jobRole, age, name, skills, experience, location } = req.body;
        
        console.log("Analyzing resume for:", { name, jobRole, location });

        if (!req.file) {
            return res.status(400).json({ message: 'No resume uploaded' });
        }

        // Parse PDF
        let resumeText = "";
        try {
            const dataBuffer = req.file.buffer;
            const pdfData = await pdfParse(dataBuffer);
            resumeText = pdfData.text;
        } catch (pdfErr) {
            console.error("PDF Parsing Error:", pdfErr);
            return res.status(500).json({ message: 'Could not parse PDF file' });
        }

        const context = await getResumeAnalysis(resumeText, jobRole, process.env.GROQ_API_KEY);

        const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
        
        const prompt = `Act as a Senior Hiring Manager & Career Strategist (20+ years experience).
Analyze this candidate for the role: "${jobRole || 'Professional'}".
Location Context: "${location || 'Chennai, India'}".
Candidate: "${name || 'Candidate'}", Level: "${experience || 'Beginner'}".

Context:
"""
${context}
"""

CRITICAL CONTENT REQUIREMENTS (DO NOT PROVIDE EMPTY ARRAYS):
1. **matchingScore**: High accuracy (0-100).
2. **matchingSkills/missingSkills**: Identify at least 8-10 technical and soft skills.
3. **industrialProjects**: Generate 3-5 high-fidelity project ideas (Problem, Solution, Tech, Impact).
4. **riskAnalysis**: Identify at least 3-5 real-world risks (e.g., market saturation, skill gaps, location constraints).
5. **jobOpportunities**: Generate at least 5-7 realistic, localized job openings including Title, Company, Type, and MATCH REASON.
6. **behavioralInsights**: Detailed analysis of strengths and growth areas.
7. **atsAnalysis**: Detailed keywords and format improvements.

Return a STRICT VALID JSON object:
{
  "matchingScore": 85,
  "scoreBreakdown": { "skillsMatch": 80, "experienceMatch": 70, "projectRelevance": 85, "atsCompatibility": 90 },
  "careerLevel": "Junior | Mid | Senior",
  "marketDemand": { "demandLevel": "High", "competitionLevel": "Moderate", "averageSalary": "Range", "hiringTrend": "Active", "topHiringCompanies": [] },
  "atsAnalysis": { "atsScore": 80, "keywordMatchPercentage": 75, "missingKeywords": ["detailed keyword list"], "formatIssues": [], "improvements": ["Detailed advice"] },
  "recruiterDecision": { "shortlisted": true, "reason": "Detailed professional reasoning", "confidenceLevel": "High" },
  "matchingSkills": [],
  "missingSkills": [],
  "skillPriority": [{ "skill": "Skill Name", "priority": "High", "reason": "Why" }],
  "skillGapSeverity": "Low | Med | High",
  "recommendedLearningPath": [{ "step": "Mastering X", "resources": [], "duration": "Duration", "outcome": "Result" }],
  "industrialProjects": [{ "title": "Project Title", "problemStatement": "", "solutionApproach": "", "techStack": [], "impact": "", "difficulty": "" }],
  "suggestedJobRoles": ["Role 1", "Role 2"],
  "jobReadiness": { "ready": true, "reason": "Reason", "estimatedTimeToReady": "ASAP", "confidence": "High" },
  "interviewPrep": { "technicalQuestions": [], "hrQuestions": [], "codingChallenges": [] },
  "growthRoadmap": { "month1": "", "month2": "", "month3": "" },
  "portfolioTips": { "github": [], "linkedin": [], "resume": [] },
  "resumeRewriteHints": ["Hint 1", "Hint 2"],
  "behavioralInsights": { "strengths": ["Detail 1", "Detail 2"], "improvementAreas": ["Detail 1", "Detail 2"] },
  "riskAnalysis": ["Critical Risk 1", "Critical Risk 2", "Critical Risk 3"],
  "realWorldChallenges": ["Challenge 1", "Challenge 2"],
  "jobOpportunities": [
    { "title": "Job Title", "company": "Company Name", "type": "Full-time", "location": "${location}", "salary": "Range", "source": "Indeed", "link": "#", "description": "Highly relevant description", "matchReason": "Why it matches" }
  ],
  "finalVerdict": { "hireability": "High", "why": "Professional summary", "nextBestAction": "Step" },
  "summary": "Full analysis summary for ${name}"
}

Rules: NO markdown. NO comments. PROVIDE SUBSTANTIAL CONTENT IN EVERY FIELD.`;

        console.log("Calling Groq API for High-Density Analysis...");
        const completion = await groq.chat.completions.create({
            messages: [{ role: 'user', content: prompt }],
            model: 'llama-3.3-70b-versatile', 
            temperature: 0.2,
            response_format: { type: "json_object" }
        });

        const rawContent = completion.choices[0].message.content;

        try {
            const result = JSON.parse(rawContent);
            res.json({
                success: true,
                analysis: result
            });
        } catch (jsonErr) {
            console.error("JSON Parsing Error.");
            res.status(500).json({ message: 'AI Parsing Error' });
        }
    } catch (error) {
        console.error('SERVER ERROR:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

module.exports = { analyzeResume };