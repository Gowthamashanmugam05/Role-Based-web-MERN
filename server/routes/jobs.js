const express = require('express');
const axios = require('axios');
const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const { query = 'IT jobs', location = 'India', pages = 1 } = req.query;
        const searchQuery = `${query} in ${location}`;

        const response = await axios.get('https://jsearch.p.rapidapi.com/search', {
            params: {
                query: searchQuery,
                num_pages: pages,
                date_posted: 'month',
            },
            headers: {
                'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
                'X-RapidAPI-Host': 'jsearch.p.rapidapi.com',
            },
            timeout: 30000,
        });

        const data = response.data;

        if (!data.data || data.data.length === 0) {
            return res.json([]);
        }

        const jobs = data.data.map((job) => ({
            id: job.job_id,
            title: job.job_title,
            company: job.employer_name,
            logo: job.employer_logo || null,
            location: `${job.job_city || 'India'}, ${job.job_state || 'India'}`,
            country: job.job_country || 'IN',
            type: job.job_employment_type || 'Full-time',
            isRemote: job.job_is_remote || false,
            description: (job.job_description?.slice(0, 200) || '') + '...',
            salary: job.job_min_salary && job.job_max_salary
                ? `₹${(job.job_min_salary / 100000).toFixed(1)}L – ₹${(job.job_max_salary / 100000).toFixed(1)}L`
                : null,
            postedAt: job.job_posted_at_datetime_utc || null,
            applyUrl: job.job_apply_link,
            source: detectSource(job.job_apply_link),
        }));

        res.json(jobs);
    } catch (error) {
        console.error('Jobs fetch error:', error.message);
        res.status(500).json({ error: 'Failed to fetch jobs', details: error.message });
    }
});

/**
 * Detects the job platform from the apply URL
 */
function detectSource(url = '') {
    if (!url) return 'Company';
    const lower = url.toLowerCase();
    if (lower.includes('linkedin.com')) return 'LinkedIn';
    if (lower.includes('naukri.com')) return 'Naukri';
    if (lower.includes('indeed.com')) return 'Indeed';
    if (lower.includes('glassdoor.com')) return 'Glassdoor';
    if (lower.includes('monster.com')) return 'Monster';
    if (lower.includes('shine.com')) return 'Shine';
    if (lower.includes('internshala.com')) return 'Internshala';
    if (lower.includes('unstop.com')) return 'Unstop';
    return 'Company';
}

module.exports = router;
