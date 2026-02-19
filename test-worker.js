const URL_TO_TEST = 'https://www.globenewswire.com/news-release/2026/02/19/3241549/32716/en/Gemini-Space-Station-GEMI-Shares-Slide-Amid-Surprise-International-Pullback-and-Executive-Departures-Both-Within-Months-of-IPO-Hagens-Berman.html';
const WORKER_URL = 'https://distill-worker.send2cloud.workers.dev';

async function runTest() {
    console.log(`🚀 Starting End-to-End Test for Cloudflare Worker`);
    console.log(`📍 Hitting Worker: ${WORKER_URL}`);
    console.log(`🔗 Testing URL: ${URL_TO_TEST}\n`);

    try {
        const response = await fetch(WORKER_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
                'Origin': 'https://distill.app'
            },
            body: JSON.stringify({
                url: URL_TO_TEST,
                style: 'bullets',
                bulletCount: 5,
                model: 'google/gemini-2.5-flash'
            })
        });

        if (!response.ok) {
            console.error(`❌ Worker request failed with status: ${response.status}`);
            const text = await response.text();
            console.error(`Error details: ${text}`);
            return;
        }

        const data = await response.json();

        if (data.error) {
            console.error(`❌ Worker returned an expected error: ${data.errorCode} - ${data.error}`);
            return;
        }

        console.log(`✅ Success! Worker retrieved and processed the content.`);
        console.log(`\n📄 --- ORIGINAL FETCHED CONTENT LENGTH ---`);
        console.log(`${data.originalContent.length} characters (Jina AI successfully fetched the site without being blocked)`);

        console.log(`\n✨ --- AI GENERATED SUMMARY ---`);
        console.log(data.summary);

        if (data.summary && data.summary.trim().length > 0) {
            console.log(`\n✅ End-to-End Test PASSED. The Cloudflare Worker is fully functional.`);
        } else {
            console.error(`\n❌ End-to-End Test FAILED. The summary was empty.`);
        }

    } catch (error) {
        console.error(`❌ Test failed with an unexpected error:`, error);
    }
}

runTest();
