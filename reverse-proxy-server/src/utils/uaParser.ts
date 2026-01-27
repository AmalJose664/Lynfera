export default function parseUA(userAgent: string) {
	if (!userAgent) return { browser: 'unknown', os: 'unknown' };

	let os = 'Other';
	if (userAgent.indexOf('Win') !== -1) os = 'Windows';
	else if (userAgent.indexOf('Mac') !== -1) {
		os = userAgent.indexOf('iPhone') !== -1 || userAgent.indexOf('iPad') !== -1 ? 'iOS' : 'macOS';
	}
	else if (userAgent.indexOf('Linux') !== -1) {
		os = userAgent.indexOf('Android') !== -1 ? 'Android' : 'Linux';
	}
	else if (userAgent.indexOf('Android') !== -1) os = 'Android';
	else if (userAgent.indexOf('iOS') !== -1) os = 'iOS';

	let browser = 'Other';
	if (userAgent.indexOf('Firefox') !== -1) browser = 'Firefox';
	else if (userAgent.indexOf('SamsungBrowser') !== -1) browser = 'Samsung Internet';
	else if (userAgent.indexOf('Opera') !== -1 || userAgent.indexOf('OPR') !== -1) browser = 'Opera';
	else if (userAgent.indexOf('Trident') !== -1) browser = 'Internet Explorer';
	else if (userAgent.indexOf('Edg') !== -1) browser = 'Microsoft Edge';
	else if (userAgent.indexOf('Chrome') !== -1) browser = 'Chrome';
	else if (userAgent.indexOf('Safari') !== -1) browser = 'Safari';

	return { browser, os };
}
