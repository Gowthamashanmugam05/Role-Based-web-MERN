const Groq = require('groq-sdk');

/**
 * Simplified context retrieval for Mini Project.
 * Splits resume into chunks and returns the first few meaningful chunks.
 * For a single resume analysis, this provides sufficient context for LLM.
 */
const getResumeAnalysis = async (resumeText, jobRole, groqApiKey) => {
    try {
        if (!resumeText) return "";

        // Manual text splitting into ~1000 char chunks
        const chunks = [];
        const words = resumeText.split(/\s+/);
        let currentChunk = [];
        let currentLength = 0;

        for (const word of words) {
            currentChunk.push(word);
            currentLength += word.length + 1;
            if (currentLength > 1000) {
                chunks.push(currentChunk.join(" "));
                currentChunk = [];
                currentLength = 0;
            }
        }
        if (currentChunk.length > 0) chunks.push(currentChunk.join(" "));

        // Simply take the first 3 chunks as context (most resumes are not that long)
        // Or if we wanted true RAG, we'd embed and match, 
        // but for a demo, this is more reliable than broken library imports.
        return chunks.slice(0, 5).join("\n\n---\n\n");
    } catch (error) {
        console.error("Simple RAG Error:", error);
        return resumeText.substring(0, 3000); 
    }
};

module.exports = { getResumeAnalysis };
