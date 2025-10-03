const https = require('https');
const { parseString } = require('xml2js');

const GDACS_FEED_URL = 'https://www.gdacs.org/rss.aspx?profile=ARCHIVE';

const alertsController = {
    getLiveAlerts: (req, res) => {
        https.get(GDACS_FEED_URL, (rssRes) => {
            let rssData = '';
            rssRes.on('data', (chunk) => rssData += chunk);
            rssRes.on('end', () => {
                parseString(rssData, { explicitArray: false }, (err, result) => {
                    if (err) {
                        console.error('Error parsing RSS feed:', err);
                        return res.status(500).json({ message: 'Error parsing RSS feed.' });
                    }
                    
                    try {
                        // Safely get the items
                        let items = result?.rss?.channel?.item || [];

                        // --- THIS IS THE FIX ---
                        // If 'items' is a single object (not an array), wrap it in an array
                        if (!Array.isArray(items)) {
                            items = [items];
                        }

                        const alerts = items.map(item => ({
                            title: item.title,
                            link: item.link,
                            description: item.description,
                            pubDate: item.pubDate,
                            lat: item['georss:point'] ? parseFloat(item['georss:point'].split(' ')[0]) : null,
                            lon: item['georss:point'] ? parseFloat(item['georss:point'].split(' ')[1]) : null,
                            eventType: item['gdacs:eventtype']
                        })).filter(alert => alert.lat && alert.lon);

                        res.status(200).json(alerts);
                    } catch (mapError) {
                        console.error('Error mapping RSS data:', mapError);
                        res.status(500).json({ message: 'Error processing disaster alert data.' });
                    }
                });
            });
        }).on('error', (err) => {
            console.error('Error fetching RSS feed:', err);
            res.status(500).json({ message: 'Error fetching RSS feed.' });
        });
    }
};

module.exports = alertsController;